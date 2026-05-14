import { useState, useRef, useEffect } from 'react';

// ── Format helpers ──────────────────────────────────────────────────────────

function fmtRU(d) { // XXX XXX-XX-XX  (Russia / Kaz / Turkey, 10 digits)
  const a=d.slice(0,3),b=d.slice(3,6),c=d.slice(6,8),e=d.slice(8,10);
  if(!d)return'';if(!b)return a;if(!c)return`${a} ${b}`;
  if(!e)return`${a} ${b}-${c}`;return`${a} ${b}-${c}-${e}`;
}
function fmtUA(d) { // XX XXX XX XX  (Ukraine, 9 digits)
  const a=d.slice(0,2),b=d.slice(2,5),c=d.slice(5,7),e=d.slice(7,9);
  if(!d)return'';if(!b)return a;if(!c)return`${a} ${b}`;
  if(!e)return`${a} ${b} ${c}`;return`${a} ${b} ${c} ${e}`;
}
function fmtUS(d) { // (XXX) XXX-XXXX  (USA/Canada, 10 digits)
  if(!d)return'';
  if(d.length<=3)return d;
  if(d.length<=6)return`(${d.slice(0,3)}) ${d.slice(3)}`;
  return`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6,10)}`;
}
function fmtGB(d) { // XXXXX XXXXXX  (UK, 10 digits)
  if(!d)return'';
  if(d.length<=5)return d;
  return`${d.slice(0,5)} ${d.slice(5,11)}`;
}
function fmtDE(d) { // XXX XXXXXXXX  (Germany, 11 digits)
  if(!d)return'';
  if(d.length<=3)return d;
  return`${d.slice(0,3)} ${d.slice(3,11)}`;
}
function fmtFR(d) { // X XX XX XX XX  (France, 9 digits)
  if(!d)return'';
  const widths=[1,2,2,2,2];
  let r='',pos=0;
  for(const w of widths){const p=d.slice(pos,pos+w);if(!p)break;r+=(r?' ':'')+p;pos+=w;}
  return r;
}
function fmtGrp(groups,sep=' '){
  return(d)=>{
    if(!d)return'';
    let r='',pos=0;
    for(const w of groups){const p=d.slice(pos,pos+w);if(!p)break;r+=(r?sep:'')+p;pos+=w;}
    return r;
  };
}
function fmtAnon(d) { // XXX XX XXXX  (anonymous, 9 digits)
  const a=d.slice(0,3),b=d.slice(3,5),c=d.slice(5,9);
  if(!d)return'';if(!b)return a;if(!c)return`${a} ${b}`;return`${a} ${b} ${c}`;
}

// ── Country list ────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code:'+7',   flag:'🇷🇺', name:'Россия',      max:10, fmt:fmtRU,                ph:'XXX XXX-XX-XX'  },
  { code:'+380', flag:'🇺🇦', name:'Украина',     max:9,  fmt:fmtUA,                ph:'XX XXX XX XX'   },
  { code:'+1',   flag:'🇺🇸', name:'США',         max:10, fmt:fmtUS,                ph:'(XXX) XXX-XXXX' },
  { code:'+44',  flag:'🇬🇧', name:'Британия',    max:10, fmt:fmtGB,                ph:'XXXXX XXXXXX'   },
  { code:'+49',  flag:'🇩🇪', name:'Германия',    max:11, fmt:fmtDE,                ph:'XXX XXXXXXXX'   },
  { code:'+33',  flag:'🇫🇷', name:'Франция',     max:9,  fmt:fmtFR,                ph:'X XX XX XX XX'  },
  { code:'+86',  flag:'🇨🇳', name:'Китай',       max:11, fmt:fmtGrp([3,4,4]),      ph:'XXX XXXX XXXX'  },
  { code:'+81',  flag:'🇯🇵', name:'Япония',      max:10, fmt:fmtGrp([3,4,4],'-'),  ph:'XXX-XXXX-XXXX'  },
  { code:'+90',  flag:'🇹🇷', name:'Турция',      max:10, fmt:fmtRU,                ph:'XXX XXX-XX-XX'  },
  { code:'+971', flag:'🇦🇪', name:'ОАЭ',         max:9,  fmt:fmtGrp([2,3,4]),      ph:'XX XXX XXXX'    },
  { code:'+998', flag:'🇺🇿', name:'Узбекистан',  max:9,  fmt:fmtGrp([2,3,4]),      ph:'XX XXX XXXX'    },
  { code:'+7',   flag:'🇰🇿', name:'Казахстан',   max:10, fmt:fmtRU,                ph:'XXX XXX-XX-XX'  },
  { code:'+994', flag:'🇦🇿', name:'Азербайджан', max:9,  fmt:fmtGrp([2,3,2,2]),    ph:'XX XXX XX XX'   },
  { code:'+374', flag:'🇦🇲', name:'Армения',     max:8,  fmt:fmtGrp([2,6]),        ph:'XX XXXXXX'      },
  { code:'+375', flag:'🇧🇾', name:'Беларусь',    max:9,  fmt:fmtGrp([2,3,2,2]),    ph:'XX XXX XX XX'   },
  { code:'+888', flag:'🏴‍☠️', name:'Анонимный',   max:9,  fmt:fmtAnon,              ph:'XXX XX XXXX'    },
];

