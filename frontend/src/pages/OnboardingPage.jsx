import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const slides = [
  {
    bg: 'linear-gradient(160deg, #1a56db 0%, #3b82f6 55%, #7dd3fc 100%)',
    btnColor: '#1d4ed8',
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <path d="M26 6L32 20H48L35 29L40 44L26 35L12 44L17 29L4 20H20L26 6Z"
          fill="white" opacity="0.95"/>
      </svg>
    ),
    title: 'Быстрее всего',
    desc: 'Сообщения доставляются мгновенно — без задержек и без рекламы',
  },
  {
    bg: 'linear-gradient(160deg, #065f46 0%, #059669 55%, #6ee7b7 100%)',
    btnColor: '#047857',
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect x="10" y="22" width="32" height="24" rx="4" fill="white" opacity="0.9"/>
        <path d="M16 22V17C16 10.4 21.4 5 28 5C34.6 5 40 10.4 40 17V22" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="28" cy="34" r="4" fill="#059669"/>
      </svg>
    ),
    title: 'Только вы двое',
    desc: 'Ваши сообщения видит только собеседник — никаких посторонних',
  },
  {
    bg: 'linear-gradient(160deg, #4c1d95 0%, #7c3aed 55%, #c4b5fd 100%)',
    btnColor: '#6d28d9',
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="20" cy="18" r="8" fill="white" opacity="0.9"/>
        <circle cx="34" cy="14" r="6" fill="white" opacity="0.65"/>
        <path d="M4 38C4 30 11.2 24 20 24C28.8 24 36 30 36 38" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M34 26C39.5 26 44 30 44 38" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      </svg>
    ),
    title: 'Всегда на связи',
    desc: 'Смотрите кто онлайн прямо сейчас и начинайте общение в один клик',
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState('idle');
  const navigate = useNavigate();
  const { auth } = useAuth();

  const finish = () => {
    localStorage.setItem('zoomy_onboarded', '1');
    navigate('/');
  };

  const next = () => {
    if (step < slides.length - 1) {
      setDir('out');
      setTimeout(() => { setStep(s => s + 1); setDir('in'); }, 220);
    } else {
      finish();
    }
  };

  const slide = slides[step];

  return (
    <div style={{
      minHeight: '100%',
      background: slide.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 28px 48px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.6s ease',
    }}>
      {/* Decorative orbs */}
      <div style={{
        position: 'absolute', width: 340, height: 340, borderRadius: '50%',
        background: 'rgba(255,255,255,0.09)', top: -100, right: -80, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 220, height: 220, borderRadius: '50%',
        background: 'rgba(255,255,255,0.07)', bottom: 120, left: -80, pointerEvents: 'none',
      }} />

      {/* Top bar */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', padding: '52px 0 0' }}>
        <button onClick={finish} style={{
          background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none',
          borderRadius: 20, padding: '8px 18px', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', backdropFilter: 'blur(8px)', letterSpacing: 0.01,
          transition: 'background 0.2s',
        }}>Пропустить</button>
      </div>

      {/* Icon */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        gap: 40,
        animation: dir === 'out' ? 'slideOut 0.22s ease forwards'
                  : dir === 'in' ? 'slideIn 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                  : 'slideIn 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}>
          {slide.icon}
        </div>

        <div style={{ textAlign: 'center', color: '#fff' }}>
          <h2 style={{
            fontSize: 30, fontWeight: 800, marginBottom: 14,
            letterSpacing: -0.5, lineHeight: 1.15,
          }}>{slide.title}</h2>
          <p style={{
            fontSize: 16, opacity: 0.85, lineHeight: 1.65,
            maxWidth: 300, margin: '0 auto',
          }}>{slide.desc}</p>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {/* Dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={() => {
              if (i > step) { setDir('out'); setTimeout(() => { setStep(i); setDir('in'); }, 220); }
              else if (i < step) { setDir('out'); setTimeout(() => { setStep(i); setDir('in'); }, 220); }
            }} style={{
              width: i === step ? 28 : 8, height: 8,
              borderRadius: 4,
              background: i === step ? '#fff' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              cursor: 'pointer',
            }} />
          ))}
        </div>

        {/* Button */}
        <button onClick={next} style={{
          width: '100%',
          background: '#fff',
          color: slide.btnColor,
          borderRadius: 50,
          padding: '17px',
          fontWeight: 700, fontSize: 17,
          border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
          transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s',
          letterSpacing: 0.01,
        }}
          onMouseEnter={e => { e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = '0 12px 36px rgba(0,0,0,0.28)'; }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 8px 28px rgba(0,0,0,0.22)'; }}
        >
          {step === slides.length - 1 ? '🚀 Начать общение' : 'Далее'}
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to   { opacity: 0; transform: translateX(-40px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
