const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    company_id: user.company_id,
  };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { company_name, company_trn, base_currency, name, email, password } = req.body;
    if (!company_name || !name || !email || !password) {
      return res.status(400).json({ error: 'company_name, name, email, password are required' });
    }

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const companyResult = await client.query(
      `INSERT INTO companies (name, trn, base_currency) VALUES ($1, $2, $3) RETURNING *`,
      [company_name, company_trn || null, base_currency || 'USD']
    );
    const company = companyResult.rows[0];

    const password_hash = await bcrypt.hash(password, 12);
    const userResult = await client.query(
      `INSERT INTO users (company_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, 'admin') RETURNING id, company_id, name, email, role`,
      [company.id, name, email, password_hash]
    );
    const user = userResult.rows[0];

    await client.query(
      `INSERT INTO subscriptions (company_id, plan, status) VALUES ($1, 'free', 'trial')`,
      [company.id]
    );

    const { accessToken, refreshToken } = generateTokens(user);
    await client.query(`UPDATE users SET refresh_token = $1 WHERE id = $2`, [refreshToken, user.id]);

    await client.query('COMMIT');
    res.status(201).json({ user, company, accessToken, refreshToken });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await db.query(
      `SELECT u.*, c.name as company_name, c.base_currency FROM users u
       JOIN companies c ON c.id = u.company_id
       WHERE u.email = $1 AND u.is_active = true`,
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user);
    await db.query(`UPDATE users SET refresh_token = $1 WHERE id = $2`, [refreshToken, user.id]);

    const { password_hash, refresh_token, ...safeUser } = user;
    res.json({ user: safeUser, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const result = await db.query(
      `SELECT * FROM users WHERE id = $1 AND refresh_token = $2 AND is_active = true`,
      [decoded.id, refreshToken]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Refresh token revoked' });

    const tokens = generateTokens(user);
    await db.query(`UPDATE users SET refresh_token = $1 WHERE id = $2`, [tokens.refreshToken, user.id]);

    res.json(tokens);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db.query(`UPDATE users SET refresh_token = NULL WHERE refresh_token = $1`, [refreshToken]);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.company_id, u.created_at,
              c.name as company_name, c.base_currency, c.trn
       FROM users u JOIN companies c ON c.id = u.company_id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
