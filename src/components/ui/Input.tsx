import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  multiline?: boolean;
  options?: { label: string; value: string }[];
}

export const Input = React.forwardRef<any, InputProps>(
  ({ label, error, multiline, options, className, ...props }, ref) => {
    return (
      <div className={`${styles.inputGroup} ${className || ''}`}>
        {label && <label className={styles.label}>{label}</label>}
        
        {multiline ? (
          <textarea 
            ref={ref} 
            className={`${styles.control} ${error ? styles.hasError : ''}`} 
            {...(props as any)} 
          />
        ) : options ? (
          <select 
            ref={ref} 
            className={`${styles.control} ${error ? styles.hasError : ''}`} 
            {...(props as any)}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input 
            ref={ref} 
            className={`${styles.control} ${error ? styles.hasError : ''}`} 
            {...(props as any)} 
          />
        )}
        
        {error && <div className={styles.error}>{error}</div>}
      </div>
    );
  }
);
Input.displayName = 'Input';