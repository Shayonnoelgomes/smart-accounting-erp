const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['cn.company_id = $1'];
    const params = [req.companyId];
    let idx = 2;
    if (status) { conditions.push(`cn.status = $${idx++}`); params.push(status); }
    if (search) { conditions.push(`(c.name ILIKE $${idx} OR cn.number ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    const where = conditions.join(' AND ');
    const result = await db.query(
      `SELECT cn.*, c.name AS customer_name, i.number AS invoice_number
       FROM credit_notes cn
       JOIN customers c ON c.id = cn.customer_id
       LEFT JOIN invoices i ON i.id = cn.invoice_id
       WHERE ${where} ORDER BY cn.created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const count = await db.query(
      `SELECT COUNT(*) FROM credit_notes cn JOIN customers c ON c.id = cn.customer_id WHERE ${where}`, params
    );
    res.json({ data: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { customer_id, invoice_id, number, date, reason, lines = [] } = req.body;
    if (!customer_id || !number || !date) return res.status(400).json({ error: 'customer_id, number, date required' });
    let subtotal = 0, tax_amount = 0;
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      subtotal += amt;
      tax_amount += amt * (parseFloat(l.tax_rate) / 100);
    }
    const total = subtotal + tax_amount;
    const cn = await client.query(
      `INSERT INTO credit_notes (company_id, customer_id, invoice_id, number, date, reason, subtotal, tax_amount, total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.companyId, customer_id, invoice_id || null, number, date, reason || null, subtotal, tax_amount, total]
    );
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      await client.query(
        `INSERT INTO credit_note_lines (credit_note_id, description, quantity, unit_price, tax_rate, amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [cn.rows[0].id, l.description, l.quantity, l.unit_price, l.tax_rate || 0, amt]
      );
    }
    await client.query('COMMIT');
    res.status(201).json(cn.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const cn = await db.query(
      `SELECT cn.*, c.name AS customer_name FROM credit_notes cn JOIN customers c ON c.id = cn.customer_id
       WHERE cn.id=$1 AND cn.company_id=$2`, [req.params.id, req.companyId]
    );
    if (!cn.rows[0]) return res.status(404).json({ error: 'Credit note not found' });
    const lines = await db.query(`SELECT * FROM credit_note_lines WHERE credit_note_id=$1`, [req.params.id]);
    res.json({ ...cn.rows[0], lines: lines.rows });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { customer_id, invoice_id, date, reason, lines = [], status } = req.body;
    let subtotal = 0, tax_amount = 0;
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      subtotal += amt;
      tax_amount += amt * (parseFloat(l.tax_rate) / 100);
    }
    const total = subtotal + tax_amount;
    const cn = await client.query(
      `UPDATE credit_notes SET customer_id=COALESCE($1,customer_id), invoice_id=$2,
       date=COALESCE($3,date), reason=$4, subtotal=$5, tax_amount=$6, total=$7,
       status=COALESCE($8,status) WHERE id=$9 AND company_id=$10 RETURNING *`,
      [customer_id, invoice_id || null, date, reason || null, subtotal, tax_amount, total, status, req.params.id, req.companyId]
    );
    if (!cn.rows[0]) return res.status(404).json({ error: 'Credit note not found' });
    await client.query(`DELETE FROM credit_note_lines WHERE credit_note_id=$1`, [req.params.id]);
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      await client.query(
        `INSERT INTO credit_note_lines (credit_note_id, description, quantity, unit_price, tax_rate, amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [req.params.id, l.description, l.quantity, l.unit_price, l.tax_rate || 0, amt]
      );
    }
    await client.query('COMMIT');
    res.json(cn.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const cn = await db.query(`DELETE FROM credit_notes WHERE id=$1 AND company_id=$2 RETURNING id`, [req.params.id, req.companyId]);
    if (!cn.rows[0]) return res.status(404).json({ error: 'Credit note not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/:id/apply', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { invoice_id, amount } = req.body;
    if (!invoice_id || !amount) return res.status(400).json({ error: 'invoice_id and amount required' });
    const cn = await client.query(`SELECT * FROM credit_notes WHERE id=$1 AND company_id=$2`, [req.params.id, req.companyId]);
    if (!cn.rows[0]) return res.status(404).json({ error: 'Credit note not found' });
    const available = parseFloat(cn.rows[0].total) - parseFloat(cn.rows[0].applied_amount);
    if (parseFloat(amount) > available) return res.status(400).json({ error: 'Amount exceeds available credit' });
    await client.query(`UPDATE credit_notes SET applied_amount = applied_amount + $1, status='applied' WHERE id=$2`, [amount, req.params.id]);
    await client.query(`UPDATE invoices SET paid_amount = paid_amount + $1 WHERE id=$2`, [amount, invoice_id]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

module.exports = router;
