import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';
import { CameraModal } from './CameraModal';
import { uploadToCloudinary } from '../../lib/cloudinary';

interface UploadBuktiQRISProps {
  idTransaksi: string;
  currentUrl?: string;
  onUploaded: (downloadUrl: string) => void;
  className?: string;
}

export const UploadBuktiQRIS: React.FC<UploadBuktiQRISProps> = ({
  idTransaksi,
  currentUrl,
  onUploaded,
  className = '',
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  /**
   * Kompres gambar menggunakan HTML5 Canvas
   * Batasan: Max 1200px lebar/tinggi, Quality 0.8
   */
  const compressImage = async (
    fileOrBlob: File | Blob
  ): Promise<{ compressedBlob: Blob; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal inisialisasi context canvas'));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ compressedBlob: blob, dataUrl });
            } else {
              reject(new Error('Kompresi blob gagal'));
            }
          },
          'image/jpeg',
          0.8
        );
      };

      reader.readAsDataURL(fileOrBlob);
    });
  };

  // Proses upload ke Cloudinary (dengan fallback preview)
  const processAndUpload = async (fileOrBlob: File | Blob) => {
    let fallbackDataUrl = '';
    try {
      setIsUploading(true);
      setUploadProgress(15);
      setOriginalSize(fileOrBlob.size);

      // Kompres via Canvas
      const { compressedBlob, dataUrl } = await compressImage(fileOrBlob);
      fallbackDataUrl = dataUrl;
      setCompressedSize(compressedBlob.size);
      setPreviewUrl(dataUrl);

      // Upload langsung ke Cloudinary menggunakan preset unsigned kasir_qris
      const secureUrl = await uploadToCloudinary(compressedBlob, (percent) => {
        setUploadProgress(percent);
      });

      setUploadProgress(100);
      setIsUploading(false);
      onUploaded(secureUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Gagal upload ke Cloudinary:', msg);
      setIsUploading(false);
      // Tetap gunakan fallback dataUrl agar proses pembayaran kasir tidak macet
      if (fallbackDataUrl) {
        onUploaded(fallbackDataUrl);
      }
    }
  };

  // Handle Pilih dari Galeri
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndUpload(file);
  };

  // Handle Capture dari Kamera Modal
  const handleCameraCapture = (blob: Blob) => {
    processAndUpload(blob);
  };

  // Hapus preview
  const handleRemove = () => {
    setPreviewUrl(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setUploadProgress(null);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        onChange={handleGalleryChange}
        className="hidden"
      />

      {previewUrl ? (
        /* Preview & Detail Kompresi */
        <div className="relative bg-[#FAF3E0] p-3 rounded-2xl border-2 border-[#D4AF37] shadow-md flex flex-col sm:flex-row items-center gap-3">
          <div className="w-24 h-24 rounded-xl overflow-hidden border border-[#D4AF37]/60 shrink-0 bg-stone-100 relative group">
            <img
              src={previewUrl}
              alt="Bukti Transfer QRIS"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-[#2E7D32]">
              <CheckCircle2 className="w-4 h-4" /> Bukti Pembayaran Siap
            </div>
            {originalSize && compressedSize ? (
              <div className="mt-1 text-[11px] text-stone-600 space-y-0.5">
                <p>
                  Ukuran Asli: <span className="font-semibold">{formatBytes(originalSize)}</span>
                </p>
                <p>
                  Terkonversi: <span className="font-bold text-[#8B0000]">{formatBytes(compressedSize)}</span>{' '}
                  <span className="text-[10px] text-emerald-700">
                    (Hemat {Math.round((1 - compressedSize / originalSize) * 100)}%)
                  </span>
                </p>
              </div>
            ) : null}

            {/* Progress Bar jika sedang upload */}
            {isUploading && uploadProgress !== null && (
              <div className="mt-2 w-full">
                <div className="flex justify-between text-[10px] font-bold text-[#8B0000] mb-1">
                  <span>Mengunggah Bukti...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={isUploading}
            onClick={handleRemove}
            className="p-2 text-stone-400 hover:text-[#C8102E] hover:bg-red-50 rounded-xl transition cursor-pointer"
            title="Hapus Bukti"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Action Buttons: Kamera Langsung & Galeri */
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#C8102E] hover:from-[#A00000] hover:to-[#D41434] text-[#FAF3E0] text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Buka Kamera</span>
          </button>

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl bg-[#FAF3E0] hover:bg-[#F2E5C8] text-[#8B0000] border-2 border-[#D4AF37] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Pilih dari Galeri</span>
          </button>
        </div>
      )}

      {/* Modal Kamera Fullscreen */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
