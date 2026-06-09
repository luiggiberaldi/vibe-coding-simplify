import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'active' | 'paused' | 'delivered' | 'archived' | 'low' | 'medium' | 'high' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className, ...props }) => {
  return (
    <span className={`${styles.badge} ${styles[`badge-${variant}`]} ${className || ''}`} {...props}>
      {children}
    </span>
  );
};