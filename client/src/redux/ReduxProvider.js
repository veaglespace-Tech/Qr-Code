'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect } from 'react';
import { checkAuth } from './slice/authSlice';
import { fetchSettings } from './slice/settingsSlice';
import { setReferralCode } from './slice/cartSlice';
import { ToastProvider } from '@/context/ToastContext';


function AppInitializer({ children }) {
  useEffect(() => {
    store.dispatch(checkAuth());
    store.dispatch(fetchSettings());

    // Auto capture referral code from URL query parameter ?ref=CODE
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        store.dispatch(setReferralCode(ref.toUpperCase()));
      }
    }
  }, []);

  return children;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AppInitializer>{children}</AppInitializer>
      </ToastProvider>
    </Provider>
  );
}
