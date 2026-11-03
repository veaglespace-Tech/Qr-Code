'use client';

export default function ReviewXpressLogo({ size = 'default', showText = true, className = '' }) {
  // Size presets
  const sizeMap = {
    sm: {
      full: 'h-7',
      icon: 'h-7 w-7'
    },
    default: {
      full: 'h-9 sm:h-10',
      icon: 'h-9 w-9 sm:h-10 sm:w-10'
    },
    lg: {
      full: 'h-11 sm:h-12',
      icon: 'h-11 w-11 sm:h-12 sm:w-12'
    },
    xl: {
      full: 'h-14 sm:h-16',
      icon: 'h-14 w-14 sm:h-16 sm:w-16'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.default;

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={showText ? '/logo.png' : '/logo-icon.png'}
        alt="ReviewXpress Official Brand Logo"
        className={`${showText ? currentSize.full : currentSize.icon} w-auto object-contain transition-transform duration-200 group-hover:scale-105`}
        loading="eager"
      />
    </div>
  );
}
