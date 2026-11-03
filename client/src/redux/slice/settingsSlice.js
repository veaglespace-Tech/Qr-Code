'use client';

import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    data: {
      siteName: 'ReviewXpress',
      tagline: "India's #1 Smart NFC & QR Google Review Hardware Platform",
      supportEmail: 'info@veaglespace.com',
      supportPhone: '+91 8237999101',
      whatsappNumber: '918237999101',
      address: "'Kudale Patil Tower', Office No. 207, 2nd Floor, Jadhav Nagar, Near Shiv Temple, Vadgaon Budruk, Pune, Maharashtra 411041",
      gstEnabled: true,
      gstPercent: 18,
      defaultCommissionPercent: 15,
      announcementBanner: '',
      heroHeading: 'Get 10X More 5-Star Google Reviews on Autopilot',
      heroSubheading: 'Turn in-person customers into genuine 5-star Google Reviews with just 1 Tap (NFC) or 1 Scan (QR). Zero app required, 100% lifetime validity.',
      freeShippingAbove: 999,
      standardShippingFee: 60
    },
    loading: false
  },
  reducers: {
    updateLocalSettings: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(apiSlice.endpoints.getSettings.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(apiSlice.endpoints.getSettings.matchFulfilled, (state, { payload }) => {
        if (payload?.settings) {
          state.data = { ...state.data, ...payload.settings };
        }
        state.loading = false;
      })
      .addMatcher(apiSlice.endpoints.getSettings.matchRejected, (state) => {
        state.loading = false;
      })
      .addMatcher(apiSlice.endpoints.updateSettings.matchFulfilled, (state, { payload }) => {
        if (payload?.settings) {
          state.data = { ...state.data, ...payload.settings };
        }
      });
  }
});

export const { updateLocalSettings } = settingsSlice.actions;

// Compatibility thunk helper using RTK Query
export const fetchSettings = () => async (dispatch) => {
  try {
    const res = await dispatch(apiSlice.endpoints.getSettings.initiate()).unwrap();
    return res.settings;
  } catch (err) {
    return null;
  }
};

export default settingsSlice.reducer;
