const express = require('express');
const controller = require('../controllers/dashboardController');

const router = express.Router();

router.get('/stats', controller.stats);

module.exports = router;
