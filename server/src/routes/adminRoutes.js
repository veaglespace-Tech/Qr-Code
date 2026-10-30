const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('ADMIN', 'SUPERADMIN'));

router.get('/stats', adminController.getAdminStats);
router.post('/payouts', adminController.requestPayout);
router.put('/bank-details', adminController.updateBankDetails);

// Partner product links
router.get('/product-links', adminController.getMyProductLinks);
router.post('/product-links', adminController.generateProductLink);
router.put('/product-links/:id/toggle', adminController.toggleProductLink);

module.exports = router;
