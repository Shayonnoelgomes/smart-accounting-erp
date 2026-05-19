const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['q.company_id = $1'];
    const params = [req.companyId];
    let idx = 2;
    if (status) { conditions.push(`q.status = $${idx++}`); params.push(status); }
    if (search) { conditions.push(`(c.name ILIKE $${idx} OR q.number ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    const where = conditions.join(' AND ');
    const result = await db.query(
      `SELECT q.*, c.name AS customer_name
       FROM quotes q JOIN customers c ON c.id = q.customer_id
       WHERE ${where} ORDER BY q.created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const count = await db.query(
      `SELECT COUNT(*) FROM quotes q JOIN customers c ON c.id = q.customer_id WHERE ${where}`, params
    );
    res.json({ data: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { customer_id, number, date, expiry_date, lines = [], notes, terms } = req.body;
    if (!customer_id || !number || !date) return res.status(400).json({ error: 'customer_id, number, date required' });
    let subtotal = 0, tax_amount = 0;
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      subtotal += amt;
      tax_amount += amt * (parseFloat(l.tax_rate) / 100);
    }
    const total = subtotal + tax_amount;
    const q = await client.query(
      `INSERT INTO quotes (company_id, customer_id, number, date, expiry_date, subtotal, tax_amount, total, notes, terms)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.companyId, customer_id, number, date, expiry_date || null, subtotal, tax_amount, total, notes || null, terms || null]
    );
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      await client.query(
        `INSERT INTO quote_lines (quote_id, description, quantity, unit_price, tax_rate, amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [q.rows[0].id, l.description, l.quantity, l.unit_price, l.tax_rate || 0, amt]
      );
    }
    await client.query('COMMIT');
    res.status(201).json(q.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const q = await db.query(
      `SELECT q.*, c.name AS customer_name FROM quotes q JOIN customers c ON c.id = q.customer_id
       WHERE q.id = $1 AND q.company_id = $2`, [req.params.id, req.companyId]
    );
    if (!q.rows[0]) return res.status(404).json({ error: 'Quote not found' });
    const lines = await db.query(`SELECT * FROM quote_lines WHERE quote_id = $1`, [req.params.id]);
    res.json({ ...q.rows[0], lines: lines.rows });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { customer_id, date, expiry_date, lines = [], notes, terms, status } = req.body;
    let subtotal = 0, tax_amount = 0;
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      subtotal += amt;
      tax_amount += amt * (parseFloat(l.tax_rate) / 100);
    }
    const total = subtotal + tax_amount;
    const q = await client.query(
      `UPDATE quotes SET customer_id=COALESCE($1,customer_id), date=COALESCE($2,date),
       expiry_date=$3, subtotal=$4, tax_amount=$5, total=$6, notes=$7, terms=$8,
       status=COALESCE($9,status) WHERE id=$10 AND company_id=$11 RETURNING *`,
      [customer_id, date, expiry_date || null, subtotal, tax_amount, total, notes || null, terms || null, status, req.params.id, req.companyId]
    );
    if (!q.rows[0]) return res.status(404).json({ error: 'Quote not found' });
    await client.query(`DELETE FROM quote_lines WHERE quote_id = $1`, [req.params.id]);
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      await client.query(
        `INSERT INTO quote_lines (quote_id, description, quantity, unit_price, tax_rate, amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [req.params.id, l.description, l.quantity, l.unit_price, l.tax_rate || 0, amt]
      );
    }
    await client.query('COMMIT');
    res.json(q.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const q = await db.query(
      `DELETE FROM quotes WHERE id=$1 AND company_id=$2 RETURNING id`, [req.params.id, req.companyId]
    );
    if (!q.rows[0]) return res.status(404).json({ error: 'Quote not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/:id/convert', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const qr = await client.query(
      `SELECT q.*, array_agg(row_to_json(ql)) AS lines FROM quotes q
       LEFT JOIN quote_lines ql ON ql.quote_id = q.id
       WHERE q.id=$1 AND q.company_id=$2 GROUP BY q.id`,
      [req.params.id, req.companyId]
    );
    if (!qr.rows[0]) return res.status(404).json({ error: 'Quote not found' });
    const quote = qr.rows[0];
    const { due_date } = req.body;
    const invNum = `INV-${Date.now().toString().slice(-6)}`;
    const inv = await client.query(
      `INSERT INTO invoices (company_id, customer_id, number, date, due_date, subtotal, tax_amount, total, notes, status, currency)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'draft','USD') RETURNING *`,
      [req.companyId, quote.customer_id, invNum, quote.date, due_date || quote.expiry_date || quote.date, quote.subtotal, quote.tax_amount, quote.total, quote.notes]
    );
    for (const l of (quote.lines || [])) {
      if (!l) continue;
      await client.query(
        `INSERT INTO invoice_lines (invoice_id, description, quantity, unit_price, tax_rate, amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [inv.rows[0].id, l.description, l.quantity, l.unit_price, l.tax_rate || 0, l.amount]
      );
    }
    await client.query(`UPDATE quotes SET status='converted', converted_invoice_id=$1 WHERE id=$2`, [inv.rows[0].id, req.params.id]);
    await client.query('COMMIT');
    res.json({ invoice: inv.rows[0] });
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

module.exports = router;
