import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { QRISDisplay } from '../components/QRIS/QRISDisplay';
import { uploadToCloudinary } from '../lib/cloudinary';
import {
  Settings as SettingsIcon,
  Upload,
  CheckCircle2,
  Store,
  Percent,
  RefreshCw,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';

/**
 * ═══════════════════════════════════════════════════════════
 * CATATAN PENTING FITUR QRIS:
 * Gambar QRIS default ada di public/qris-toko.png.
 * Admin bisa mengganti gambar QRIS kapan pun via Settings tanpa deploy ulang.
 * File baru diunggah ke Cloudinary (preset kasir_qris)
 * dan URL-nya disimpan di Firestore document 'settings/qris'.
 * ═══════════════════════════════════════════════════════════
 */
export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, showToast } = useApp();

  const [namaToko, setNamaToko] = useState(settings.nama_toko || 'Restoran LongMen (龍門客棧)');
  const [tagline, setTagline] = useState(settings.tagline || 'Authentic Chinese Tea House & Imperial Dim Sum');
  const [alamat, setAlamat] = useState(settings.alamat || '');
  const [telepon, setTelepon] = useState(settings.telepon || '');
  const [ppnPersen, setPpnPersen] = useState<number>(settings.ppn_persen || 0);

  // Sinkronkan form saat data pengaturan dari Firestore selesai dimuat
  useEffect(() => {
    setNamaToko(settings.nama_toko || 'Restoran LongMen (龍門客棧)');
    setTagline(settings.tagline || 'Authentic Chinese Tea House & Imperial Dim Sum');
    setAlamat(settings.alamat || '');
    setTelepon(settings.telepon || '');
    setPpnPersen(settings.ppn_persen || 0);
  }, [settings]);

  const [isUploadingQris, setIsUploadingQris] = useState(false);
  const [qrisUploadProgress, setQrisUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Kompres dan upload gambar QRIS baru ke Cloudinary
  const handleUploadNewQris = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar (PNG/JPG)', 'warning');
      return;
    }

    try {
      setIsUploadingQris(true);
      setQrisUploadProgress(15);

      // Kompres via Canvas sederhana
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, w, h);

          canvas.toBlob(
            async (blob) => {
              if (!blob) return;

              try {
                // Upload langsung ke Cloudinary
                const secureUrl = await uploadToCloudinary(blob, (percent) => {
                  setQrisUploadProgress(percent);
                });

                // Simpan secure_url Cloudinary ke Firestore settings/qris
                await updateSettings({ qris_url: secureUrl });
                setIsUploadingQris(false);
                setQrisUploadProgress(null);
                showToast('Gambar QRIS Toko Berhasil Diperbarui di Cloudinary & Firestore! 🏮', 'success');
              } catch (err: unknown) {
                console.error('Cloudinary error:', err);
                const msg = err instanceof Error ? err.message : String(err);
                showToast('Gagal upload ke Cloudinary: ' + msg, 'error');
                setIsUploadingQris(false);
                setQrisUploadProgress(null);
              }
            },
            'image/png',
            0.9
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploadingQris(false);
      showToast('Terjadi kesalahan saat memproses gambar', 'error');
    }
  };


  const handleResetToDefaultQris = async () => {
    await updateSettings({ qris_url: '/qris-toko.png' });
    showToast('QRIS dikembalikan ke default /qris-toko.png', 'info');
  };

  const handleSaveStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      nama_toko: namaToko,
      tagline: tagline,
      alamat: alamat,
      telepon: telepon,
      ppn_persen: Number(ppnPersen),
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-lattice p-3 sm:p-5 lg:p-7 space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FAF3E0] text-[#8B0000] flex items-center justify-center font-bold text-xl border border-[#D4AF37]">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-calligraphy text-2xl font-bold text-[#8B0000]">
            Pengaturan QRIS Toko & Profil Restoran
          </h2>
          <p className="text-xs text-stone-500">
            Perubahan otomatis tersimpan ke Firestore tanpa harus build ulang aplikasi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Manajemen QRIS Toko */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏮</span>
              <h3 className="font-bold text-sm text-stone-900">
                Poster QRIS Aktif Toko
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Live Scanner Ready
            </span>
          </div>

          {/* QRIS Card Preview */}
          <div className="my-2">
            <QRISDisplay className="scale-95 sm:scale-100" />
          </div>

          {/* Upload Button & Fallback Controls */}
          <div className="w-full space-y-3 mt-4 pt-4 border-t border-stone-100">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUploadNewQris(f);
              }}
              className="hidden"
            />

            {/* Progress Bar */}
            {isUploadingQris && qrisUploadProgress !== null && (
              <div className="w-full">
                <div className="flex justify-between text-xs font-bold text-[#8B0000] mb-1">
                  <span>Mengunggah ke Firebase Storage...</span>
                  <span>{qrisUploadProgress}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#8B0000] transition-all"
                    style={{ width: `${qrisUploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={isUploadingQris}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#C8102E] hover:brightness-110 text-[#FAF3E0] font-bold text-xs shadow-md border border-[#D4AF37] flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploadingQris ? 'Mengunggah...' : 'Upload Gambar QRIS Baru (Ganti Barcode)'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefaultQris}
              className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Kembalikan ke Gambar Bawaan (/qris-toko.png)
            </button>

            <div className="p-3 bg-[#FAF3E0] rounded-xl border border-[#D4AF37]/50 text-[11px] text-stone-700 space-y-1">
              <p className="font-bold text-[#8B0000] flex items-center gap-1">
                <span>💡</span> Tips Gambar QRIS:
              </p>
              <p>
                Gunakan gambar square rasio 1:1 dengan kontras kode QR tinggi agar mudah di-scan oleh kamera HP pelanggan.
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Pengaturan Informasi Restoran & Struk */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-4">
              <Store className="w-5 h-5 text-[#8B0000]" />
              <h3 className="font-bold text-sm text-stone-900">
                Informasi Restoran & Cetak Struk
              </h3>
            </div>

            <form onSubmit={handleSaveStoreProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nama Restoran / Toko:
                </label>
                <input
                  type="text"
                  required
                  value={namaToko}
                  onChange={(e) => setNamaToko(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Tagline / Deskripsi Singkat:
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Alamat Lengkap Toko:
                </label>
                <textarea
                  rows={2}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    No. Telepon Toko:
                  </label>
                  <input
                    type="text"
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Pajak PPN (%):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={ppnPersen}
                      onChange={(e) => setPpnPersen(Number(e.target.value))}
                      className="w-full pl-3 pr-8 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                    <Percent className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#C8102E] hover:brightness-110 text-white font-bold text-xs shadow-md border border-[#D4AF37] flex items-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" /> Simpan Pengaturan Restoran
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-3">
            <div>
              <h4 className="font-bold text-stone-800 mb-1">Status Sinkronisasi Firebase Cloud</h4>
              <p>
                Setiap kali Anda mengganti gambar QRIS atau menu, dokumen di Firestore langsung terupdate dan disiarkan ke seluruh kasir yang sedang aktif.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
