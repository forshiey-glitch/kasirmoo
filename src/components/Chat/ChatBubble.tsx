import React, { useState } from 'react';
import { MessageItem } from '../../types';
import { formatWaktuSingkat } from '../../lib/date';
import { Avatar } from '../Common/Avatar';
import { Paperclip, FileText, Download, Maximize2, X, Receipt } from 'lucide-react';

interface ChatBubbleProps {
  message: MessageItem;
  isSelf: boolean;
  onSelectTransaction?: (trxId: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isSelf,
  onSelectTransaction,
}) => {
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  return (
    <div
      className={`flex items-end gap-2.5 my-2.5 ${
        isSelf ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Avatar for other senders */}
      {!isSelf && (
        <Avatar
          name={message.nama_pengirim}
          size="sm"
          role={message.role_pengirim}
          showBadge
        />
      )}

      {/* Bubble Container */}
      <div
        className={`max-w-[80%] sm:max-w-md rounded-2xl p-3.5 shadow-md flex flex-col gap-1.5 ${
          isSelf
            ? 'bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-[#FAF3E0] rounded-br-xs border border-[#D4AF37]'
            : 'bg-[#FAF3E0] text-[#2C2420] rounded-bl-xs border-2 border-[#D4AF37]/60'
        }`}
      >
        {/* Senders name if not self */}
        {!isSelf && (
          <div className="flex items-center justify-between gap-2 border-b border-[#D4AF37]/30 pb-1">
            <span className="font-bold text-xs text-[#8B0000]">
              {message.nama_pengirim}
            </span>
            <span className="text-[10px] uppercase font-semibold text-stone-500">
              {message.role_pengirim}
            </span>
          </div>
        )}

        {/* Transaction Reference Tag if attached */}
        {message.id_transaksi && (
          <button
            type="button"
            onClick={() => onSelectTransaction?.(message.id_transaksi!)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer text-left ${
              isSelf
                ? 'bg-white/20 text-[#FAF3E0] hover:bg-white/30'
                : 'bg-white text-[#8B0000] border border-[#D4AF37] hover:bg-[#FAF7F2]'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 shrink-0" />
            <span>Terkait: {message.id_transaksi}</span>
          </button>
        )}

        {/* Message Text */}
        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">
          {message.isi_pesan}
        </p>

        {/* Attachment rendering */}
        {message.attachment_url && (
          <div className="mt-1 pt-1 border-t border-black/10">
            {message.attachment_type === 'image' ? (
              <div className="relative rounded-xl overflow-hidden border border-[#D4AF37] max-w-xs group cursor-pointer bg-black/5">
                <img
                  src={message.attachment_url}
                  alt="Lampiran"
                  className="max-h-48 w-full object-cover group-hover:scale-102 transition"
                  onClick={() => setZoomImage(message.attachment_url!)}
                />
                <button
                  onClick={() => setZoomImage(message.attachment_url!)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                  title="Perbesar"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <a
                href={message.attachment_url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border transition ${
                  isSelf
                    ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                    : 'bg-white hover:bg-stone-50 border-stone-300 text-stone-800'
                }`}
              >
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                <span className="truncate flex-1">
                  {message.attachment_name || 'Lampiran Dokumen'}
                </span>
                <Download className="w-3.5 h-3.5 shrink-0 opacity-70" />
              </a>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-[10px] self-end mt-0.5 ${
            isSelf ? 'text-[#FAF3E0]/75' : 'text-stone-500'
          }`}
        >
          {formatWaktuSingkat(message.waktu)}
        </div>
      </div>

      {/* Lightbox Modal for Image Zoom */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setZoomImage(null)}
        >
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 p-2 text-white bg-white/20 rounded-full hover:bg-white/30 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={zoomImage}
            alt="Lampiran Diperbesar"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl border-2 border-[#D4AF37]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
