const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.use(auth);

router.get('/profit-loss', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to date required' });
    const cid = req.companyId;

    const revenue = await db.query(
      `SELECT a.code, a.name, COALESCE(SUM(jl.credit - jl.debit), 0) as amount
       FROM accounts a
       LEFT JOIN journal_lines jl ON jl.account_id = a.id
       LEFT JOIN journals j ON j.id = jl.journal_id AND j.status = 'posted' AND j.date BETWEEN $2 AND $3
       WHERE a.company_id = $1 AND a.type = 'revenue'
       GROUP BY a.id ORDER BY a.code`,
      [cid, from, to]
    );
    const expenses = await db.query(
      `SELECT a.code, a.name, COALESCE(SUM(jl.debit - jl.credit), 0) as amount
       FROM accounts a
       LEFT JOIN journal_lines jl ON jl.account_id = a.id
       LEFT JOIN journals j ON j.id = jl.journal_id AND j.status = 'posted' AND j.date BETWEEN $2 AND $3
       WHERE a.company_id = $1 AND a.type = 'expense'
       GROUP BY a.id ORDER BY a.code`,
      [cid, from, to]
    );

    const totalRevenue = revenue.rows.reduce((s, r) => s + parseFloat(r.amount), 0);
    const totalExpenses = expenses.rows.reduce((s, r) => s + parseFloat(r.amount), 0);
    res.json({
      from, to,
      revenue: revenue.rows,
      expenses: expenses.rows,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
    });
  } catch (err) { next(err); }
});

router.get('/balance-sheet', async (req, res, next) => {
  try {
    const { as_at } = req.query;
    const date = as_at || new Date().toISOString().split('T')[0];
    const cid = req.companyId;

    const rows = await db.query(
      `SELECT a.type, a.code, a.name,
         COALESCE(SUM(jl.debit - jl.credit), 0) as balance
       FROM accounts a
       LEFT JOIN journal_lines jl ON jl.account_id = a.id
       LEFT JOIN journals j ON j.id = jl.journal_id AND j.status = 'posted' AND j.date <= $2
       WHERE a.company_id = $1 AND a.type IN ('asset','liability','equity')
       GROUP BY a.id ORDER BY a.type, a.code`,
      [cid, date]
    );

    const grouped = rows.rows.reduce((acc, r) => {
      if (!acc[r.type]) acc[r.type] = [];
      acc[r.type].push(r);
      return acc;
    }, {});

    const totalAssets = (grouped.asset || []).reduce((s, r) => s + parseFloat(r.balance), 0);
    const totalLiabilities = (grouped.liability || []).reduce((s, r) => s + parseFloat(r.balance), 0);
    const totalEquity = (grouped.equity || []).reduce((s, r) => s + parseFloat(r.balance), 0);

    res.json({ as_at: date, assets: grouped.asset || [], liabilities: grouped.liability || [],
      equity: grouped.equity || [], totalAssets, totalLiabilities, totalEquity });
  } catch (err) { next(err); }
});

router.get('/trial-balance', async (req, res, next) => {
  try {
    const { as_at } = req.query;
    const date = as_at || new Date().toISOString().split('T')[0];
    const cid = req.companyId;

    const result = await db.query(
      `SELECT a.code, a.name, a.type,
         COALESCE(SUM(jl.debit),0) as total_debit,
         COALESCE(SUM(jl.credit),0) as total_credit,
         COALESCE(SUM(jl.debit - jl.credit),0) as net
       FROM accounts a
       LEFT JOIN journal_lines jl ON jl.account_id = a.id
       LEFT JOIN journals j ON j.id = jl.journal_id AND j.status = 'posted' AND j.date <= $2
       WHERE a.company_id = $1
       GROUP BY a.id ORDER BY a.code`,
      [cid, date]
    );

    const totalDebit = result.rows.reduce((s, r) => s + parseFloat(r.total_debit), 0);
    const totalCredit = result.rows.reduce((s, r) => s + parseFloat(r.total_credit), 0);
    res.json({ as_at: date, accounts: result.rows, totalDebit, totalCredit, balanced: Math.abs(totalDebit - totalCredit) < 0.01 });
  } catch (err) { next(err); }
});

router.get('/ar-aging', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT i.number, c.name as customer_name, i.due_date, i.total, i.paid_amount,
         i.total - i.paid_amount as balance,
         CURRENT_DATE - i.due_date as days_overdue
       FROM invoices i JOIN customers c ON c.id = i.customer_id
       WHERE i.company_id = $1 AND i.status IN ('sent','partial','overdue')
       ORDER BY days_overdue DESC`,
      [req.companyId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/ap-aging', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT b.number, v.name as vendor_name, b.due_date, b.total, b.paid_amount,
         b.total - b.paid_amount as balance,
         CURRENT_DATE - b.due_date as days_overdue
       FROM bills b JOIN vendors v ON v.id = b.vendor_id
       WHERE b.company_id = $1 AND b.status IN ('approved','partial','overdue')
       ORDER BY days_overdue DESC`,
      [req.companyId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

module.exports = router;
