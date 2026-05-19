const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const { type, from, to, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['company_id = $1'];
    const params = [req.companyId];
    let idx = 2;
    if (type) { conditions.push(`type = $${idx++}`); params.push(type); }
    if (from) { conditions.push(`date >= $${idx++}`); params.push(from); }
    if (to)   { conditions.push(`date <= $${idx++}`); params.push(to); }
    const where = conditions.join(' AND ');
    const result = await db.query(
      `SELECT * FROM payments WHERE ${where} ORDER BY date DESC LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const count = await db.query(`SELECT COUNT(*) FROM payments WHERE ${where}`, params);
    res.json({ data: result.rows, total: parseInt(count.rows[0].count), page: +page, limit: +limit });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { type, party_id, amount, date, method, reference, notes } = req.body;
    if (!type || !party_id || !amount || !date) {
      return res.status(400).json({ error: 'type, party_id, amount, date are required' });
    }
    const result = await db.query(
      `INSERT INTO payments (company_id, type, party_id, amount, date, method, reference, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.companyId, type, party_id, amount, date, method || 'bank_transfer', reference || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM payments WHERE id = $1 AND company_id = $2`, [req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Payment not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
