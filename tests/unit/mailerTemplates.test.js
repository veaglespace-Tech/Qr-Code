const { describe, it } = require('node:test');
const assert = require('node:assert');

const mailer = require('../../server/src/utils/mailer');

describe('Mailer Templates & Notification Pipelines Unit Tests', () => {
  it('sendVerificationEmail: should execute cleanly without throwing', async () => {
    const res = await mailer.sendVerificationEmail({
      to: 'partner.applicant@example.com',
      otp: '789123',
      name: 'Priya Sharma',
      type: 'registration'
    });

    assert.strictEqual(typeof res, 'object');
    assert.strictEqual(typeof res.delivered, 'boolean');
  });

  it('sendVerificationEmail: should support forgot_password reset mode', async () => {
    const res = await mailer.sendVerificationEmail({
      to: 'forgot.pass@example.com',
      otp: '456789',
      name: 'Amit Deshmukh',
      type: 'forgot_password'
    });

    assert.strictEqual(typeof res, 'object');
    assert.strictEqual(typeof res.delivered, 'boolean');
  });

  it('sendOrderConfirmationEmail: should execute customer order confirmation pipeline', async () => {
    const orderData = {
      orderNumber: 'RX-2026-0001',
      customerName: 'Kunal Patil',
      customerEmail: 'kunal.patil@example.com',
      customerPhone: '9876543210',
      businessName: 'Patil Cafe Pune',
      addressLine: 'Shop 4, FC Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411004',
      items: [
        { title: 'Custom Acrylic Stand (Dual NFC + QR)', price: 799, quantity: 1 }
      ],
      subtotal: 799,
      gstAmount: 143.82,
      shippingFee: 60,
      totalAmount: 1002.82,
      paymentMethod: 'Cash on Delivery (COD)'
    };

    const res = await mailer.sendOrderConfirmationEmail({ order: orderData });
    assert.strictEqual(typeof res, 'object');
    assert.strictEqual(typeof res.delivered, 'boolean');
  });

  it('sendNewOrderAdminAlert: should execute Superadmin alert pipeline with hardware specs', async () => {
    const orderData = {
      orderNumber: 'RX-2026-0001',
      customerName: 'Kunal Patil',
      customerEmail: 'kunal.patil@example.com',
      customerPhone: '9876543210',
      businessName: 'Patil Cafe Pune',
      googleReviewLink: 'https://g.page/r/patil-cafe/review',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411004',
      items: [{ title: 'Smart Stand', quantity: 2 }],
      totalAmount: 1726.00,
      paymentMethod: 'PayU Gateway'
    };

    const res = await mailer.sendNewOrderAdminAlert({
      order: orderData,
      adminEmail: 'admin.super@reviewexpress.com'
    });
    assert.strictEqual(typeof res, 'object');
    assert.strictEqual(typeof res.delivered, 'boolean');
  });

  it('sendPartnerCommissionAlert: should execute partner commission credit notification', async () => {
    const res = await mailer.sendPartnerCommissionAlert({
      partnerEmail: 'partner.org@example.com',
      partnerName: 'Veagle Space Partner',
      orderNumber: 'RX-2026-0001',
      orderSubtotal: 799.00,
      commissionAmount: 119.85,
      commissionPercent: 15.0,
      customerName: 'Kunal Patil'
    });

    assert.strictEqual(typeof res, 'object');
    assert.strictEqual(typeof res.delivered, 'boolean');
  });

  it('sendPayoutRequestEmails: should execute partner and admin payout request alerts', async () => {
    const res = await mailer.sendPayoutRequestEmails({
      partnerEmail: 'partner.org@example.com',
      partnerName: 'Veagle Space Partner',
      adminEmail: 'superadmin@reviewexpress.com',
      amount: 1500.00,
      upiId: 'partner@okaxis',
      bankDetails: 'SBI - Acc: 1234567890 (IFSC: SBIN0001234)'
    });

    assert.strictEqual(typeof res, 'object');
    assert.strictEqual(typeof res.delivered, 'boolean');
  });

  it('sendPayoutStatusUpdateEmail: should execute payout approval / paid confirmation', async () => {
    const res = await mailer.sendPayoutStatusUpdateEmail({
      partnerEmail: 'partner.org@example.com',
      partnerName: 'Veagle Space Partner',
      amount: 1500.00,
      status: 'PAID',
      transactionRef: 'UPI_BANK_REF_9988776655',
      remarks: 'Transferred via UPI IMPS'
    });

    assert.strictEqual(typeof res, 'object');
    assert.strictEqual(typeof res.delivered, 'boolean');
  });

  it('sendContactInquiryEmails: should execute admin inquiry alert and customer acknowledgement', async () => {
    const res = await mailer.sendContactInquiryEmails({
      name: 'Sunil Rao',
      email: 'sunil.rao@example.com',
      phone: '9822001122',
      subject: 'Bulk Stand Order for 10 Restaurant Branches',
      message: 'We need 20 custom stands with individual branch Google review links.'
    });

    assert.strictEqual(typeof res, 'object');
    assert.strictEqual(typeof res.delivered, 'boolean');
  });
});
