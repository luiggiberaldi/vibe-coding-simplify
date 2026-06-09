import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmDialog: React.FC = () => {
  const confirm = useUIStore(state => state.confirm);
  const closeConfirm = useUIStore(state => state.closeConfirm);

  return (
    <Modal
      isOpen={confirm.isOpen}
      onClose={closeConfirm}
      title={confirm.title}
      footer={
        <>
          <Button variant="outline" onClick={closeConfirm}>{confirm.cancelLabel}</Button>
          <Button variant={confirm.confirmVariant} onClick={confirm.onConfirm}>{confirm.confirmLabel}</Button>
        </>
      }
    >
      <p>{confirm.message}</p>
    </Modal>
  );
};