const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const { status, customer_id, from, to, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['i.company_id = $1'];
    const params = [req.companyId];
    let idx = 2;

    if (status) { conditions.push(`i.status = $${idx++}`); params.push(status); }
    if (customer_id) { conditions.push(`i.customer_id = $${idx++}`); params.push(customer_id); }
    if (from) { conditions.push(`i.date >= $${idx++}`); params.push(from); }
    if (to) { conditions.push(`i.date <= $${idx++}`); params.push(to); }

    const where = conditions.join(' AND ');
    const result = await db.query(
      `SELECT i.*, c.name as customer_name
       FROM invoices i JOIN customers c ON c.id = i.customer_id
       WHERE ${where} ORDER BY i.date DESC, i.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const count = await db.query(`SELECT COUNT(*) FROM invoices i WHERE ${where}`, params);
    res.json({ data: result.rows, total: parseInt(count.rows[0].count), page: +page, limit: +limit });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { customer_id, number, date, due_date, lines, currency, notes } = req.body;
    if (!customer_id || !number || !date || !due_date || !lines?.length) {
      return res.status(400).json({ error: 'customer_id, number, date, due_date, lines are required' });
    }

    let subtotal = 0, tax_amount = 0;
    for (const l of lines) {
      const lineAmt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      const lineTax = lineAmt * (parseFloat(l.tax_rate || 0) / 100);
      subtotal += lineAmt;
      tax_amount += lineTax;
      l._amount = lineAmt;
    }
    const total = subtotal + tax_amount;

    const inv = await client.query(
      `INSERT INTO invoices (company_id, customer_id, number, date, due_date, subtotal, tax_amount, total, currency, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.companyId, customer_id, number, date, due_date, subtotal, tax_amount, total, currency || 'USD', notes || null]
    );
    const invoice = inv.rows[0];

    for (const l of lines) {
      await client.query(
        `INSERT INTO invoice_lines (invoice_id, description, quantity, unit_price, tax_rate, amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [invoice.id, l.description, l.quantity, l.unit_price, l.tax_rate || 0, l._amount]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(invoice);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT i.*, c.name as customer_name, c.email as customer_email
       FROM invoices i JOIN customers c ON c.id = i.customer_id
       WHERE i.id = $1 AND i.company_id = $2`,
      [req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Invoice not found' });

    const lines = await db.query(
      `SELECT * FROM invoice_lines WHERE invoice_id = $1 ORDER BY id`,
      [req.params.id]
    );
    res.json({ ...result.rows[0], lines: lines.rows });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { status } = await db.query(
      `SELECT status FROM invoices WHERE id = $1 AND company_id = $2`,
      [req.params.id, req.companyId]
    ).then(r => r.rows[0] || {});
    if (!status) return res.status(404).json({ error: 'Invoice not found' });
    if (status !== 'draft') return res.status(400).json({ error: 'Only draft invoices can be edited' });

    const { due_date, notes, currency } = req.body;
    const result = await db.query(
      `UPDATE invoices SET due_date = COALESCE($1, due_date), notes = COALESCE($2, notes),
       currency = COALESCE($3, currency) WHERE id = $4 AND company_id = $5 RETURNING *`,
      [due_date, notes, currency, req.params.id, req.companyId]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await db.query(
      `DELETE FROM invoices WHERE id = $1 AND company_id = $2 AND status = 'draft' RETURNING id`,
      [req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Draft invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) { next(err); }
};

exports.send = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE invoices SET status = 'sent' WHERE id = $1 AND company_id = $2 AND status = 'draft' RETURNING *`,
      [req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Draft invoice not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.recordPayment = async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { amount, date, method, reference } = req.body;
    if (!amount || !date) return res.status(400).json({ error: 'amount and date are required' });

    const invResult = await client.query(
      `SELECT * FROM invoices WHERE id = $1 AND company_id = $2`,
      [req.params.id, req.companyId]
    );
    const invoice = invResult.rows[0];
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (invoice.status === 'paid') return res.status(400).json({ error: 'Invoice already fully paid' });

    const newPaid = parseFloat(invoice.paid_amount) + parseFloat(amount);
    const newStatus = newPaid >= parseFloat(invoice.total) ? 'paid'
      : newPaid > 0 ? 'partial' : invoice.status;

    await client.query(
      `UPDATE invoices SET paid_amount = $1, status = $2 WHERE id = $3`,
      [newPaid, newStatus, invoice.id]
    );
    const payment = await client.query(
      `INSERT INTO payments (company_id, type, party_id, amount, date, method, reference)
       VALUES ($1,'receipt',$2,$3,$4,$5,$6) RETURNING *`,
      [req.companyId, invoice.customer_id, amount, date, method || 'bank_transfer', reference || null]
    );

    await client.query('COMMIT');
    res.json({ payment: payment.rows[0], invoice_status: newStatus });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.pdf = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT i.*, c.name as customer_name, c.email as customer_email, c.address as customer_address,
              co.name as company_name, co.trn as company_trn
       FROM invoices i
       JOIN customers c ON c.id = i.customer_id
       JOIN companies co ON co.id = i.company_id
       WHERE i.id = $1 AND i.company_id = $2`,
      [req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Invoice not found' });
    const inv = result.rows[0];
    const lines = await db.query(`SELECT * FROM invoice_lines WHERE invoice_id = $1`, [req.params.id]);

    const linesHtml = lines.rows.map(l =>
      `<tr><td>${l.description}</td><td>${l.quantity}</td><td>${l.unit_price}</td><td>${l.tax_rate}%</td><td>${l.amount}</td></tr>`
    ).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>body{font-family:Arial,sans-serif;padding:40px}table{width:100%;border-collapse:collapse}
th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f4f4f4}
.total{text-align:right;margin-top:20px}.header{display:flex;justify-content:space-between}</style>
</head><body>
<div class="header"><div><h1>${inv.company_name}</h1><p>TRN: ${inv.company_trn || 'N/A'}</p></div>
<div><h2>INVOICE #${inv.number}</h2><p>Date: ${inv.date}</p><p>Due: ${inv.due_date}</p></div></div>
<h3>Bill To: ${inv.customer_name}</h3><p>${inv.customer_email}</p><p>${inv.customer_address || ''}</p>
<table><thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Amount</th></tr></thead>
<tbody>${linesHtml}</tbody></table>
<div class="total"><p>Subtotal: ${inv.currency} ${inv.subtotal}</p>
<p>Tax: ${inv.currency} ${inv.tax_amount}</p>
<h3>Total: ${inv.currency} ${inv.total}</h3>
<p>Paid: ${inv.currency} ${inv.paid_amount}</p>
<h3>Balance Due: ${inv.currency} ${(inv.total - inv.paid_amount).toFixed(2)}</h3></div>
</body></html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) { next(err); }
};
