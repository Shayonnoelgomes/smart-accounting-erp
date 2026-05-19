const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/journalController');

router.use(auth);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id/post', ctrl.post);

module.exports = router;
