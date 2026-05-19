module.exports = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry: record already exists' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record not found' });
  }
  if (err.code === '23514') {
    return res.status(400).json({ error: 'Constraint violation: ' + err.detail });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ error: message });
};
