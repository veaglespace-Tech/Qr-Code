const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('ADMIN', 'SUPERADMIN'));

router.get('/stats', adminController.getAdminStats);
router.post('/payouts', adminController.requestPayout);
router.put('/bank-details', adminController.updateBankDetails);

module.exports = router;
