const express = require('express');
const controller = require('../controllers/routineController');

const router = express.Router();

router.get('/', controller.list);
router.post('/', controller.create);
router.patch('/:id/toggle', controller.toggle);
router.delete('/:id', controller.remove);

module.exports = router;
