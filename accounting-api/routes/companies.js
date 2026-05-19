const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM companies WHERE id = $1`, [req.companyId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Company not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/', async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { name, trn, base_currency, financial_year_start } = req.body;
    const result = await db.query(
      `UPDATE companies SET
         name = COALESCE($1, name),
         trn = COALESCE($2, trn),
         base_currency = COALESCE($3, base_currency),
         financial_year_start = COALESCE($4, financial_year_start)
       WHERE id = $5 RETURNING *`,
      [name, trn, base_currency, financial_year_start, req.companyId]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.get('/users', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, role, is_active, created_at FROM users WHERE company_id = $1 ORDER BY name`,
      [req.companyId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

module.exports = router;
