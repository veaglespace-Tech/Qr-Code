const { describe, it } = require('node:test');
const assert = require('node:assert');

// Core pure financial calculation functions extracted from orderController & cart
function calculateSubtotal(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const rawSubtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return sum + (price * qty);
  }, 0);
  return parseFloat(rawSubtotal.toFixed(2));
}

function calculateGST(subtotal, gstPercent = 18, gstEnabled = true) {
  if (!gstEnabled || subtotal <= 0) return 0;
  return parseFloat(((subtotal * gstPercent) / 100).toFixed(2));
}

function calculateShipping(subtotal, freeShippingAbove = 999, standardFee = 60) {
  if (subtotal <= 0 || subtotal >= freeShippingAbove) return 0;
  return standardFee;
}

function calculatePartnerCommission(subtotal, commissionPercent = 15.0) {
  if (subtotal <= 0 || commissionPercent <= 0) return 0;
  return parseFloat(((subtotal * commissionPercent) / 100).toFixed(2));
}

function calculateFinalOrderAmount({ subtotal, gstAmount, shippingFee, discountAmount = 0 }) {
  return parseFloat((subtotal + gstAmount + shippingFee - discountAmount).toFixed(2));
}

function calculateGstBreakdown({ subtotal, gstPercent = 18, state = 'Maharashtra' }) {
  const isIntraState = state.trim().toLowerCase() === 'maharashtra';
  const totalGst = calculateGST(subtotal, gstPercent);

  if (isIntraState) {
    const halfRate = gstPercent / 2;
    const cgst = parseFloat((totalGst / 2).toFixed(2));
    const sgst = parseFloat((totalGst - cgst).toFixed(2));
    return {
      type: 'INTRA_STATE',
      cgstPercent: halfRate,
      cgstAmount: cgst,
      sgstPercent: halfRate,
      sgstAmount: sgst,
      igstPercent: 0,
      igstAmount: 0,
      totalGst
    };
  } else {
    return {
      type: 'INTER_STATE',
      cgstPercent: 0,
      cgstAmount: 0,
      sgstPercent: 0,
      sgstAmount: 0,
      igstPercent: gstPercent,
      igstAmount: totalGst,
      totalGst
    };
  }
}

describe('E-Commerce Financial & GST Calculations Unit Tests', () => {
  it('should calculate accurate subtotal for single and multiple cart items', () => {
    const singleItem = [{ price: 799, quantity: 1 }];
    assert.strictEqual(calculateSubtotal(singleItem), 799.00);

    const multipleItems = [
      { price: 799, quantity: 2 }, // 1598
      { price: 499, quantity: 3 }  // 1497
    ];
    assert.strictEqual(calculateSubtotal(multipleItems), 3095.00);
  });

  it('should calculate exact 18% GST with 2-decimal precision', () => {
    // 799 * 18% = 143.82
    assert.strictEqual(calculateGST(799, 18), 143.82);

    // 1499 * 18% = 269.82
    assert.strictEqual(calculateGST(1499, 18), 269.82);

    // 0 when disabled
    assert.strictEqual(calculateGST(799, 18, false), 0);
  });

  it('should apply free shipping above threshold (₹999) and charge standard fee below', () => {
    // Order below ₹999 -> ₹60 shipping
    assert.strictEqual(calculateShipping(799, 999, 60), 60);

    // Order exactly ₹999 -> Free shipping (₹0)
    assert.strictEqual(calculateShipping(999, 999, 60), 0);

    // Order above ₹999 -> Free shipping (₹0)
    assert.strictEqual(calculateShipping(1598, 999, 60), 0);

    // Empty order -> ₹0
    assert.strictEqual(calculateShipping(0, 999, 60), 0);
  });

  it('should calculate partner commission correctly (15% default or custom rate)', () => {
    // Default 15% on ₹799 = 119.85
    assert.strictEqual(calculatePartnerCommission(799, 15), 119.85);

    // Default 15% on ₹2000 = 300.00
    assert.strictEqual(calculatePartnerCommission(2000, 15), 300.00);

    // High-performing partner custom 20% on ₹1500 = 300.00
    assert.strictEqual(calculatePartnerCommission(1500, 20), 300.00);

    // 0 commission on subtotal of 0
    assert.strictEqual(calculatePartnerCommission(0, 15), 0);
  });

  it('should compute final payable amount accurately', () => {
    const subtotal = 799.00;
    const gstAmount = 143.82;
    const shippingFee = 60.00;
    const discountAmount = 0.00;

    const total = calculateFinalOrderAmount({ subtotal, gstAmount, shippingFee, discountAmount });
    // 799 + 143.82 + 60 = 1002.82
    assert.strictEqual(total, 1002.82);
  });

  it('should partition GST accurately for Intra-State (CGST 9% + SGST 9%) vs Inter-State (IGST 18%)', () => {
    const subtotal = 1000.00;

    // Intra-state (Maharashtra to Maharashtra)
    const mhBreakdown = calculateGstBreakdown({ subtotal, gstPercent: 18, state: 'Maharashtra' });
    assert.strictEqual(mhBreakdown.type, 'INTRA_STATE');
    assert.strictEqual(mhBreakdown.cgstPercent, 9);
    assert.strictEqual(mhBreakdown.sgstPercent, 9);
    assert.strictEqual(mhBreakdown.cgstAmount, 90.00);
    assert.strictEqual(mhBreakdown.sgstAmount, 90.00);
    assert.strictEqual(mhBreakdown.igstAmount, 0);
    assert.strictEqual(mhBreakdown.totalGst, 180.00);

    // Inter-state (Maharashtra to Gujarat / Karnataka / Delhi)
    const outBreakdown = calculateGstBreakdown({ subtotal, gstPercent: 18, state: 'Karnataka' });
    assert.strictEqual(outBreakdown.type, 'INTER_STATE');
    assert.strictEqual(outBreakdown.cgstAmount, 0);
    assert.strictEqual(outBreakdown.sgstAmount, 0);
    assert.strictEqual(outBreakdown.igstPercent, 18);
    assert.strictEqual(outBreakdown.igstAmount, 180.00);
    assert.strictEqual(outBreakdown.totalGst, 180.00);
  });
});

