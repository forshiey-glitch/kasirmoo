import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Maximize2, X, Download } from 'lucide-react';

interface QRISDisplayProps {
  amount?: number;
  className?: string;
  showFullscreenButton?: boolean;
}

/**
 * Komponen Tampilan QRIS Toko
 * Catatan penting:
 * - Gambar QRIS default ada di public/qris-toko.png.
 * - Admin bisa ganti via Tab Settings tanpa deploy ulang kode.
 * - Mengambil URL dari Firestore settings/qris lalu fallback ke /qris-toko.png.
 */
export const QRISDisplay: React.FC<QRISDisplayProps> = ({
  amount,
  className = '',
  showFullscreenButton = true,
}) => {
  const { settings } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Ambil URL QRIS dari settings Firestore, fallback ke file public/qris-toko.png
  const qrisUrl = (!imageError && settings.qris_url) ? settings.qris_url : '/qris-toko.png';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Container Kartu Krem dengan Border Emas */}
      <div className="relative bg-[#FAF3E0] p-4 sm:p-5 rounded-2xl border-2 border-[#D4AF37] shadow-xl w-full max-w-[280px] md:max-w-[360px] lg:max-w-[400px] flex flex-col items-center text-center">
        {/* Subtle cloud ornament in header */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-sm">🏮</span>
          <span className="font-calligraphy text-lg font-bold text-[#8B0000]">
            QRIS Pembayaran Digital
          </span>
          <span className="text-sm">🏮</span>
        </div>

        {/* QR Code Canvas/Image container dengan background putih kontras tinggi */}
        <div className="relative bg-white p-3 rounded-xl border border-[#D4AF37]/50 shadow-inner w-full aspect-square flex items-center justify-center overflow-hidden">
          {imageError ? (
            <div className="text-center p-4 text-stone-500">
              <span className="text-4xl block mb-2">💳</span>
              <p className="font-bold text-xs text-[#8B0000]">
                QRIS belum diatur, hubungi admin.
              </p>
              <p className="text-[10px] text-stone-400 mt-1">
                Admin dapat mengunggah gambar QRIS di menu Pengaturan.
              </p>
            </div>
          ) : (
            <img
              src={qrisUrl}
              alt="QRIS Toko"
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          )}

          {/* Tombol Perbesar Floating di pojok QR */}
          {showFullscreenButton && !imageError && (
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="absolute bottom-2 right-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition cursor-pointer shadow-md"
              title="Perbesar QRIS ke Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Instruksi scan & Nominal jika ada */}
        <div className="mt-3 text-center">
          {amount !== undefined && amount > 0 && (
            <div className="mb-1 text-sm font-bold text-[#8B0000]">
              Total Tagihan: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)}
            </div>
          )}
          <p className="text-xs font-semibold text-stone-700">
            Scan QRIS ini dengan aplikasi pembayaran Anda
          </p>
          <p className="text-[10px] text-stone-500 mt-0.5">
            BCA, GoPay, OVO, Dana, ShopeePay, LinkAja, & Mobile Banking
          </p>
        </div>

        {/* Action Button: Perbesar */}
        {showFullscreenButton && !imageError && (
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#8B0000] border border-[#D4AF37] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" /> Perbesar Layar Penuh
          </button>
        )}
      </div>

      {/* Modal Fullscreen Zoom QRIS */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-lg animate-fadeIn"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer z-10"
            title="Tutup"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="bg-white p-6 sm:p-8 rounded-3xl border-4 border-[#D4AF37] max-w-sm sm:max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🏮</span>
              <h3 className="font-calligraphy text-3xl font-bold text-[#8B0000]">
                {settings.nama_toko || 'Restoran LongMen'}
              </h3>
            </div>

            <div className="w-full aspect-square bg-white p-2 rounded-2xl border-2 border-stone-200 shadow-inner flex items-center justify-center">
              <img
                src={qrisUrl}
                alt="QRIS Fullscreen"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-4">
              {amount !== undefined && amount > 0 && (
                <div className="text-xl font-extrabold text-[#C8102E] mb-1">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)}
                </div>
              )}
              <p className="text-sm font-semibold text-stone-800">
                Pindai kode QRIS di atas untuk menyelesaikan pembayaran
              </p>
            </div>

            <div className="mt-4 flex gap-2 w-full">
              <a
                href={qrisUrl}
                download="qris-longmen.png"
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-stone-300 transition"
              >
                <Download className="w-4 h-4" /> Unduh Gambar
              </a>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-white text-xs font-bold hover:brightness-110 shadow transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
