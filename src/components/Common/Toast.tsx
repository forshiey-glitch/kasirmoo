import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-[#C8102E] shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-[#F57C00] shrink-0" />,
          info: <Info className="w-5 h-5 text-[#8B0000] shrink-0" />,
        };

        const borders = {
          success: 'border-[#2E7D32]/60 bg-[#FAF7F2]',
          error: 'border-[#C8102E] bg-[#FFF5F5]',
          warning: 'border-[#F57C00]/80 bg-[#FFFDF5]',
          info: 'border-[#D4AF37] bg-[#FAF7F2]',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border-2 shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${borders[toast.type]}`}
          >
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <p className="text-sm font-medium text-[#2C2420]">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
