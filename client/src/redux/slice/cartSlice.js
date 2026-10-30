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

const getInitialPartnerInfo = () => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('re_partner_info');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  return null;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: getInitialCart(),
    referralCode: getInitialReferral(),
    partnerInfo: getInitialPartnerInfo(),
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
    setPartnerInfo: (state, action) => {
      state.partnerInfo = action.payload;
      if (action.payload?.referralCode) {
        state.referralCode = action.payload.referralCode;
      }
      if (typeof window !== 'undefined') {
        try {
          if (action.payload) {
            localStorage.setItem('re_partner_info', JSON.stringify(action.payload));
            if (action.payload.linkCode) localStorage.setItem('re_partner_link_code', action.payload.linkCode);
            if (action.payload.referralCode) localStorage.setItem('re_referral_code', action.payload.referralCode);
            // 30 day cookie
            document.cookie = `rx_partner_link=${encodeURIComponent(action.payload.linkCode || '')}; max-age=2592000; path=/`;
            document.cookie = `rx_partner_ref=${encodeURIComponent(action.payload.referralCode || '')}; max-age=2592000; path=/`;
          } else {
            localStorage.removeItem('re_partner_info');
            localStorage.removeItem('re_partner_link_code');
          }
        } catch {}
      }
    },
    clearPartnerInfo: (state) => {
      state.partnerInfo = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('re_partner_info');
        localStorage.removeItem('re_partner_link_code');
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
  setPartnerInfo,
  clearPartnerInfo,
  setBusinessCustomization,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
