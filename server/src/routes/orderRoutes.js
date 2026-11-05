const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

router.post('/apply-coupon', couponController.applyCoupon);
router.post('/', optionalAuth, orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id', authenticate, authorize('SUPERADMIN'), orderController.updateOrder);

module.exports = router;
