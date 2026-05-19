const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const params = [req.companyId];
    let where = 'company_id = $1 AND is_active = true';
    if (search) { where += ' AND (name ILIKE $2 OR email ILIKE $2)'; params.push(`%${search}%`); }
    const result = await db.query(
      `SELECT * FROM vendors WHERE ${where} ORDER BY name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    const count = await db.query(`SELECT COUNT(*) FROM vendors WHERE ${where}`, params);
    res.json({ data: result.rows, total: parseInt(count.rows[0].count), page: +page, limit: +limit });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const result = await db.query(
      `INSERT INTO vendors (company_id, name, email, phone, address) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.companyId, name, email || null, phone || null, address || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM vendors WHERE id = $1 AND company_id = $2`, [req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Vendor not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, phone, address, is_active } = req.body;
    const result = await db.query(
      `UPDATE vendors SET name = COALESCE($1,name), email = COALESCE($2,email),
       phone = COALESCE($3,phone), address = COALESCE($4,address), is_active = COALESCE($5,is_active)
       WHERE id = $6 AND company_id = $7 RETURNING *`,
      [name, email, phone, address, is_active, req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Vendor not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.get('/:id/bills', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM bills WHERE vendor_id = $1 AND company_id = $2 ORDER BY date DESC`,
      [req.params.id, req.companyId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

module.exports = router;
