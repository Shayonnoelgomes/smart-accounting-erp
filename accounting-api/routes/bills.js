const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const { status, vendor_id, from, to, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['b.company_id = $1'];
    const params = [req.companyId];
    let idx = 2;
    if (status) { conditions.push(`b.status = $${idx++}`); params.push(status); }
    if (vendor_id) { conditions.push(`b.vendor_id = $${idx++}`); params.push(vendor_id); }
    if (from) { conditions.push(`b.date >= $${idx++}`); params.push(from); }
    if (to) { conditions.push(`b.date <= $${idx++}`); params.push(to); }
    const where = conditions.join(' AND ');
    const result = await db.query(
      `SELECT b.*, v.name as vendor_name FROM bills b JOIN vendors v ON v.id = b.vendor_id
       WHERE ${where} ORDER BY b.date DESC LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const count = await db.query(`SELECT COUNT(*) FROM bills b WHERE ${where}`, params);
    res.json({ data: result.rows, total: parseInt(count.rows[0].count), page: +page, limit: +limit });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { vendor_id, number, date, due_date, lines, notes } = req.body;
    if (!vendor_id || !number || !date || !due_date || !lines?.length) {
      return res.status(400).json({ error: 'vendor_id, number, date, due_date, lines are required' });
    }
    let total = 0;
    for (const l of lines) { l._amount = parseFloat(l.quantity || 1) * parseFloat(l.unit_price); total += l._amount; }
    const bill = await client.query(
      `INSERT INTO bills (company_id, vendor_id, number, date, due_date, total, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.companyId, vendor_id, number, date, due_date, total, notes || null]
    );
    for (const l of lines) {
      await client.query(
        `INSERT INTO bill_lines (bill_id, account_id, description, quantity, unit_price, amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [bill.rows[0].id, l.account_id || null, l.description, l.quantity || 1, l.unit_price, l._amount]
      );
    }
    await client.query('COMMIT');
    res.status(201).json(bill.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); } finally { client.release(); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT b.*, v.name as vendor_name FROM bills b JOIN vendors v ON v.id = b.vendor_id
       WHERE b.id = $1 AND b.company_id = $2`, [req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Bill not found' });
    const lines = await db.query(`SELECT * FROM bill_lines WHERE bill_id = $1`, [req.params.id]);
    res.json({ ...result.rows[0], lines: lines.rows });
  } catch (err) { next(err); }
});

router.put('/:id/approve', async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE bills SET status = 'approved' WHERE id = $1 AND company_id = $2 AND status = 'draft' RETURNING *`,
      [req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Draft bill not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/:id/payment', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { amount, date, method, reference } = req.body;
    if (!amount || !date) return res.status(400).json({ error: 'amount and date are required' });
    const billRes = await client.query(
      `SELECT * FROM bills WHERE id = $1 AND company_id = $2`, [req.params.id, req.companyId]
    );
    const bill = billRes.rows[0];
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    const newPaid = parseFloat(bill.paid_amount) + parseFloat(amount);
    const newStatus = newPaid >= parseFloat(bill.total) ? 'paid' : newPaid > 0 ? 'partial' : bill.status;
    await client.query(`UPDATE bills SET paid_amount=$1, status=$2 WHERE id=$3`, [newPaid, newStatus, bill.id]);
    const payment = await client.query(
      `INSERT INTO payments (company_id,type,party_id,amount,date,method,reference) VALUES ($1,'payment',$2,$3,$4,$5,$6) RETURNING *`,
      [req.companyId, bill.vendor_id, amount, date, method || 'bank_transfer', reference || null]
    );
    await client.query('COMMIT');
    res.json({ payment: payment.rows[0], bill_status: newStatus });
  } catch (err) { await client.query('ROLLBACK'); next(err); } finally { client.release(); }
});

module.exports = router;
