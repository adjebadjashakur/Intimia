const express = require('express');
const controller = require('../controllers/settingsController');

const router = express.Router();

router.get('/', controller.getSettings);
router.put('/profile', controller.updateProfile);
router.put('/password', controller.updatePassword);
router.put('/notifications', controller.updateNotifications);
router.delete('/', controller.removeAccount);

module.exports = router;
