import { createSlice } from '@reduxjs/toolkit';

const getInitialCart = () => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('re_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const getInitialReferral = () => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('re_referral_code') || '';
    } catch {
      return '';
    }
  }
  return '';
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: getInitialCart(),
    referralCode: getInitialReferral(),
    businessName: '',
    googleReviewLink: '',
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, customization = {} } = action.payload;
      const existingIdx = state.items.findIndex(i => i.id === product.id);

      if (existingIdx > -1) {
        state.items[existingIdx].quantity += quantity;
        if (customization.businessName) state.items[existingIdx].businessName = customization.businessName;
        if (customization.googleReviewLink) state.items[existingIdx].googleReviewLink = customization.googleReviewLink;
      } else {
        state.items.push({
          id: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          quantity,
          businessName: customization.businessName || '',
          googleReviewLink: customization.googleReviewLink || ''
        });
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('re_cart', JSON.stringify(state.items));
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem('re_cart', JSON.stringify(state.items));
      }
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('re_cart', JSON.stringify(state.items));
      }
    },
    setReferralCode: (state, action) => {
      state.referralCode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('re_referral_code', action.payload);
      }
    },
    setBusinessCustomization: (state, action) => {
      const { businessName, googleReviewLink } = action.payload;
      if (businessName !== undefined) state.businessName = businessName;
      if (googleReviewLink !== undefined) state.googleReviewLink = googleReviewLink;
    },
    clearCart: (state) => {
      state.items = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('re_cart');
      }
    }
  }
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setReferralCode,
  setBusinessCustomization,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
