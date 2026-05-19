const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const { status, from, to, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['j.company_id = $1'];
    const params = [req.companyId];
    let idx = 2;

    if (status) { conditions.push(`j.status = $${idx++}`); params.push(status); }
    if (from) { conditions.push(`j.date >= $${idx++}`); params.push(from); }
    if (to) { conditions.push(`j.date <= $${idx++}`); params.push(to); }

    const where = conditions.join(' AND ');
    const result = await db.query(
      `SELECT j.*, u.name as created_by_name FROM journals j
       LEFT JOIN users u ON u.id = j.created_by
       WHERE ${where} ORDER BY j.date DESC, j.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset]
    );
    const count = await db.query(`SELECT COUNT(*) FROM journals j WHERE ${where}`, params);
    res.json({ data: result.rows, total: parseInt(count.rows[0].count), page: +page, limit: +limit });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { date, reference, narration, lines } = req.body;
    if (!date || !lines?.length) {
      return res.status(400).json({ error: 'date and lines are required' });
    }

    const totalDebit = lines.reduce((s, l) => s + parseFloat(l.debit || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + parseFloat(l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({ error: `Debits (${totalDebit}) must equal Credits (${totalCredit})` });
    }

    const journal = await client.query(
      `INSERT INTO journals (company_id, date, reference, narration, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.companyId, date, reference || null, narration || null, req.user.id]
    );
    const jId = journal.rows[0].id;

    for (const l of lines) {
      await client.query(
        `INSERT INTO journal_lines (journal_id, account_id, debit, credit, memo)
         VALUES ($1,$2,$3,$4,$5)`,
        [jId, l.account_id, l.debit || 0, l.credit || 0, l.memo || null]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(journal.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.post = async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const jResult = await client.query(
      `SELECT * FROM journals WHERE id = $1 AND company_id = $2`,
      [req.params.id, req.companyId]
    );
    const journal = jResult.rows[0];
    if (!journal) return res.status(404).json({ error: 'Journal not found' });
    if (journal.status !== 'draft') return res.status(400).json({ error: 'Only draft journals can be posted' });

    const lines = await client.query(`SELECT * FROM journal_lines WHERE journal_id = $1`, [journal.id]);

    for (const line of lines.rows) {
      const net = parseFloat(line.debit) - parseFloat(line.credit);
      await client.query(
        `UPDATE accounts SET balance = balance + $1 WHERE id = $2`,
        [net, line.account_id]
      );
    }

    const updated = await client.query(
      `UPDATE journals SET status = 'posted' WHERE id = $1 RETURNING *`,
      [journal.id]
    );
    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const jResult = await db.query(
      `SELECT j.*, u.name as created_by_name FROM journals j
       LEFT JOIN users u ON u.id = j.created_by
       WHERE j.id = $1 AND j.company_id = $2`,
      [req.params.id, req.companyId]
    );
    if (!jResult.rows[0]) return res.status(404).json({ error: 'Journal not found' });

    const lines = await db.query(
      `SELECT jl.*, a.code, a.name as account_name FROM journal_lines jl
       JOIN accounts a ON a.id = jl.account_id
       WHERE jl.journal_id = $1`,
      [req.params.id]
    );
    res.json({ ...jResult.rows[0], lines: lines.rows });
  } catch (err) { next(err); }
};
