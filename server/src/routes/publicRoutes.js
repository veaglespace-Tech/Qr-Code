const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public: resolve a partner-product link
router.get('/:linkCode', publicController.resolveProductLink);

module.exports = router;

