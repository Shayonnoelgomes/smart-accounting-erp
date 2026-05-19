const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/dashboardController');

router.use(auth);

router.get('/summary', ctrl.summary);
router.get('/cashflow', ctrl.cashflow);
router.get('/aging', ctrl.aging);
router.get('/alerts', ctrl.alerts);

module.exports = router;
