const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['po.company_id = $1'];
    const params = [req.companyId];
    let idx = 2;
    if (status) { conditions.push(`po.status = $${idx++}`); params.push(status); }
    if (search) { conditions.push(`(v.name ILIKE $${idx} OR po.number ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    const where = conditions.join(' AND ');
    const result = await db.query(
      `SELECT po.*, v.name AS vendor_name
       FROM purchase_orders po JOIN vendors v ON v.id = po.vendor_id
       WHERE ${where} ORDER BY po.created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const count = await db.query(
      `SELECT COUNT(*) FROM purchase_orders po JOIN vendors v ON v.id = po.vendor_id WHERE ${where}`, params
    );
    res.json({ data: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { vendor_id, number, order_date, delivery_date, delivery_address, lines = [], notes } = req.body;
    if (!vendor_id || !number || !order_date) return res.status(400).json({ error: 'vendor_id, number, order_date required' });
    let subtotal = 0, tax_amount = 0;
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      subtotal += amt;
      tax_amount += amt * (parseFloat(l.tax_rate) / 100);
    }
    const total = subtotal + tax_amount;
    const po = await client.query(
      `INSERT INTO purchase_orders (company_id, vendor_id, number, order_date, delivery_date, delivery_address, subtotal, tax_amount, total, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.companyId, vendor_id, number, order_date, delivery_date || null, delivery_address || null, subtotal, tax_amount, total, notes || null]
    );
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      await client.query(
        `INSERT INTO purchase_order_lines (purchase_order_id, description, quantity, unit_price, tax_rate, amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [po.rows[0].id, l.description, l.quantity, l.unit_price, l.tax_rate || 0, amt]
      );
    }
    await client.query('COMMIT');
    res.status(201).json(po.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const po = await db.query(
      `SELECT po.*, v.name AS vendor_name FROM purchase_orders po JOIN vendors v ON v.id = po.vendor_id
       WHERE po.id=$1 AND po.company_id=$2`, [req.params.id, req.companyId]
    );
    if (!po.rows[0]) return res.status(404).json({ error: 'Purchase order not found' });
    const lines = await db.query(`SELECT * FROM purchase_order_lines WHERE purchase_order_id=$1`, [req.params.id]);
    res.json({ ...po.rows[0], lines: lines.rows });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { vendor_id, order_date, delivery_date, delivery_address, lines = [], notes, status } = req.body;
    let subtotal = 0, tax_amount = 0;
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      subtotal += amt;
      tax_amount += amt * (parseFloat(l.tax_rate) / 100);
    }
    const total = subtotal + tax_amount;
    const po = await client.query(
      `UPDATE purchase_orders SET vendor_id=COALESCE($1,vendor_id), order_date=COALESCE($2,order_date),
       delivery_date=$3, delivery_address=$4, subtotal=$5, tax_amount=$6, total=$7, notes=$8,
       status=COALESCE($9,status) WHERE id=$10 AND company_id=$11 RETURNING *`,
      [vendor_id, order_date, delivery_date || null, delivery_address || null, subtotal, tax_amount, total, notes || null, status, req.params.id, req.companyId]
    );
    if (!po.rows[0]) return res.status(404).json({ error: 'Purchase order not found' });
    await client.query(`DELETE FROM purchase_order_lines WHERE purchase_order_id=$1`, [req.params.id]);
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      await client.query(
        `INSERT INTO purchase_order_lines (purchase_order_id, description, quantity, unit_price, tax_rate, amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [req.params.id, l.description, l.quantity, l.unit_price, l.tax_rate || 0, amt]
      );
    }
    await client.query('COMMIT');
    res.json(po.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const po = await db.query(`DELETE FROM purchase_orders WHERE id=$1 AND company_id=$2 RETURNING id`, [req.params.id, req.companyId]);
    if (!po.rows[0]) return res.status(404).json({ error: 'Purchase order not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/:id/convert', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const por = await client.query(
      `SELECT po.*, array_agg(row_to_json(pol)) AS lines FROM purchase_orders po
       LEFT JOIN purchase_order_lines pol ON pol.purchase_order_id = po.id
       WHERE po.id=$1 AND po.company_id=$2 GROUP BY po.id`,
      [req.params.id, req.companyId]
    );
    if (!por.rows[0]) return res.status(404).json({ error: 'Purchase order not found' });
    const po = por.rows[0];
    const { due_date } = req.body;
    const billNum = `BILL-${Date.now().toString().slice(-6)}`;
    const bill = await client.query(
      `INSERT INTO bills (company_id, vendor_id, number, date, due_date, total, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'draft') RETURNING *`,
      [req.companyId, po.vendor_id, billNum, po.order_date, due_date || po.delivery_date || po.order_date, po.total, po.notes]
    );
    for (const l of (po.lines || [])) {
      if (!l) continue;
      await client.query(
        `INSERT INTO bill_lines (bill_id, description, quantity, unit_price, amount)
         VALUES ($1,$2,$3,$4,$5)`,
        [bill.rows[0].id, l.description, l.quantity, l.unit_price, l.amount]
      );
    }
    await client.query(`UPDATE purchase_orders SET status='converted', converted_bill_id=$1 WHERE id=$2`, [bill.rows[0].id, req.params.id]);
    await client.query('COMMIT');
    res.json({ bill: bill.rows[0] });
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

module.exports = router;
