import React from 'react';
import { ShoppingBag, ChevronDown } from 'lucide-react';
import { formatRupiah } from '../../lib/rupiah';
import { CartPanel } from './CartPanel';

interface BottomSheetProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  totalItems: number;
  totalPrice: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onOpen,
  onClose,
  totalItems,
  totalPrice,
}) => {
  return (
    <>
      {/* Floating Trigger Bar on Mobile (when closed and items exist) */}
      {!isOpen && totalItems > 0 && (
        <div className="md:hidden fixed bottom-16 left-3 right-3 z-30 animate-bounceOnce">
          <button
            type="button"
            onClick={onOpen}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#8B0000] via-[#C8102E] to-[#8B0000] text-[#FAF3E0] shadow-2xl border-2 border-[#D4AF37] flex items-center justify-between cursor-pointer active:scale-98 transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF3E0] text-[#8B0000] flex items-center justify-center font-bold text-xs shadow">
                {totalItems}
              </div>
              <span className="font-bold text-xs tracking-wide">
                Lihat Keranjang Pesanan
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-extrabold text-sm text-[#F5C542]">
              <span>{formatRupiah(totalPrice)}</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Slide-Up Bottom Sheet Modal */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop tap to close */}
          <div className="flex-1" onClick={onClose} />

          {/* Bottom Sheet Card */}
          <div className="w-full bg-[#FAF7F2] rounded-t-3xl border-t-2 border-x-2 border-[#D4AF37] shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slideUp">
            {/* Grab Handle */}
            <div
              className="py-2.5 flex items-center justify-center cursor-pointer bg-[#F5EFE6] border-b border-[#D4AF37]/30"
              onClick={onClose}
            >
              <div className="w-12 h-1.5 rounded-full bg-stone-300" />
            </div>

            {/* Cart Panel inside Bottom Sheet */}
            <div className="flex-1 overflow-hidden">
              <CartPanel onCloseMobile={onClose} className="rounded-none border-none shadow-none" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
