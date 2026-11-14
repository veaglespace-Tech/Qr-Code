const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getRazorpayCredentials, verifyRazorpaySignature } = require('../lib/razorpay');
const {
  sendOrderConfirmationEmail,
  sendNewOrderAdminAlert,
  sendPartnerCommissionAlert
} = require('../utils/mailer');

/**
 * POST /api/razorpay/verify
 * Verifies razorpay payment signature & confirms the order
 */
router.post('/verify', asyncHandler(async (req, res) => {
  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  if (!orderId || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'Missing required payment verification details.');
  }

  const numericOrderId = parseInt(orderId, 10);
  const order = await prisma.order.findUnique({
    where: { id: numericOrderId }
  });

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  // If already paid, return success idempotent
  if (order.paymentStatus === 'paid') {
    return res.json({
      success: true,
      message: 'Order has already been confirmed as paid.',
      orderId: order.id
    });
  }

  const { keySecret } = await getRazorpayCredentials();

  // Signature check: razorpayOrderId can be from request or saved order
  const orderIdToVerify = razorpay_order_id || order.razorpayOrderId;
  const isValid = verifyRazorpaySignature({
    razorpayOrderId: orderIdToVerify,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    secret: keySecret
  });

  if (!isValid) {
    console.error(`[Razorpay Signature Mismatch] Order #${order.id}, rzpOrder: ${orderIdToVerify}, payment: ${razorpay_payment_id}`);
    throw new ApiError(400, 'Payment signature verification failed. Please contact support.');
  }

  // Update order status to paid
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'paid',
      orderStatus: 'customizing',
      paymentMethod: 'Razorpay Gateway',
      razorpayOrderId: orderIdToVerify,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      adminCommissionStatus: order.adminReferralId ? 'approved' : null
    },
    include: { user: true }
  });

  // Trigger online order confirmation emails asynchronously
  const items = updatedOrder.items ? (typeof updatedOrder.items === 'string' ? JSON.parse(updatedOrder.items) : updatedOrder.items) : [];
  sendOrderConfirmationEmail(updatedOrder, items).catch(err => console.error('[Razorpay Order Confirmation Email Error]', err));
  sendNewOrderAdminAlert(updatedOrder, items).catch(err => console.error('[Razorpay Admin Order Alert Error]', err));
  if (updatedOrder.adminReferralId && updatedOrder.adminCommissionAmount > 0) {
    prisma.user.findUnique({ where: { id: updatedOrder.adminReferralId } }).then(partner => {
      if (partner) sendPartnerCommissionAlert(partner, updatedOrder, updatedOrder.adminCommissionAmount);
    }).catch(err => console.error('[Razorpay Partner Commission Alert Error]', err));
  }

  // Set session cookie so customer immediately sees their orders in customer portal
  if (updatedOrder.user) {
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_KEY || process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { id: updatedOrder.user.id, email: updatedOrder.user.email, role: updatedOrder.user.role, name: updatedOrder.user.name },
      jwtSecret,
      { expiresIn: '30d' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
  }

  return res.json({
    success: true,
    message: 'Payment verified and order placed successfully!',
    orderId: updatedOrder.id
  });
}));

/**
 * POST /api/razorpay/webhook
 * Handles background server-to-server webhook notifications
 */
router.post('/webhook', asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (webhookSecret && signature) {
    const crypto = require('crypto');
    const expected = crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(req.body)).digest('hex');
    if (expected !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  }

  const event = req.body.event;
  if (event === 'payment.captured' || event === 'order.paid') {
    const payment = req.body.payload?.payment?.entity;
    const rzpOrderId = payment?.order_id;
    if (rzpOrderId) {
      const order = await prisma.order.findFirst({
        where: { razorpayOrderId: rzpOrderId }
      });
      if (order && order.paymentStatus !== 'paid') {
        const updated = await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'paid',
            orderStatus: 'customizing',
            razorpayPaymentId: payment.id,
            adminCommissionStatus: order.adminReferralId ? 'approved' : null
          }
        });
        const items = updated.items ? (typeof updated.items === 'string' ? JSON.parse(updated.items) : updated.items) : [];
        sendOrderConfirmationEmail(updated, items).catch(() => {});
        sendNewOrderAdminAlert(updated, items).catch(() => {});
      }
    }
  }

  return res.json({ status: 'ok' });
}));

module.exports = router;
