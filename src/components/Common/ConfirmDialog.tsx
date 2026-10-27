import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger',
}) => {
  const getButtonBg = () => {
    switch (variant) {
      case 'danger':
        return 'bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-white hover:brightness-110';
      case 'warning':
        return 'bg-gradient-to-r from-[#F57C00] to-[#E65100] text-white hover:brightness-110';
      case 'info':
      default:
        return 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#3E2723] font-bold hover:brightness-105';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-medium hover:bg-stone-200/60 transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 rounded-xl shadow-md font-semibold transition cursor-pointer ${getButtonBg()}`}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-100 rounded-full text-amber-700 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-stone-700 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
};
