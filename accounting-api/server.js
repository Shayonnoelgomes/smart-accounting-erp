require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const accountsRoutes = require('./routes/accounts');
const journalsRoutes = require('./routes/journals');
const invoicesRoutes = require('./routes/invoices');
const billsRoutes = require('./routes/bills');
const paymentsRoutes = require('./routes/payments');
const customersRoutes = require('./routes/customers');
const vendorsRoutes = require('./routes/vendors');
const inventoryRoutes = require('./routes/inventory');
const bankingRoutes = require('./routes/banking');
const vatRoutes = require('./routes/vat');
const reportsRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/journals', journalsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/banking', bankingRoutes);
app.use('/api/vat', vatRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Smart Accounting API running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app;
