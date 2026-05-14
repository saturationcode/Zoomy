import { useState, useRef, useEffect } from 'react';

const COUNTRIES = [
  { code: '+7',   flag: '🇷🇺', name: 'Россия',     digits: 10 },
  { code: '+380', flag: '🇺🇦', name: 'Украина',    digits: 9  },
  { code: '+1',   flag: '🇺🇸', name: 'США',        digits: 10 },
  { code: '+44',  flag: '🇬🇧', name: 'Британия',   digits: 10 },
  { code: '+49',  flag: '🇩🇪', name: 'Германия',   digits: 11 },
  { code: '+33',  flag: '🇫🇷', name: 'Франция',    digits: 9  },
  { code: '+86',  flag: '🇨🇳', name: 'Китай',      digits: 11 },
  { code: '+81',  flag: '🇯🇵', name: 'Япония',     digits: 10 },
  { code: '+90',  flag: '🇹🇷', name: 'Турция',     digits: 10 },
  { code: '+971', flag: '🇦🇪', name: 'ОАЭ',        digits: 9  },
  { code: '+998', flag: '🇺🇿', name: 'Узбекистан', digits: 9  },
  { code: '+7',   flag: '🇰🇿', name: 'Казахстан',  digits: 10 },
  { code: '+994', flag: '🇦🇿', name: 'Азербайджан',digits: 9  },
  { code: '+374', flag: '🇦🇲', name: 'Армения',    digits: 8  },
  { code: '+375', flag: '🇧🇾', name: 'Беларусь',   digits: 9  },
  { code: '+888', flag: '🏴‍☠️', name: 'Анонимный',  digits: 9  },
];

function detect(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('888')) return COUNTRIES.find(c => c.code === '+888');
  if (digits.startsWith('380')) return COUNTRIES.find(c => c.code === '+380');
  if (digits.startsWith('375')) return COUNTRIES.find(c => c.code === '+375');
  if (digits.startsWith('374')) return COUNTRIES.find(c => c.code === '+374');
  if (digits.startsWith('371') || digits.startsWith('372') || digits.startsWith('373')) return null;
  if (digits.startsWith('371')) return null;
  if (digits.startsWith('994')) return COUNTRIES.find(c => c.code === '+994');
  if (digits.startsWith('998')) return COUNTRIES.find(c => c.code === '+998');
  if (digits.startsWith('971')) return COUNTRIES.find(c => c.code === '+971');
  if (digits.startsWith('49'))  return COUNTRIES.find(c => c.code === '+49');
  if (digits.startsWith('33'))  return COUNTRIES.find(c => c.code === '+33');
  if (digits.startsWith('44'))  return COUNTRIES.find(c => c.code === '+44');
  if (digits.startsWith('81'))  return COUNTRIES.find(c => c.code === '+81');
  if (digits.startsWith('86'))  return COUNTRIES.find(c => c.code === '+86');
  if (digits.startsWith('90'))  return COUNTRIES.find(c => c.code === '+90');
  if (digits.startsWith('7'))   return COUNTRIES.find(c => c.code === '+7');
  if (digits.startsWith('1'))   return COUNTRIES.find(c => c.code === '+1');
  return null;
}

export default function PhoneInput({ value, onChange }) {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [num,     setNum]     = useState('');
  const [open,    setOpen]    = useState(false);
  const dropRef = useRef();

  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNum = (e) => {
    const raw = e.target.value;
    const detected = detect(raw);
    if (detected) setCountry(detected);
    setNum(raw);
    onChange(country.code + ' ' + raw);
  };

  return (
    <div style={{ display:'flex', gap:8, position:'relative' }} ref={dropRef}>
      {/* Country picker */}
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        display:'flex', alignItems:'center', gap:6,
        background:'var(--surface-2)', border:'1.5px solid var(--border)',
        borderRadius:'var(--radius-sm)', padding:'13px 14px',
        fontSize:18, cursor:'pointer', flexShrink:0,
        transition:'border-color .2s',
        borderColor: open ? 'var(--accent)' : undefined,
      }}>
        <span>{country.flag}</span>
        <span style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)' }}>{country.code}</span>
        <span style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left:0, zIndex:300,
          background:'rgba(255,255,255,.98)', backdropFilter:'blur(20px)',
          borderRadius:18, boxShadow:'0 8px 32px rgba(74,124,247,.18)',
          border:'1px solid var(--border)',
          maxHeight:240, overflowY:'auto', minWidth:220,
        }}>
          {COUNTRIES.map((c, i) => (
            <div key={i} onClick={() => { setCountry(c); setOpen(false); onChange(c.code + ' ' + num); }}
              style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'11px 16px', cursor:'pointer',
                background: country.code === c.code && country.flag === c.flag ? 'var(--accent-light)' : 'transparent',
                transition:'background .12s',
                fontSize:14,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = country.code === c.code ? 'var(--accent-light)' : 'transparent'}
            >
              <span style={{ fontSize:20 }}>{c.flag}</span>
              <span style={{ flex:1, fontWeight:500, color:'var(--text)' }}>{c.name}</span>
              <span style={{ color:'var(--text-muted)', fontSize:13 }}>{c.code}</span>
            </div>
          ))}
        </div>
      )}

      {/* Number */}
      <input
        type="tel"
        value={num}
        onChange={handleNum}
        placeholder="000 000-00-00"
        style={{
          flex:1, background:'var(--surface-2)',
          border:'1.5px solid var(--border)',
          borderRadius:'var(--radius-sm)',
          padding:'13px 16px', color:'var(--text)', outline:'none',
          transition:'border-color .2s, box-shadow .2s',
        }}
        onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 4px rgba(74,124,247,.1)'; }}
        onBlur={e => { e.target.style.borderColor=''; e.target.style.boxShadow=''; }}
      />
    </div>
  );
}
