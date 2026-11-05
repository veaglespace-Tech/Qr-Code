const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadminController');
const couponController = require('../controllers/couponController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('SUPERADMIN'));

router.get('/analytics', superadminController.getAnalytics);
router.get('/admins', superadminController.getAllAdmins);
router.get('/admins/:id', superadminController.getAdminById);
router.put('/admins/:id', superadminController.updateAdmin);
router.delete('/admins/:id', superadminController.deleteAdmin);
router.get('/users', superadminController.getAllUsers);
router.get('/users/:id', superadminController.getUserById);
router.put('/users/:id', superadminController.updateUser);
router.delete('/users/:id', superadminController.deleteUser);
router.get('/payouts', superadminController.getAllPayouts);
router.put('/payouts/:id', superadminController.updatePayoutStatus);

// Coupons & Promo Codes
router.get('/coupons', couponController.getAllCoupons);
router.post('/coupons', couponController.createCoupon);
router.put('/coupons/:id', couponController.updateCoupon);
router.delete('/coupons/:id', couponController.deleteCoupon);

module.exports = router;
