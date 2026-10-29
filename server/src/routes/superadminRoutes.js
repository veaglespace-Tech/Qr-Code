const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('SUPERADMIN'));

router.get('/analytics', superadminController.getAnalytics);
router.get('/admins', superadminController.getAllAdmins);
router.put('/admins/:id', superadminController.updateAdmin);
router.get('/users', superadminController.getAllUsers);
router.get('/payouts', superadminController.getAllPayouts);
router.put('/payouts/:id', superadminController.updatePayoutStatus);

module.exports = router;
