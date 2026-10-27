import React from 'react';
import { MenuItem } from '../../types';
import { formatRupiah } from '../../lib/rupiah';
import { Plus, Minus, Check } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  cartQty?: number;
  onUpdateCartQty?: (delta: number) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  onAddToCart,
  cartQty = 0,
  onUpdateCartQty,
}) => {
  const isOutOfStock = item.stok <= 0 || item.status === 'nonaktif';
  const isLowStock = item.stok > 0 && item.stok <= 10;

  return (
    <div
      className={`group relative bg-[#FAF7F2] rounded-2xl border-2 transition-all duration-300 flex flex-col overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${
        cartQty > 0
          ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50'
          : 'border-[#D4AF37]/30 hover:border-[#D4AF37]'
      } ${isOutOfStock ? 'opacity-60 grayscale-[40%]' : ''}`}
    >
      {/* Image Thumbnail with Overlay */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-200">
        <img
          src={
            item.gambar_url ||
            'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500'
          }
          alt={item.nama_menu}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Category Pill Top Left */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[#FAF3E0] text-[10px] font-semibold border border-[#D4AF37]/40">
          {item.kategori}
        </div>

        {/* Stock Badge Top Right */}
        <div className="absolute top-2 right-2">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-full bg-[#8B0000] text-white text-[10px] font-bold shadow">
              Habis
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-full bg-[#F57C00] text-white text-[10px] font-bold shadow animate-pulse">
              Sisa {item.stok}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-[#2E7D32] text-white text-[10px] font-semibold shadow">
              Stok {item.stok}
            </span>
          )}
        </div>

        {/* Cart Count Badge if added */}
        {cartQty > 0 && (
          <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-[#C8102E] text-white font-bold text-xs shadow-lg flex items-center gap-1 border border-[#D4AF37]">
            <Check className="w-3.5 h-3.5" /> {cartQty}x di Keranjang
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-semibold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2">
            {item.nama_menu}
          </h4>
          {item.deskripsi && (
            <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
              {item.deskripsi}
            </p>
          )}
        </div>

        {/* Price & Action Button */}
        <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-stone-400 block -mb-0.5">Harga</span>
            <span className="font-bold text-sm sm:text-base text-[#8B0000]">
              {formatRupiah(item.harga)}
            </span>
          </div>

          {/* Action Button: Add or Stepper */}
          {cartQty > 0 && onUpdateCartQty ? (
            <div className="flex items-center gap-1.5 bg-[#FAF3E0] rounded-xl border border-[#D4AF37] p-0.5">
              <button
                type="button"
                onClick={() => onUpdateCartQty(-1)}
                className="w-7 h-7 rounded-lg bg-white text-[#8B0000] flex items-center justify-center hover:bg-red-50 shadow-xs transition cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-5 text-center font-bold text-xs text-[#8B0000]">
                {cartQty}
              </span>
              <button
                type="button"
                onClick={() => onUpdateCartQty(1)}
                disabled={cartQty >= item.stok}
                className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-white flex items-center justify-center hover:brightness-110 shadow-xs transition disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => onAddToCart(item)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#C8102E] hover:from-[#A00000] hover:to-[#D41434] text-[#FAF3E0] text-xs font-bold flex items-center gap-1 shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
