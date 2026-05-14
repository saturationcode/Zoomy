/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base':     '#07070f',
        'bg-surface':  '#0d0d1a',
        'bg-elevated': '#13132a',
        'accent':      '#7c3aed',
        'accent-2':    '#2563eb',
        'accent-cyan': '#06b6d4',
        'neon-purple': '#a78bfa',
        'neon-blue':   '#38bdf8',
        'neon-green':  '#34d399',
        'neon-pink':   '#f472b6',
        'text-1':      '#f1f5f9',
        'text-2':      '#94a3b8',
        'text-3':      '#475569',
        'border-1':    'rgba(255,255,255,0.06)',
        'border-2':    'rgba(255,255,255,0.10)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.3s cubic-bezier(.34,1.56,.64,1)',
        'slide-in':   'slideIn 0.28s cubic-bezier(.34,1.2,.64,1)',
        'msg-pop':    'msgPop 0.22s cubic-bezier(.34,1.4,.64,1)',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
        'spin-slow':  'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
        slideUp:   { '0%': { transform:'translateY(18px)', opacity:'0' }, '100%': { transform:'translateY(0)', opacity:'1' } },
        slideIn:   { '0%': { transform:'translateX(-18px)', opacity:'0' }, '100%': { transform:'translateX(0)', opacity:'1' } },
        msgPop:    { '0%': { transform:'scale(0.88) translateY(6px)', opacity:'0' }, '100%': { transform:'scale(1) translateY(0)', opacity:'1' } },
        pulseGlow: {
          '0%,100%': { boxShadow:'0 0 10px rgba(124,58,237,.35)' },
          '50%':      { boxShadow:'0 0 28px rgba(124,58,237,.75), 0 0 60px rgba(124,58,237,.2)' },
        },
      },
      boxShadow: {
        'glass':       '0 8px 32px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.05)',
        'glass-lg':    '0 24px 64px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06)',
        'glow-purple': '0 0 24px rgba(124,58,237,.5), 0 0 48px rgba(124,58,237,.2)',
        'glow-cyan':   '0 0 24px rgba(6,182,212,.5), 0 0 48px rgba(6,182,212,.15)',
        'msg-out':     '0 4px 20px rgba(124,58,237,.32)',
        'msg-in':      '0 2px 12px rgba(0,0,0,.35)',
        'sidebar':     '2px 0 32px rgba(0,0,0,.5)',
      },
      backdropBlur: { xs: '4px', sm: '12px', md: '24px', lg: '40px' },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(.34,1.56,.64,1)',
      },
    },
  },
  plugins: [],
};
