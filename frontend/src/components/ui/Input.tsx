import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, hint, leftIcon, rightIcon, style, className, ...props
}, ref) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', letterSpacing: '.02em' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
          <span style={{
            position: 'absolute', left: 14, color: '#475569',
            display: 'flex', alignItems: 'center', pointerEvents: 'none',
          }}>
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className="l-input"
          style={{
            paddingLeft: leftIcon  ? 42 : undefined,
            paddingRight: rightIcon ? 42 : undefined,
            borderColor: error ? 'rgba(239,68,68,.5)' : undefined,
            ...style,
          }}
          {...props}
        />
        {rightIcon && (
          <span style={{
            position: 'absolute', right: 14, color: '#475569',
            display: 'flex', alignItems: 'center',
          }}>
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: '#f87171', display: 'flex', alignItems: 'center', gap: 4 }}>
          {error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontSize: 12, color: '#475569' }}>{hint}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
