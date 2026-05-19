const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['vc.company_id = $1'];
    const params = [req.companyId];
    let idx = 2;
    if (status) { conditions.push(`vc.status = $${idx++}`); params.push(status); }
    if (search) { conditions.push(`(v.name ILIKE $${idx} OR vc.number ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    const where = conditions.join(' AND ');
    const result = await db.query(
      `SELECT vc.*, v.name AS vendor_name, b.number AS bill_number
       FROM vendor_credits vc
       JOIN vendors v ON v.id = vc.vendor_id
       LEFT JOIN bills b ON b.id = vc.bill_id
       WHERE ${where} ORDER BY vc.created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const count = await db.query(
      `SELECT COUNT(*) FROM vendor_credits vc JOIN vendors v ON v.id = vc.vendor_id WHERE ${where}`, params
    );
    res.json({ data: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { vendor_id, bill_id, number, date, reason, lines = [] } = req.body;
    if (!vendor_id || !number || !date) return res.status(400).json({ error: 'vendor_id, number, date required' });
    let subtotal = 0, tax_amount = 0;
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      subtotal += amt;
      tax_amount += amt * (parseFloat(l.tax_rate) / 100);
    }
    const total = subtotal + tax_amount;
    const vc = await client.query(
      `INSERT INTO vendor_credits (company_id, vendor_id, bill_id, number, date, reason, subtotal, tax_amount, total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.companyId, vendor_id, bill_id || null, number, date, reason || null, subtotal, tax_amount, total]
    );
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      await client.query(
        `INSERT INTO vendor_credit_lines (vendor_credit_id, description, quantity, unit_price, tax_rate, amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [vc.rows[0].id, l.description, l.quantity, l.unit_price, l.tax_rate || 0, amt]
      );
    }
    await client.query('COMMIT');
    res.status(201).json(vc.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const vc = await db.query(
      `SELECT vc.*, v.name AS vendor_name FROM vendor_credits vc JOIN vendors v ON v.id = vc.vendor_id
       WHERE vc.id=$1 AND vc.company_id=$2`, [req.params.id, req.companyId]
    );
    if (!vc.rows[0]) return res.status(404).json({ error: 'Vendor credit not found' });
    const lines = await db.query(`SELECT * FROM vendor_credit_lines WHERE vendor_credit_id=$1`, [req.params.id]);
    res.json({ ...vc.rows[0], lines: lines.rows });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { vendor_id, bill_id, date, reason, lines = [], status } = req.body;
    let subtotal = 0, tax_amount = 0;
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      subtotal += amt;
      tax_amount += amt * (parseFloat(l.tax_rate) / 100);
    }
    const total = subtotal + tax_amount;
    const vc = await client.query(
      `UPDATE vendor_credits SET vendor_id=COALESCE($1,vendor_id), bill_id=$2,
       date=COALESCE($3,date), reason=$4, subtotal=$5, tax_amount=$6, total=$7,
       status=COALESCE($8,status) WHERE id=$9 AND company_id=$10 RETURNING *`,
      [vendor_id, bill_id || null, date, reason || null, subtotal, tax_amount, total, status, req.params.id, req.companyId]
    );
    if (!vc.rows[0]) return res.status(404).json({ error: 'Vendor credit not found' });
    await client.query(`DELETE FROM vendor_credit_lines WHERE vendor_credit_id=$1`, [req.params.id]);
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      await client.query(
        `INSERT INTO vendor_credit_lines (vendor_credit_id, description, quantity, unit_price, tax_rate, amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [req.params.id, l.description, l.quantity, l.unit_price, l.tax_rate || 0, amt]
      );
    }
    await client.query('COMMIT');
    res.json(vc.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const vc = await db.query(`DELETE FROM vendor_credits WHERE id=$1 AND company_id=$2 RETURNING id`, [req.params.id, req.companyId]);
    if (!vc.rows[0]) return res.status(404).json({ error: 'Vendor credit not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/:id/apply', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { bill_id, amount } = req.body;
    if (!bill_id || !amount) return res.status(400).json({ error: 'bill_id and amount required' });
    const vc = await client.query(`SELECT * FROM vendor_credits WHERE id=$1 AND company_id=$2`, [req.params.id, req.companyId]);
    if (!vc.rows[0]) return res.status(404).json({ error: 'Vendor credit not found' });
    const available = parseFloat(vc.rows[0].total) - parseFloat(vc.rows[0].applied_amount);
    if (parseFloat(amount) > available) return res.status(400).json({ error: 'Amount exceeds available credit' });
    await client.query(`UPDATE vendor_credits SET applied_amount = applied_amount + $1, status='applied' WHERE id=$2`, [amount, req.params.id]);
    await client.query(`UPDATE bills SET paid_amount = paid_amount + $1 WHERE id=$2`, [amount, bill_id]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

module.exports = router;
