const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/invoiceController');

router.use(auth);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/send', ctrl.send);
router.post('/:id/payment', ctrl.recordPayment);
router.get('/:id/pdf', ctrl.pdf);

module.exports = router;