function detect(digits) {
  if(digits.startsWith('888'))return COUNTRIES.find(c=>c.code==='+888');
  if(digits.startsWith('380'))return COUNTRIES.find(c=>c.code==='+380');
  if(digits.startsWith('375'))return COUNTRIES.find(c=>c.code==='+375');
  if(digits.startsWith('374'))return COUNTRIES.find(c=>c.code==='+374');
  if(digits.startsWith('994'))return COUNTRIES.find(c=>c.code==='+994');
  if(digits.startsWith('998'))return COUNTRIES.find(c=>c.code==='+998');
  if(digits.startsWith('971'))return COUNTRIES.find(c=>c.code==='+971');
  if(digits.startsWith('49')) return COUNTRIES.find(c=>c.code==='+49');
  if(digits.startsWith('33')) return COUNTRIES.find(c=>c.code==='+33');
  if(digits.startsWith('44')) return COUNTRIES.find(c=>c.code==='+44');
  if(digits.startsWith('81')) return COUNTRIES.find(c=>c.code==='+81');
  if(digits.startsWith('86')) return COUNTRIES.find(c=>c.code==='+86');
  if(digits.startsWith('90')) return COUNTRIES.find(c=>c.code==='+90');
  if(digits.startsWith('7'))  return COUNTRIES.find(c=>c.flag==='🇷🇺');
  if(digits.startsWith('1'))  return COUNTRIES.find(c=>c.code==='+1');
  return null;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PhoneInput({ value, onChange }) {
  const [country,   setCountry]   = useState(COUNTRIES[0]);
  const [rawDigits, setRawDigits] = useState('');
  const [open,      setOpen]      = useState(false);
  const dropRef = useRef();

  useEffect(() => {
    const h = e => { if(dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleInput = (e) => {
    const stripped = e.target.value.replace(/\D/g, '');
    const detected = detect(stripped);
    const active   = detected || country;
    if (detected && (detected.code !== country.code || detected.flag !== country.flag)) {
      setCountry(detected);
    }
    const capped = stripped.slice(0, active.max);
    setRawDigits(capped);
    onChange(active.code + ' ' + capped);
  };

  const selectCountry = (c) => {
    setCountry(c);
    setOpen(false);
    setRawDigits('');
    onChange(c.code + ' ');
  };

  const displayValue = country.fmt(rawDigits);

  return (
    <div style={{ display:'flex', gap:8, position:'relative' }} ref={dropRef}>

      {/* Country picker button */}
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
          {COUNTRIES.map((c, i) => {
            const isActive = country.code === c.code && country.flag === c.flag;
            return (
              <div key={i} onClick={() => selectCountry(c)}
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'11px 16px', cursor:'pointer',
                  background: isActive ? 'var(--accent-light)' : 'transparent',
                  transition:'background .12s', fontSize:14,
                }}
                onMouseEnter={e => e.currentTarget.style.background='var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background=isActive?'var(--accent-light)':'transparent'}
              >
                <span style={{ fontSize:20 }}>{c.flag}</span>
                <span style={{ flex:1, fontWeight:500, color:'var(--text)' }}>{c.name}</span>
                <span style={{ color:'var(--text-muted)', fontSize:13 }}>{c.code}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Number input */}
      <input
        type="tel"
        value={displayValue}
        onChange={handleInput}
        placeholder={country.ph}
        style={{
          flex:1, background:'var(--surface-2)',
          border:'1.5px solid var(--border)',
          borderRadius:'var(--radius-sm)',
          padding:'13px 16px', color:'var(--text)', outline:'none',
          transition:'border-color .2s, box-shadow .2s',
          fontVariantNumeric:'tabular-nums', letterSpacing:'.04em',
        }}
        onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 4px rgba(74,124,247,.1)'; }}
        onBlur={ e => { e.target.style.borderColor=''; e.target.style.boxShadow=''; }}
      />
    </div>
  );
}
