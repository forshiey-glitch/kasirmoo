import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { Avatar } from '../Common/Avatar';
import { Radio, ArrowLeft, Receipt } from 'lucide-react';

interface ChatWindowProps {
  recipientId: string | null;
  onBackMobile?: () => void;
  onSelectTransaction?: (trxId: string) => void;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  recipientId,
  onBackMobile,
  onSelectTransaction,
  className = '',
}) => {
  const {
    messages,
    sendMessage,
    markMessageAsRead,
    currentUser,
    usersList,
    selectedChatTransactionId,
    setSelectedChatTransactionId,
  } = useApp();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Recipient info
  const recipientUser = recipientId ? usersList.find((u) => u.uid === recipientId) : null;

  // Filter messages for this conversation
  const conversationMessages = messages.filter((m) => {
    if (recipientId === null) {
      return m.id_penerima === null; // Broadcast
    }
    return (
      (m.id_pengirim === currentUser?.uid && m.id_penerima === recipientId) ||
      (m.id_pengirim === recipientId && (m.id_penerima === currentUser?.uid || m.id_penerima === null))
    );
  });

  // Mark unread messages in view as read
  useEffect(() => {
    conversationMessages.forEach((m) => {
      if (!m.sudah_dibaca && m.id_pengirim !== currentUser?.uid) {
        markMessageAsRead(m.id);
      }
    });
  }, [conversationMessages, currentUser?.uid, markMessageAsRead]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length]);

  return (
    <div className={`flex flex-col bg-[#FAF7F2] h-full ${className}`}>
      {/* Top Header */}
      <div className="p-3.5 bg-gradient-to-r from-[#8B0000] via-[#C8102E] to-[#8B0000] text-[#FAF3E0] border-b-2 border-[#D4AF37] flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              className="md:hidden p-1.5 rounded-lg hover:bg-white/20 text-[#FAF3E0] cursor-pointer"
              title="Kembali ke Daftar Saluran"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {recipientUser ? (
            <div className="flex items-center gap-2.5">
              <Avatar
                name={recipientUser.nama_lengkap}
                url={recipientUser.avatar_url}
                size="sm"
                role={recipientUser.role}
                showBadge
              />
              <div>
                <h4 className="font-bold text-sm leading-tight text-[#FAF3E0]">
                  {recipientUser.nama_lengkap}
                </h4>
                <p className="text-[10px] text-[#F5C542] uppercase tracking-wider">
                  {recipientUser.role} • Aktif
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FAF3E0] text-[#8B0000] flex items-center justify-center font-bold">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight text-[#FAF3E0]">
                  Siaran Toko (Broadcast)
                </h4>
                <p className="text-[10px] text-[#F5C542]">Terbaca oleh seluruh staf aktif</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-lattice">
        {conversationMessages.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <span className="text-3xl mb-2">💬</span>
            <p className="font-semibold text-xs text-stone-600">Belum ada percakapan</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Tulis pesan pertama Anda di bawah untuk memulai obrolan
            </p>
          </div>
        ) : (
          conversationMessages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isSelf={msg.id_pengirim === currentUser?.uid}
              onSelectTransaction={onSelectTransaction}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={async (data) => {
          await sendMessage({
            ...data,
            id_penerima: recipientId,
          });
        }}
        referencedTransactionId={selectedChatTransactionId}
        onClearTransactionRef={() => setSelectedChatTransactionId(null)}
      />
    </div>
  );
};
