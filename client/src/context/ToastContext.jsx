'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

/**
 * Transforms raw API or backend errors into clear, user-friendly messages
 */
export function formatUserFriendlyError(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';

  let raw = '';
  if (typeof error === 'string') {
    raw = error;
  } else if (error?.data?.error) {
    raw = error.data.error;
  } else if (error?.data?.message) {
    raw = error.data.message;
  } else if (error?.message) {
    raw = error.message;
  } else {
    raw = JSON.stringify(error);
  }

  const lower = raw.toLowerCase();

  if (lower.includes('invalid email or password') || lower.includes('invalid credentials') || lower.includes('incorrect password')) {
    return 'Incorrect email/mobile or password. Please verify your details or click "Forgot Password?" to reset.';
  }

  if (lower.includes('no account found')) {
    return 'No account was found with this email or mobile number. Please verify or register a new account.';
  }

  if (lower.includes('security captcha') || lower.includes('security verification') || lower.includes('calculation')) {
    return 'Security calculation answer was incorrect. Please solve the new math question.';
  }

  if (lower.includes('invalid or expired') || lower.includes('incorrect verification code') || lower.includes('expired otp')) {
    return 'The 6-digit code entered is incorrect or has expired. Please check your latest email and try again.';
  }

  if (lower.includes('already exists')) {
    return 'An account with this email address is already registered. Please sign in or reset your password.';
  }

  if (lower.includes('deactivated') || lower.includes('inactive')) {
    return 'Your account is currently inactive. Please contact ReviewXpress support.';
  }

  if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('connection refused')) {
    return 'Unable to reach the server. Please check your internet connection.';
  }

  if (lower.includes('at least 6 characters') || lower.includes('password must')) {
    return 'Password must be at least 6 characters long.';
  }

  return raw;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4500 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const friendlyMessage = type === 'error' ? formatUserFriendlyError(message) : message;

    const newToast = {
      id,
      type,
      title: title || (type === 'error' ? 'Notice' : type === 'success' ? 'Success' : 'Information'),
      message: friendlyMessage,
      duration
    };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    error: (message, title) => addToast({ type: 'error', message, title: title || 'Error' }),
    success: (message, title) => addToast({ type: 'success', message, title: title || 'Success' }),
    info: (message, title) => addToast({ type: 'info', message, title: title || 'Info' }),
    warning: (message, title) => addToast({ type: 'warning', message, title: title || 'Warning' })
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.toast = toast;
    }
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="assertive"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2 sm:px-0"
      >
        {toasts.map((t) => {
          const isError = t.type === 'error';
          const isSuccess = t.type === 'success';
          const isWarning = t.type === 'warning';

          const borderStyle = isError
            ? 'border-red-200 bg-white/95 text-red-950 shadow-red-500/10'
            : isSuccess
            ? 'border-emerald-200 bg-white/95 text-emerald-950 shadow-emerald-500/10'
            : isWarning
            ? 'border-amber-200 bg-white/95 text-amber-950 shadow-amber-500/10'
            : 'border-slate-200 bg-white/95 text-slate-900 shadow-slate-500/10';

          const iconContainer = isError
            ? 'bg-red-100 text-red-600'
            : isSuccess
            ? 'bg-emerald-100 text-emerald-600'
            : isWarning
            ? 'bg-amber-100 text-amber-600'
            : 'bg-brand-100 text-brand-600';

          return (
            <div
              key={t.id}
              role="alert"
              className={`pointer-events-auto rounded-2xl p-4 border shadow-xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${borderStyle}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconContainer}`}>
                {isError && <AlertCircle className="w-4 h-4" />}
                {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                {isWarning && <AlertTriangle className="w-4 h-4" />}
                {!isError && !isSuccess && !isWarning && <Info className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <div className="text-xs font-black tracking-tight">{t.title}</div>
                <div className="text-xs mt-0.5 leading-relaxed text-slate-700 break-words font-medium">
                  {t.message}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-1 -mr-1 -mt-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if invoked outside provider
    return {
      toast: {
        error: (msg) => console.error('[Toast Error]', msg),
        success: (msg) => console.log('[Toast Success]', msg),
        info: (msg) => console.info('[Toast Info]', msg),
        warning: (msg) => console.warn('[Toast Warning]', msg)
      }
    };
  }
  return context;
}
