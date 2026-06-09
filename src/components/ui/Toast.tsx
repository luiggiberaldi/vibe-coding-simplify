import React, { useEffect } from 'react';
import { useUIStore, ToastMessage } from '../../store/useUIStore';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore(state => state.toasts);
  
  return (
    <div className={styles.container}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ toast: ToastMessage }> = ({ toast }) => {
  const removeToast = useUIStore(state => state.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const icons = {
    success: <CheckCircle className={styles.iconSuccess} />,
    error: <XCircle className={styles.iconError} />,
    warning: <AlertTriangle className={styles.iconWarning} />,
    info: <Info className={styles.iconInfo} />
  };

  return (
    <div className={styles.toast}>
      <div className={styles.icon}>{icons[toast.type]}</div>
      <div className={styles.content}>{toast.message}</div>
      <button className={styles.close} onClick={() => removeToast(toast.id)}>
        <X size={16} />
      </button>
      <div className={styles.progress}></div>
    </div>
  );
};