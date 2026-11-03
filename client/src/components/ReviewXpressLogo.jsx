'use client';

export default function ReviewXpressLogo({ size = 'default', showText = true, className = '' }) {
  // Size presets - generous, prominent, high-visibility sizing
  const sizeMap = {
    sm: {
      full: 'h-8 sm:h-9',
      icon: 'h-8 w-8 sm:h-9 sm:w-9'
    },
    default: {
      full: 'h-11 sm:h-12 md:h-13 lg:h-[54px]',
      icon: 'h-11 w-11 sm:h-12 sm:w-12 lg:h-[54px] lg:w-[54px]'
    },
    lg: {
      full: 'h-14 sm:h-16 md:h-20',
      icon: 'h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20'
    },
    xl: {
      full: 'h-20 sm:h-24 md:h-28',
      icon: 'h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.default;

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={showText ? '/logo.png' : '/logo-icon.png'}
        alt="ReviewXpress Official Brand Logo"
        className={`${showText ? currentSize.full : currentSize.icon} w-auto max-w-none object-contain transition-transform duration-200 group-hover:scale-105`}
        loading="eager"
      />
    </div>
  );
}
