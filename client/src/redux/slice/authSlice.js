'use client';

import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    initialized: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.initialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Listen to RTK Query getMe
    builder
      .addMatcher(apiSlice.endpoints.getMe.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(apiSlice.endpoints.getMe.matchFulfilled, (state, { payload }) => {
        state.user = payload.user || null;
        state.loading = false;
        state.initialized = true;
      })
      .addMatcher(apiSlice.endpoints.getMe.matchRejected, (state) => {
        state.user = null;
        state.loading = false;
        state.initialized = true;
      })
      // Listen to RTK Query login
      .addMatcher(apiSlice.endpoints.login.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(apiSlice.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.user = payload.user || null;
        state.loading = false;
        state.error = null;
      })
      .addMatcher(apiSlice.endpoints.login.matchRejected, (state, { error, payload }) => {
        state.loading = false;
        state.error = payload?.data?.error || error?.message || 'Login failed';
      })
      // Listen to RTK Query logout
      .addMatcher(apiSlice.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      // Listen to RTK Query updateProfile
      .addMatcher(apiSlice.endpoints.updateProfile.matchFulfilled, (state, { payload }) => {
        if (payload?.user) {
          state.user = payload.user;
        }
      });
  }
});

export const { setUser, clearError, setAuthLoading } = authSlice.actions;

// Compatibility thunk helpers using RTK Query
export const checkAuth = () => async (dispatch) => {
  try {
    const result = await dispatch(apiSlice.endpoints.getMe.initiate(undefined, { forceRefetch: true })).unwrap();
    return result.user;
  } catch (err) {
    return null;
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await dispatch(apiSlice.endpoints.logout.initiate()).unwrap();
  } catch (err) {
    // ignore
  }
};

export default authSlice.reducer;
