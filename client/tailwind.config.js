/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Logo Electric Neon Green
        rxgreen: {
          50: '#edfff4',
          100: '#d5ffe4',
          200: '#aeffcc',
          300: '#72ffa8',
          400: '#2ff97d',
          500: '#00E575',
          600: '#00c763',
          700: '#009e4f',
          800: '#057d41',
          900: '#076637',
        },
        // Logo Royal Electric Blue
        rxblue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#0062FF',
          600: '#0052d6',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Logo Violet Gradient
        rxpurple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          400: '#a855f7',
          500: '#7C3AED',
          600: '#9333EA',
          700: '#6b21a8',
        },
        // Brand Emerald fallback
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#00E575',
          600: '#00c763',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        slate: {
          850: '#151f32',
          950: '#080d19',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 12px 35px -5px rgba(0, 229, 117, 0.35)',
        'glow-blue': '0 12px 35px -5px rgba(0, 98, 255, 0.28)',
        'premium-card': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 1px 3px 0 rgba(15, 23, 42, 0.04)',
        'premium-hover': '0 25px 45px -10px rgba(0, 98, 255, 0.12), 0 12px 20px -6px rgba(0, 229, 117, 0.08)',
        'stand-shadow': '0 30px 60px -15px rgba(15, 23, 42, 0.18), 0 12px 24px -8px rgba(0, 98, 255, 0.12)',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(0, 229, 117, 0.12) 0%, rgba(0, 98, 255, 0.08) 40%, transparent 70%)',
        'subtle-grid': 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
