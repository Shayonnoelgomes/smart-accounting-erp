const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT a.*, p.name as parent_name FROM accounts a
       LEFT JOIN accounts p ON p.id = a.parent_id
       WHERE a.company_id = $1 ORDER BY a.code`,
      [req.companyId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { code, name, type, parent_id } = req.body;
    if (!code || !name || !type) return res.status(400).json({ error: 'code, name, type are required' });
    const result = await db.query(
      `INSERT INTO accounts (company_id, code, name, type, parent_id) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.companyId, code, name, type, parent_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, is_active } = req.body;
    const result = await db.query(
      `UPDATE accounts SET name = COALESCE($1, name), is_active = COALESCE($2, is_active)
       WHERE id = $3 AND company_id = $4 RETURNING *`,
      [name, is_active, req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Account not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.get('/:id/transactions', async (req, res, next) => {
  try {
    const { from, to, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    const params = [req.params.id, req.companyId];
    let idx = 3;
    let dateFilter = '';
    if (from) { dateFilter += ` AND j.date >= $${idx++}`; params.push(from); }
    if (to)   { dateFilter += ` AND j.date <= $${idx++}`; params.push(to); }

    const result = await db.query(
      `SELECT jl.debit, jl.credit, jl.memo, j.date, j.reference, j.narration, j.status
       FROM journal_lines jl
       JOIN journals j ON j.id = jl.journal_id
       JOIN accounts a ON a.id = jl.account_id
       WHERE jl.account_id = $1 AND a.company_id = $2 ${dateFilter}
       ORDER BY j.date DESC LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

module.exports = router;
