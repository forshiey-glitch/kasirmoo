import React from 'react';
import { UserProfile } from '../../types';
import { Avatar } from '../Common/Avatar';
import { useApp } from '../../context/AppContext';
import { Radio, Users } from 'lucide-react';

interface ChatListProps {
  selectedRecipientId: string | null; // null = Broadcast
  onSelectRecipient: (id: string | null) => void;
  className?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
  selectedRecipientId,
  onSelectRecipient,
  className = '',
}) => {
  const { usersList, currentUser, messages } = useApp();

  // Filter other users
  const otherUsers = usersList.filter((u) => u.uid !== currentUser?.uid);

  // Helper count unread for channel
  const getChannelUnread = (recipientId: string | null) => {
    return messages.filter((m) => {
      if (m.sudah_dibaca || m.id_pengirim === currentUser?.uid) return false;
      if (recipientId === null) {
        return m.id_penerima === null;
      }
      return m.id_pengirim === recipientId;
    }).length;
  };

  const broadcastUnread = getChannelUnread(null);

  return (
    <div className={`flex flex-col bg-[#FAF7F2] border-r-2 border-[#D4AF37] h-full ${className}`}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-[#FAF3E0] border-b-2 border-[#D4AF37]">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏮</span>
          <h3 className="font-calligraphy text-xl font-bold">Saluran Staf</h3>
        </div>
        <p className="text-[11px] text-[#F5C542]">Komunikasi internal kasir & manager</p>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {/* Broadcast All Channel */}
        <button
          onClick={() => onSelectRecipient(null)}
          className={`w-full p-3 rounded-xl flex items-center justify-between transition cursor-pointer text-left border ${
            selectedRecipientId === null
              ? 'bg-[#FAF3E0] border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]'
              : 'bg-white hover:bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B0000] to-[#C8102E] text-white flex items-center justify-center font-bold shadow-xs">
              <Radio className="w-5 h-5 text-[#F5C542]" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
                <span>Siaran Toko (Semua Staf)</span>
              </h4>
              <p className="text-[11px] text-stone-500">Pemberitahuan operasional umum</p>
            </div>
          </div>

          {broadcastUnread > 0 && (
            <span className="min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#C8102E] text-white text-[10px] font-bold flex items-center justify-center shadow">
              {broadcastUnread}
            </span>
          )}
        </button>

        {/* Separator for individual users */}
        <div className="pt-2 px-3">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3" /> Kontak Personal
          </p>
        </div>

        {/* Direct messages to each other user */}
        {otherUsers.map((user) => {
          const isSelected = selectedRecipientId === user.uid;
          const unread = getChannelUnread(user.uid);

          return (
            <button
              key={user.uid}
              onClick={() => onSelectRecipient(user.uid)}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer text-left border ${
                isSelected
                  ? 'bg-[#FAF3E0] border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]'
                  : 'bg-white hover:bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Avatar
                  name={user.nama_lengkap}
                  url={user.avatar_url}
                  size="md"
                  role={user.role}
                  showBadge
                />
                <div>
                  <h4 className="font-semibold text-xs text-stone-900 leading-tight">
                    {user.nama_lengkap}
                  </h4>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold">
                    {user.role}
                  </span>
                </div>
              </div>

              {unread > 0 && (
                <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#C8102E] text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
