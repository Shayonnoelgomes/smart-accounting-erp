const db = require('../db');

exports.summary = async (req, res, next) => {
  try {
    const cid = req.companyId;
    const [revenue, expenses, cashBalance, arBalance, apBalance] = await Promise.all([
      db.query(
        `SELECT COALESCE(SUM(total),0) as value FROM invoices WHERE company_id=$1 AND status IN ('sent','partial','paid') AND date >= date_trunc('month', CURRENT_DATE)`,
        [cid]
      ),
      db.query(
        `SELECT COALESCE(SUM(total),0) as value FROM bills WHERE company_id=$1 AND status IN ('approved','partial','paid') AND date >= date_trunc('month', CURRENT_DATE)`,
        [cid]
      ),
      db.query(
        `SELECT COALESCE(SUM(balance),0) as value FROM bank_accounts WHERE company_id=$1 AND is_active=true`,
        [cid]
      ),
      db.query(
        `SELECT COALESCE(SUM(total - paid_amount),0) as value FROM invoices WHERE company_id=$1 AND status IN ('sent','partial','overdue')`,
        [cid]
      ),
      db.query(
        `SELECT COALESCE(SUM(total - paid_amount),0) as value FROM bills WHERE company_id=$1 AND status IN ('approved','partial','overdue')`,
        [cid]
      ),
    ]);

    const rev = parseFloat(revenue.rows[0].value);
    const exp = parseFloat(expenses.rows[0].value);
    res.json({
      revenue: rev,
      expenses: exp,
      profit: rev - exp,
      cashBalance: parseFloat(cashBalance.rows[0].value),
      arBalance: parseFloat(arBalance.rows[0].value),
      apBalance: parseFloat(apBalance.rows[0].value),
    });
  } catch (err) { next(err); }
};

exports.cashflow = async (req, res, next) => {
  try {
    const cid = req.companyId;
    const result = await db.query(
      `SELECT
         DATE_TRUNC('week', date) as week,
         COALESCE(SUM(CASE WHEN type='receipt' THEN amount ELSE 0 END),0) as inflow,
         COALESCE(SUM(CASE WHEN type='payment' THEN amount ELSE 0 END),0) as outflow
       FROM payments
       WHERE company_id=$1 AND date >= CURRENT_DATE - INTERVAL '12 weeks'
       GROUP BY week ORDER BY week`,
      [cid]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.aging = async (req, res, next) => {
  try {
    const cid = req.companyId;
    const [ar, ap] = await Promise.all([
      db.query(
        `SELECT
           SUM(CASE WHEN CURRENT_DATE - due_date <= 0 THEN total-paid_amount ELSE 0 END) as current,
           SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 1 AND 30 THEN total-paid_amount ELSE 0 END) as days_1_30,
           SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 31 AND 60 THEN total-paid_amount ELSE 0 END) as days_31_60,
           SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 61 AND 90 THEN total-paid_amount ELSE 0 END) as days_61_90,
           SUM(CASE WHEN CURRENT_DATE - due_date > 90 THEN total-paid_amount ELSE 0 END) as over_90
         FROM invoices WHERE company_id=$1 AND status IN ('sent','partial','overdue')`,
        [cid]
      ),
      db.query(
        `SELECT
           SUM(CASE WHEN CURRENT_DATE - due_date <= 0 THEN total-paid_amount ELSE 0 END) as current,
           SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 1 AND 30 THEN total-paid_amount ELSE 0 END) as days_1_30,
           SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 31 AND 60 THEN total-paid_amount ELSE 0 END) as days_31_60,
           SUM(CASE WHEN CURRENT_DATE - due_date BETWEEN 61 AND 90 THEN total-paid_amount ELSE 0 END) as days_61_90,
           SUM(CASE WHEN CURRENT_DATE - due_date > 90 THEN total-paid_amount ELSE 0 END) as over_90
         FROM bills WHERE company_id=$1 AND status IN ('approved','partial','overdue')`,
        [cid]
      ),
    ]);
    res.json({ ar: ar.rows[0], ap: ap.rows[0] });
  } catch (err) { next(err); }
};

exports.alerts = async (req, res, next) => {
  try {
    const cid = req.companyId;
    const [overdueInvoices, pendingBills, vatDue, lowInventory] = await Promise.all([
      db.query(
        `SELECT i.id, i.number, c.name as customer_name, i.total - i.paid_amount as balance, i.due_date
         FROM invoices i JOIN customers c ON c.id = i.customer_id
         WHERE i.company_id=$1 AND i.due_date < CURRENT_DATE AND i.status IN ('sent','partial')
         ORDER BY i.due_date LIMIT 10`,
        [cid]
      ),
      db.query(
        `SELECT b.id, b.number, v.name as vendor_name, b.total - b.paid_amount as balance, b.due_date
         FROM bills b JOIN vendors v ON v.id = b.vendor_id
         WHERE b.company_id=$1 AND b.due_date < CURRENT_DATE AND b.status IN ('approved','partial')
         ORDER BY b.due_date LIMIT 10`,
        [cid]
      ),
      db.query(
        `SELECT id, period_end, net_vat FROM vat_returns
         WHERE company_id=$1 AND status='draft' ORDER BY period_end LIMIT 5`,
        [cid]
      ),
      db.query(
        `SELECT id, sku, name, quantity, reorder_level FROM inventory_items
         WHERE company_id=$1 AND quantity <= reorder_level AND is_active=true LIMIT 10`,
        [cid]
      ),
    ]);
    res.json({
      overdueInvoices: overdueInvoices.rows,
      pendingBills: pendingBills.rows,
      vatDue: vatDue.rows,
      lowInventory: lowInventory.rows,
    });
  } catch (err) { next(err); }
};
