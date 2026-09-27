const express = require('express');
const controller = require('../controllers/avatarsController');
const { handleUpload } = require('../middleware/upload');

const router = express.Router();

router.get('/', controller.list);
router.put('/select', controller.select);
router.post('/upload', handleUpload(2), controller.upload);

module.exports = router;
