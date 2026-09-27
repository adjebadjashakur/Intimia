const express = require('express');
const controller = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', controller.overview);
router.get('/users', controller.users);
router.delete('/users/:id', controller.removeUser);

module.exports = router;
