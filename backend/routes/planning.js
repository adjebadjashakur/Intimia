const express = require('express');
const controller = require('../controllers/planningController');

const router = express.Router();

router.get('/', controller.list);
router.put('/', controller.upsert);
router.delete('/:id', controller.remove);

module.exports = router;
