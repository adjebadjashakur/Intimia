const express = require('express');
const controller = require('../controllers/galleryController');
const { handleUpload } = require('../middleware/upload');

const router = express.Router();

router.get('/', controller.list);
router.post('/', handleUpload(5), controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
