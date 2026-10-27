import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'fullscreen';
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    '2xl': 'max-w-4xl',
    fullscreen: 'max-w-full h-full m-0 rounded-none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Background click listener */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[#FAF7F2] rounded-2xl border-2 border-[#D4AF37] shadow-2xl overflow-hidden flex flex-col z-10 max-h-[92vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Oriental Cloud Header Bar */}
        <div className="relative bg-gradient-to-r from-[#8B0000] via-[#C8102E] to-[#8B0000] text-[#FAF3E0] px-5 py-4 border-b-2 border-[#D4AF37] flex items-center justify-between shrink-0">
          {/* Subtle cloud ornament pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 Q25,0 50,10 T100,10" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <span className="text-xl">🏮</span>
            <div>
              <h3 className="font-calligraphy text-2xl tracking-wide font-bold leading-tight text-[#FAF3E0] drop-shadow-sm">
                {title}
              </h3>
              {subtitle && <p className="text-xs text-[#F5C542] opacity-90 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 p-1.5 rounded-full text-[#FAF3E0]/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3.5 bg-[#F4EDE0] border-t border-[#D4AF37]/30 flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
