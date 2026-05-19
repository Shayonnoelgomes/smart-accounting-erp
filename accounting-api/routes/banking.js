const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM bank_accounts WHERE company_id = $1 AND is_active = true ORDER BY name`,
      [req.companyId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, account_number, bank_name, currency, balance } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const result = await db.query(
      `INSERT INTO bank_accounts (company_id, name, account_number, bank_name, currency, balance)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.companyId, name, account_number || null, bank_name || null, currency || 'USD', balance || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.get('/:id/transactions', async (req, res, next) => {
  try {
    const { from, to, reconciled, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['bt.bank_account_id = $1'];
    const params = [req.params.id];
    let idx = 2;
    if (from) { conditions.push(`bt.date >= $${idx++}`); params.push(from); }
    if (to)   { conditions.push(`bt.date <= $${idx++}`); params.push(to); }
    if (reconciled !== undefined) { conditions.push(`bt.reconciled = $${idx++}`); params.push(reconciled === 'true'); }
    const where = conditions.join(' AND ');
    const result = await db.query(
      `SELECT bt.* FROM bank_transactions bt
       JOIN bank_accounts ba ON ba.id = bt.bank_account_id AND ba.company_id = $${idx}
       WHERE ${where} ORDER BY bt.date DESC LIMIT $${idx + 1} OFFSET $${idx + 2}`,
      [...params, req.companyId, limit, offset]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/:id/transactions', async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { date, description, amount, type } = req.body;
    if (!date || !amount || !type) return res.status(400).json({ error: 'date, amount, type are required' });
    const baRes = await client.query(
      `SELECT id FROM bank_accounts WHERE id = $1 AND company_id = $2`, [req.params.id, req.companyId]
    );
    if (!baRes.rows[0]) return res.status(404).json({ error: 'Bank account not found' });
    const tx = await client.query(
      `INSERT INTO bank_transactions (bank_account_id, date, description, amount, type)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.id, date, description || null, amount, type]
    );
    const delta = type === 'credit' ? parseFloat(amount) : -parseFloat(amount);
    await client.query(`UPDATE bank_accounts SET balance = balance + $1 WHERE id = $2`, [delta, req.params.id]);
    await client.query('COMMIT');
    res.status(201).json(tx.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); } finally { client.release(); }
});

router.put('/:accountId/transactions/:txId/reconcile', async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE bank_transactions SET reconciled = true
       WHERE id = $1 AND bank_account_id = $2 RETURNING *`,
      [req.params.txId, req.params.accountId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Transaction not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
