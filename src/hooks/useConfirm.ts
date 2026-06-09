import { useUIStore } from '../store/useUIStore';

export const useConfirm = () => {
  const showConfirm = useUIStore(state => state.showConfirm);
  const closeConfirm = useUIStore(state => state.closeConfirm);

  const confirm = (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmVariant?: 'primary' | 'danger';
    onConfirm: () => void;
  }) => {
    showConfirm({
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel || 'Aceptar',
      cancelLabel: options.cancelLabel || 'Cancelar',
      confirmVariant: options.confirmVariant || 'primary',
      onConfirm: () => {
        options.onConfirm();
        closeConfirm();
      }
    });
  };

  return confirm;
};