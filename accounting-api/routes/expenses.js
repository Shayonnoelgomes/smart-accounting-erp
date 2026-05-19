const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['company_id = $1'];
    const params = [req.companyId];
    let idx = 2;
    if (status)   { conditions.push(`status = $${idx++}`);   params.push(status); }
    if (category) { conditions.push(`category = $${idx++}`); params.push(category); }
    if (search)   { conditions.push(`description ILIKE $${idx++}`); params.push(`%${search}%`); }
    const where = conditions.join(' AND ');
    const result = await db.query(
      `SELECT * FROM expenses WHERE ${where} ORDER BY date DESC LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const count = await db.query(`SELECT COUNT(*), SUM(amount) AS total_amount FROM expenses WHERE ${where}`, params);
    res.json({ data: result.rows, total: parseInt(count.rows[0].count), total_amount: parseFloat(count.rows[0].total_amount || 0) });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { category, amount, date, description, receipt_url } = req.body;
    if (!category || !amount || !date) return res.status(400).json({ error: 'category, amount, date required' });
    const result = await db.query(
      `INSERT INTO expenses (company_id, user_id, category, amount, date, description, receipt_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING *`,
      [req.companyId, req.userId, category, amount, date, description || null, receipt_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM expenses WHERE id=$1 AND company_id=$2`, [req.params.id, req.companyId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Expense not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { category, amount, date, description, receipt_url, status } = req.body;
    const result = await db.query(
      `UPDATE expenses SET category=COALESCE($1,category), amount=COALESCE($2,amount),
       date=COALESCE($3,date), description=$4, receipt_url=$5, status=COALESCE($6,status)
       WHERE id=$7 AND company_id=$8 RETURNING *`,
      [category, amount, date, description || null, receipt_url || null, status, req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Expense not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query(`DELETE FROM expenses WHERE id=$1 AND company_id=$2 RETURNING id`, [req.params.id, req.companyId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Expense not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.put('/:id/approve', async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE expenses SET status='approved' WHERE id=$1 AND company_id=$2 RETURNING *`,
      [req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Expense not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
