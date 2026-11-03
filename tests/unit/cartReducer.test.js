const { describe, it } = require('node:test');
const assert = require('node:assert');

const cartModule = require('../../client/src/redux/slice/cartSlice');
const cartReducer = cartModule.default;
const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setReferralCode,
  setPartnerInfo,
  clearPartnerInfo,
  clearCart
} = cartModule;

describe('Redux Cart Reducer Unit Tests', () => {
  const getCleanInitialState = () => ({
    items: [],
    referralCode: '',
    partnerInfo: null,
    businessName: '',
    googleReviewLink: ''
  });

  const sampleProduct = {
    id: 1,
    slug: 'acrylic-nfc-stand',
    title: 'ReviewXpress Smart NFC Stand',
    price: 799,
    originalPrice: 1499,
    image: 'https://example.com/stand.png'
  };

  it('addToCart: should add a new product to an empty cart with customizations', () => {
    const initialState = getCleanInitialState();
    const action = addToCart({
      product: sampleProduct,
      quantity: 2,
      customization: {
        businessName: 'Cafe Oasis Pune',
        googleReviewLink: 'https://g.page/r/example/review'
      }
    });

    const nextState = cartReducer(initialState, action);

    assert.strictEqual(nextState.items.length, 1);
    const item = nextState.items[0];
    assert.strictEqual(item.id, 1);
    assert.strictEqual(item.title, sampleProduct.title);
    assert.strictEqual(item.price, 799);
    assert.strictEqual(item.quantity, 2);
    assert.strictEqual(item.businessName, 'Cafe Oasis Pune');
    assert.strictEqual(item.googleReviewLink, 'https://g.page/r/example/review');
  });

  it('addToCart: should increment quantity if product is already in cart', () => {
    const stateWithOne = {
      ...getCleanInitialState(),
      items: [{
        id: 1,
        slug: 'acrylic-nfc-stand',
        title: 'ReviewXpress Smart NFC Stand',
        price: 799,
        quantity: 2
      }]
    };

    const action = addToCart({
      product: sampleProduct,
      quantity: 3
    });

    const nextState = cartReducer(stateWithOne, action);

    assert.strictEqual(nextState.items.length, 1);
    assert.strictEqual(nextState.items[0].quantity, 5); // 2 + 3 = 5
  });

  it('updateQuantity: should modify quantity and ensure minimum is 1', () => {
    const stateWithOne = {
      ...getCleanInitialState(),
      items: [{
        id: 1,
        price: 799,
        quantity: 3
      }]
    };

    // Update to 7
    const updatedState = cartReducer(stateWithOne, updateQuantity({ id: 1, quantity: 7 }));
    assert.strictEqual(updatedState.items[0].quantity, 7);

    // Negative or 0 quantity should clamp to minimum 1
    const clampedState = cartReducer(stateWithOne, updateQuantity({ id: 1, quantity: 0 }));
    assert.strictEqual(clampedState.items[0].quantity, 1);
  });

  it('removeFromCart: should remove item by id', () => {
    const stateWithTwo = {
      ...getCleanInitialState(),
      items: [
        { id: 1, title: 'Item 1', price: 799 },
        { id: 2, title: 'Item 2', price: 499 }
      ]
    };

    const nextState = cartReducer(stateWithTwo, removeFromCart(1));
    assert.strictEqual(nextState.items.length, 1);
    assert.strictEqual(nextState.items[0].id, 2);
  });

  it('setReferralCode: should store referral code', () => {
    const initialState = getCleanInitialState();
    const nextState = cartReducer(initialState, setReferralCode('PARTNER99'));
    assert.strictEqual(nextState.referralCode, 'PARTNER99');
  });

  it('setPartnerInfo: should attach partner object and sync referral code', () => {
    const initialState = getCleanInitialState();
    const partnerPayload = {
      linkCode: 'LN-ABC-123',
      name: 'Veagle Space Partner',
      referralCode: 'VEAGLE15',
      partnerId: 5
    };

    const nextState = cartReducer(initialState, setPartnerInfo(partnerPayload));
    assert.deepStrictEqual(nextState.partnerInfo, partnerPayload);
    assert.strictEqual(nextState.referralCode, 'VEAGLE15');
  });

  it('clearPartnerInfo: should reset partnerInfo and referralCode', () => {
    const stateWithPartner = {
      ...getCleanInitialState(),
      partnerInfo: { name: 'Some Partner' },
      referralCode: 'PARTNER123'
    };

    const clearedState = cartReducer(stateWithPartner, clearPartnerInfo());
    assert.strictEqual(clearedState.partnerInfo, null);
    assert.strictEqual(clearedState.referralCode, '');
  });

  it('clearCart: should empty all items from cart', () => {
    const stateWithItems = {
      ...getCleanInitialState(),
      items: [{ id: 1 }, { id: 2 }]
    };

    const clearedState = cartReducer(stateWithItems, clearCart());
    assert.deepStrictEqual(clearedState.items, []);
  });
});
