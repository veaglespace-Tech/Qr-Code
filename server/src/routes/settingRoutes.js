const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, settingController.getSettings);
router.put('/', authenticate, authorize('SUPERADMIN'), settingController.updateSettings);
router.post('/contact', settingController.submitContact);

module.exports = router;
