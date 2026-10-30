'use client';

import { useState, useEffect } from 'react';

/**
 * useDebounce hook to debounce values (e.g. search input text)
 * Prevents unnecessary re-filtering or heavy calculations on every keystroke
 * @param {any} value
 * @param {number} delay (default: 300ms)
 * @returns debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

