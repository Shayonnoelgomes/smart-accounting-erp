const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['so.company_id = $1'];
    const params = [req.companyId];
    let idx = 2;
    if (status) { conditions.push(`so.status = $${idx++}`); params.push(status); }
    if (search) { conditions.push(`(c.name ILIKE $${idx} OR so.number ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    const where = conditions.join(' AND ');
    const result = await db.query(
      `SELECT so.*, c.name AS customer_name
       FROM sales_orders so JOIN customers c ON c.id = so.customer_id
       WHERE ${where} ORDER BY so.created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const count = await db.query(
      `SELECT COUNT(*) FROM sales_orders so JOIN customers c ON c.id = so.customer_id WHERE ${where}`, params
    );
    res.json({ data: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { customer_id, number, order_date, delivery_date, shipping_address, lines = [], notes } = req.body;
    if (!customer_id || !number || !order_date) return res.status(400).json({ error: 'customer_id, number, order_date required' });
    let subtotal = 0, tax_amount = 0;
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      subtotal += amt;
      tax_amount += amt * (parseFloat(l.tax_rate) / 100);
    }
    const total = subtotal + tax_amount;
    const so = await client.query(
      `INSERT INTO sales_orders (company_id, customer_id, number, order_date, delivery_date, shipping_address, subtotal, tax_amount, total, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.companyId, customer_id, number, order_date, delivery_date || null, shipping_address || null, subtotal, tax_amount, total, notes || null]
    );
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      await client.query(
        `INSERT INTO sales_order_lines (sales_order_id, description, quantity, unit_price, tax_rate, amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [so.rows[0].id, l.description, l.quantity, l.unit_price, l.tax_rate || 0, amt]
      );
    }
    await client.query('COMMIT');
    res.status(201).json(so.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const so = await db.query(
      `SELECT so.*, c.name AS customer_name FROM sales_orders so JOIN customers c ON c.id = so.customer_id
       WHERE so.id=$1 AND so.company_id=$2`, [req.params.id, req.companyId]
    );
    if (!so.rows[0]) return res.status(404).json({ error: 'Sales order not found' });
    const lines = await db.query(`SELECT * FROM sales_order_lines WHERE sales_order_id=$1`, [req.params.id]);
    res.json({ ...so.rows[0], lines: lines.rows });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { customer_id, order_date, delivery_date, shipping_address, lines = [], notes, status } = req.body;
    let subtotal = 0, tax_amount = 0;
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      subtotal += amt;
      tax_amount += amt * (parseFloat(l.tax_rate) / 100);
    }
    const total = subtotal + tax_amount;
    const so = await client.query(
      `UPDATE sales_orders SET customer_id=COALESCE($1,customer_id), order_date=COALESCE($2,order_date),
       delivery_date=$3, shipping_address=$4, subtotal=$5, tax_amount=$6, total=$7, notes=$8,
       status=COALESCE($9,status) WHERE id=$10 AND company_id=$11 RETURNING *`,
      [customer_id, order_date, delivery_date || null, shipping_address || null, subtotal, tax_amount, total, notes || null, status, req.params.id, req.companyId]
    );
    if (!so.rows[0]) return res.status(404).json({ error: 'Sales order not found' });
    await client.query(`DELETE FROM sales_order_lines WHERE sales_order_id=$1`, [req.params.id]);
    for (const l of lines) {
      const amt = parseFloat(l.quantity) * parseFloat(l.unit_price);
      await client.query(
        `INSERT INTO sales_order_lines (sales_order_id, description, quantity, unit_price, tax_rate, amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [req.params.id, l.description, l.quantity, l.unit_price, l.tax_rate || 0, amt]
      );
    }
    await client.query('COMMIT');
    res.json(so.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const so = await db.query(`DELETE FROM sales_orders WHERE id=$1 AND company_id=$2 RETURNING id`, [req.params.id, req.companyId]);
    if (!so.rows[0]) return res.status(404).json({ error: 'Sales order not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/:id/convert', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const sor = await client.query(
      `SELECT so.*, array_agg(row_to_json(sol)) AS lines FROM sales_orders so
       LEFT JOIN sales_order_lines sol ON sol.sales_order_id = so.id
       WHERE so.id=$1 AND so.company_id=$2 GROUP BY so.id`,
      [req.params.id, req.companyId]
    );
    if (!sor.rows[0]) return res.status(404).json({ error: 'Sales order not found' });
    const so = sor.rows[0];
    const { due_date } = req.body;
    const invNum = `INV-${Date.now().toString().slice(-6)}`;
    const inv = await client.query(
      `INSERT INTO invoices (company_id, customer_id, number, date, due_date, subtotal, tax_amount, total, notes, status, currency)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'draft','USD') RETURNING *`,
      [req.companyId, so.customer_id, invNum, so.order_date, due_date || so.delivery_date || so.order_date, so.subtotal, so.tax_amount, so.total, so.notes]
    );
    for (const l of (so.lines || [])) {
      if (!l) continue;
      await client.query(
        `INSERT INTO invoice_lines (invoice_id, description, quantity, unit_price, tax_rate, amount)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [inv.rows[0].id, l.description, l.quantity, l.unit_price, l.tax_rate || 0, l.amount]
      );
    }
    await client.query(`UPDATE sales_orders SET status='converted', converted_invoice_id=$1 WHERE id=$2`, [inv.rows[0].id, req.params.id]);
    await client.query('COMMIT');
    res.json({ invoice: inv.rows[0] });
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

module.exports = router;
