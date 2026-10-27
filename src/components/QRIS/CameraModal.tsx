import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, SwitchCamera, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (blob: Blob, dataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileFallbackRef = useRef<HTMLInputElement | null>(null);

  // Start Camera Stream
  const startCamera = async (mode: 'environment' | 'user') => {
    setErrorMsg(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser ini tidak mendukung akses kamera langsung');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Gagal membuka kamera:', msg);
      setErrorMsg(
        'Izin kamera tidak diberikan atau perangkat tidak mendukung. Gunakan upload file sebagai alternatif.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedImage]);

  // Switch between front & back camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame to Canvas
  const takePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedImage(dataUrl);
          stopCamera();
        }
      },
      'image/jpeg',
      0.85
    );
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    startCamera(facingMode);
  };

  const confirmPhoto = () => {
    if (capturedBlob && capturedImage) {
      onCapture(capturedBlob, capturedImage);
      onClose();
    }
  };

  // Fallback upload if getUserMedia fails
  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        onCapture(file, reader.result as string);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 backdrop-blur-md animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between text-white py-2 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">📷</span>
          <div>
            <h3 className="font-calligraphy text-2xl font-bold text-[#F5C542]">
              Kamera Bukti Pembayaran
            </h3>
            <p className="text-xs text-stone-300">Arahkan ke layar HP pelanggan / struk transfer</p>
          </div>
        </div>

        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Center Viewport */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden my-2 rounded-2xl border-2 border-[#D4AF37] bg-black">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Preview Foto"
            className="w-full h-full object-contain"
          />
        ) : errorMsg ? (
          <div className="text-center p-6 max-w-sm bg-stone-900/90 rounded-2xl border border-red-500/50 text-white">
            <AlertCircle className="w-12 h-12 text-[#C8102E] mx-auto mb-3" />
            <p className="text-sm text-stone-200 mb-4">{errorMsg}</p>
            <input
              type="file"
              ref={fileFallbackRef}
              accept="image/*"
              capture="environment"
              onChange={handleFallbackFile}
              className="hidden"
            />
            <button
              onClick={() => fileFallbackRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-[#FAF3E0] font-bold text-sm shadow-md hover:brightness-110 cursor-pointer"
            >
              Pilih dari File / Buka Kamera HP
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Viewfinder Target Guide */}
        {!capturedImage && !errorMsg && (
          <div className="absolute inset-8 pointer-events-none border-2 border-dashed border-[#D4AF37]/60 rounded-2xl flex items-center justify-center">
            <span className="text-xs font-semibold bg-black/60 text-[#F5C542] px-3 py-1 rounded-full border border-[#D4AF37]/40">
              Posisikan Bukti Transfer QRIS di Sini
            </span>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="py-3 flex items-center justify-center gap-6 z-10">
        {capturedImage ? (
          <>
            <button
              onClick={retakePhoto}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 text-stone-200 font-semibold border border-stone-600 hover:bg-stone-700 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Foto Ulang
            </button>
            <button
              onClick={confirmPhoto}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#388E3C] text-white font-bold shadow-lg hover:brightness-110 cursor-pointer"
            >
              <Check className="w-5 h-5" /> Gunakan Foto Ini
            </button>
          </>
        ) : (
          <>
            {/* Switch Camera */}
            <button
              onClick={toggleFacingMode}
              className="p-3.5 rounded-full bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-600 cursor-pointer"
              title="Ganti Kamera Depan/Belakang"
            >
              <SwitchCamera className="w-6 h-6" />
            </button>

            {/* Shutter Button */}
            <button
              onClick={takePhoto}
              disabled={Boolean(errorMsg)}
              className="w-20 h-20 rounded-full bg-[#FAF3E0] border-4 border-[#C8102E] flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-30"
              title="Ambil Foto"
            >
              <div className="w-14 h-14 rounded-full bg-[#C8102E] flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </div>
            </button>

            {/* Hidden spacer to center shutter */}
            <div className="w-12 h-12" />
          </>
        )}
      </div>
    </div>
  );
};
