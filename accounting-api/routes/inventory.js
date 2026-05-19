const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['company_id = $1', 'is_active = true'];
    const params = [req.companyId];
    let idx = 2;
    if (search) { conditions.push(`(name ILIKE $${idx} OR sku ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (category) { conditions.push(`category = $${idx++}`); params.push(category); }
    const where = conditions.join(' AND ');
    const result = await db.query(
      `SELECT * FROM inventory_items WHERE ${where} ORDER BY name LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const count = await db.query(`SELECT COUNT(*) FROM inventory_items WHERE ${where}`, params);
    res.json({ data: result.rows, total: parseInt(count.rows[0].count), page: +page, limit: +limit });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { sku, name, category, unit_cost, selling_price, quantity, reorder_level, valuation_method } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const result = await db.query(
      `INSERT INTO inventory_items (company_id, sku, name, category, unit_cost, selling_price, quantity, reorder_level, valuation_method)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.companyId, sku || null, name, category || null, unit_cost || 0,
       selling_price || 0, quantity || 0, reorder_level || 0, valuation_method || 'FIFO']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM inventory_items WHERE id = $1 AND company_id = $2`, [req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, category, unit_cost, selling_price, quantity, reorder_level, is_active } = req.body;
    const result = await db.query(
      `UPDATE inventory_items SET
         name = COALESCE($1,name), category = COALESCE($2,category),
         unit_cost = COALESCE($3,unit_cost), selling_price = COALESCE($4,selling_price),
         quantity = COALESCE($5,quantity), reorder_level = COALESCE($6,reorder_level),
         is_active = COALESCE($7,is_active)
       WHERE id = $8 AND company_id = $9 RETURNING *`,
      [name, category, unit_cost, selling_price, quantity, reorder_level, is_active, req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.get('/low-stock', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM inventory_items WHERE company_id = $1 AND quantity <= reorder_level AND is_active = true ORDER BY quantity`,
      [req.companyId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

module.exports = router;
