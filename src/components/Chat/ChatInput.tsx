import React, { useState, useRef } from 'react';
import { Send, Paperclip, Camera, X, Image as ImageIcon } from 'lucide-react';
import { CameraModal } from '../QRIS/CameraModal';
import { uploadToCloudinary } from '../../lib/cloudinary';

interface ChatInputProps {
  onSendMessage: (data: {
    isi_pesan: string;
    attachment_url?: string;
    attachment_type?: string;
    attachment_name?: string;
    id_transaksi?: string;
  }) => Promise<void>;
  referencedTransactionId?: string | null;
  onClearTransactionRef?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  referencedTransactionId,
  onClearTransactionRef,
}) => {
  const [text, setText] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    url: string;
    type: 'image' | 'file';
    name: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compress image helper
  const compressImage = async (fileOrBlob: File | Blob): Promise<{ blob: Blob; dataUrl: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max = 1200;
        if (width > max || height > max) {
          if (width > height) {
            height = Math.round((height * max) / width);
            width = max;
          } else {
            width = Math.round((width * max) / height);
            height = max;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        canvas.toBlob(
          (blob) => {
            resolve({ blob: blob || fileOrBlob, dataUrl });
          },
          'image/jpeg',
          0.8
        );
      };
      reader.readAsDataURL(fileOrBlob);
    });
  };

  // Upload attachment (gambar ke Cloudinary, dokumen kecil via dataUrl/Cloudinary)
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const isImg = file.type.startsWith('image/');

      if (isImg) {
        const { blob, dataUrl } = await compressImage(file);
        try {
          const secureUrl = await uploadToCloudinary(blob);
          setAttachedFile({ url: secureUrl, type: 'image', name: file.name });
        } catch {
          // Fallback lokal jika jaringan bermasalah
          setAttachedFile({ url: dataUrl, type: 'image', name: file.name });
        }
      } else {
        if (file.size > 5 * 1024 * 1024) {
          alert('Ukuran file maksimal 5MB');
          setIsUploading(false);
          return;
        }
        try {
          const secureUrl = await uploadToCloudinary(file);
          setAttachedFile({ url: secureUrl, type: 'file', name: file.name });
        } catch {
          const reader = new FileReader();
          reader.onload = () => {
            setAttachedFile({ url: reader.result as string, type: 'file', name: file.name });
          };
          reader.readAsDataURL(file);
        }
      }
    } catch (e) {
      console.warn('Upload attachment error:', e);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Camera Capture
  const handleCameraCapture = async (blob: Blob) => {
    try {
      setIsUploading(true);
      const { blob: compBlob, dataUrl } = await compressImage(blob);
      try {
        const secureUrl = await uploadToCloudinary(compBlob);
        setAttachedFile({ url: secureUrl, type: 'image', name: 'Foto Kamera.jpg' });
      } catch {
        setAttachedFile({ url: dataUrl, type: 'image', name: 'Foto Kamera.jpg' });
      }
    } catch (e) {
      console.warn('Camera upload chat error:', e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if ((!text.trim() && !attachedFile) || isUploading) return;
    const currentText = text.trim();
    const currentAttach = attachedFile;

    setText('');
    setAttachedFile(null);

    await onSendMessage({
      isi_pesan: currentText || (currentAttach ? `[Mengirim ${currentAttach.name}]` : ''),
      attachment_url: currentAttach?.url,
      attachment_type: currentAttach?.type,
      attachment_name: currentAttach?.name,
      id_transaksi: referencedTransactionId || undefined,
    });

    if (onClearTransactionRef) onClearTransactionRef();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-[#FAF7F2] p-3 border-t-2 border-[#D4AF37] flex flex-col gap-2">
      {/* Transaction reference banner if active */}
      {referencedTransactionId && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#FAF3E0] border border-[#D4AF37] text-xs">
          <span className="font-semibold text-[#8B0000]">
            🏮 Bertanya tentang transaksi: <strong className="font-mono">{referencedTransactionId}</strong>
          </span>
          <button
            onClick={onClearTransactionRef}
            className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Attachment Preview thumbnail before send */}
      {attachedFile && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#D4AF37]/50 max-w-sm">
          {attachedFile.type === 'image' ? (
            <img
              src={attachedFile.url}
              alt="Attach Preview"
              className="w-10 h-10 rounded-lg object-cover border"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500">
              <Paperclip className="w-5 h-5" />
            </div>
          )}
          <span className="text-xs font-medium text-stone-700 truncate flex-1">
            {attachedFile.name}
          </span>
          <button
            onClick={() => setAttachedFile(null)}
            className="p-1 text-stone-400 hover:text-red-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input controls bar */}
      <div className="flex items-end gap-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileUpload(f);
          }}
          className="hidden"
        />

        {/* Attachment Buttons */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2.5 rounded-xl bg-white hover:bg-[#FAF3E0] text-[#8B0000] border border-stone-300 transition cursor-pointer"
          title="Lampirkan File / Gambar"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsCameraOpen(true)}
          disabled={isUploading}
          className="p-2.5 rounded-xl bg-white hover:bg-[#FAF3E0] text-[#8B0000] border border-stone-300 transition cursor-pointer"
          title="Ambil Foto Langsung"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan untuk kasir atau manager... (Tekan Enter untuk kirim)"
            className="w-full resize-none py-2 px-3 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] max-h-24"
          />
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!text.trim() && !attachedFile) || isUploading}
          className="p-2.5 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-white hover:brightness-110 shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Kirim Pesan"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
