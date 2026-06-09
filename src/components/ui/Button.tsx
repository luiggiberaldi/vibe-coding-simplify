import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', icon, className, ...props }, ref) => {
    return (
      <button 
        ref={ref}
        className={`${styles.btn} ${styles[`btn-${variant}`]} ${className || ''}`}
        {...props}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';