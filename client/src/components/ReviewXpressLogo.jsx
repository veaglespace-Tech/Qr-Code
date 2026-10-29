'use client';

export default function ReviewXpressLogo({ size = 'default', showText = true, className = '' }) {
  // Size presets
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', badge: 'text-[9px] px-1 py-0.2' },
    default: { icon: 38, text: 'text-2xl', badge: 'text-[10px] px-1.5 py-0.5' },
    lg: { icon: 48, text: 'text-3xl', badge: 'text-xs px-2 py-0.5' },
    xl: { icon: 64, text: 'text-4xl', badge: 'text-sm px-2.5 py-1' }
  };

  const currentSize = sizeMap[size] || sizeMap.default;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Pixel-Perfect Official ReviewXpress SVG Emblem */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          {/* Blue to Purple Gradient for Speech Bubble */}
          <linearGradient id="rxBubbleGradient" x1="20" y1="40" x2="160" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0062FF" />
            <stop offset="45%" stopColor="#2563EB" />
            <stop offset="80%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>

          {/* Green Gradient for Checkmark */}
          <linearGradient id="rxCheckGradient" x1="120" y1="40" x2="185" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00E575" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Electric Neon Green for Lightning Bolt */}
          <linearGradient id="rxLightningGradient" x1="60" y1="30" x2="130" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00FF85" />
            <stop offset="60%" stopColor="#00E575" />
            <stop offset="100%" stopColor="#05CD67" />
          </linearGradient>
        </defs>

        {/* 1. Speech Bubble Ring with Chat Tail */}
        <path
          d="M 52 142 
             L 28 158 
             L 38 132 
             C 24 118 16 100 16 80 
             C 16 42 54 16 100 16 
             C 142 16 176 38 182 70 
             C 176 108 144 140 100 140 
             C 83 140 66 135 52 126 
             Z"
          fill="none"
          stroke="url(#rxBubbleGradient)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 2. Top-Right Success Checkmark */}
        <path
          d="M 128 72 
             L 150 94 
             L 192 46"
          fill="none"
          stroke="url(#rxCheckGradient)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3. Center Electric Lightning Bolt striking through */}
        <polygon
          points="132,32 78,104 116,104 74,186 142,96 104,96"
          fill="url(#rxLightningGradient)"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>

      {/* Official ReviewXpress Typographic Wordmark */}
      {showText && (
        <div className="flex items-center tracking-tight leading-none font-sans">
          <span className={`font-black text-slate-900 ${currentSize.text} tracking-tight`}>
            Review
          </span>
          <span className={`font-black text-[#00E575] ${currentSize.text} tracking-tight`}>
            Xpress
          </span>
        </div>
      )}
    </div>
  );
}
