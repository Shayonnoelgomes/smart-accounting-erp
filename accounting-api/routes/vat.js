const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM vat_returns WHERE company_id = $1 ORDER BY period_end DESC`,
      [req.companyId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { period_start, period_end } = req.body;
    if (!period_start || !period_end) return res.status(400).json({ error: 'period_start and period_end required' });
    const cid = req.companyId;

    const [outputVat, inputVat] = await Promise.all([
      db.query(
        `SELECT COALESCE(SUM(tax_amount),0) as vat FROM invoices
         WHERE company_id=$1 AND date BETWEEN $2 AND $3 AND status != 'void'`,
        [cid, period_start, period_end]
      ),
      db.query(
        `SELECT COALESCE(SUM(bl.amount * 0.05),0) as vat FROM bill_lines bl
         JOIN bills b ON b.id = bl.bill_id
         WHERE b.company_id=$1 AND b.date BETWEEN $2 AND $3 AND b.status != 'void'`,
        [cid, period_start, period_end]
      ),
    ]);

    const result = await db.query(
      `INSERT INTO vat_returns (company_id, period_start, period_end, output_vat, input_vat)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [cid, period_start, period_end,
       parseFloat(outputVat.rows[0].vat), parseFloat(inputVat.rows[0].vat)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM vat_returns WHERE id = $1 AND company_id = $2`, [req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'VAT return not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id/submit', async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE vat_returns SET status = 'submitted' WHERE id = $1 AND company_id = $2 AND status = 'draft' RETURNING *`,
      [req.params.id, req.companyId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Draft VAT return not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
