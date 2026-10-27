import React, { useState } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useApp } from '../context/AppContext';
import { ChatList } from '../components/Chat/ChatList';
import { ChatWindow } from '../components/Chat/ChatWindow';
import { formatRupiah } from '../lib/rupiah';
import { formatTanggalWaktu } from '../lib/date';
import { Avatar } from '../components/Common/Avatar';
import { Receipt, User, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Chat: React.FC = () => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const {
    currentUser,
    usersList,
    transaksiList,
    selectedChatTransactionId,
    setSelectedChatTransactionId,
  } = useApp();

  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  // On mobile: state to toggle between channel list and chat messages
  const [mobileView, setMobileView] = useState<'list' | 'window'>('list');

  // Find recipient user info
  const recipientUser = selectedRecipientId
    ? usersList.find((u) => u.uid === selectedRecipientId)
    : null;

  // Find linked transaction if any
  const linkedTrx = selectedChatTransactionId
    ? transaksiList.find((t) => t.id === selectedChatTransactionId)
    : null;

  const handleSelectRecipient = (id: string | null) => {
    setSelectedRecipientId(id);
    if (isMobile) {
      setMobileView('window');
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-lattice p-2 sm:p-4 lg:p-6">
      <div className="flex-1 flex bg-[#FAF7F2] rounded-2xl border-2 border-[#D4AF37] shadow-xl overflow-hidden">
        {/* MOBILE LAYOUT (Full-Screen Switch: List <-> Window) */}
        {isMobile ? (
          mobileView === 'list' ? (
            <ChatList
              selectedRecipientId={selectedRecipientId}
              onSelectRecipient={handleSelectRecipient}
              className="w-full border-r-0"
            />
          ) : (
            <ChatWindow
              recipientId={selectedRecipientId}
              onBackMobile={() => setMobileView('list')}
              onSelectTransaction={(trxId) => setSelectedChatTransactionId(trxId)}
              className="w-full"
            />
          )
        ) : null}

        {/* TABLET LAYOUT (Split View: List 40% Kiri, Window 60% Kanan) */}
        {isTablet ? (
          <>
            <div className="w-[38%] shrink-0 h-full">
              <ChatList
                selectedRecipientId={selectedRecipientId}
                onSelectRecipient={handleSelectRecipient}
              />
            </div>
            <div className="flex-1 h-full">
              <ChatWindow
                recipientId={selectedRecipientId}
                onSelectTransaction={(trxId) => setSelectedChatTransactionId(trxId)}
              />
            </div>
          </>
        ) : null}

        {/* DESKTOP LAYOUT (3 Panel: List 260px, Window flex-1, Info Panel 280px) */}
        {isDesktop ? (
          <>
            {/* Panel 1: Channels & Contacts List */}
            <div className="w-64 shrink-0 h-full">
              <ChatList
                selectedRecipientId={selectedRecipientId}
                onSelectRecipient={handleSelectRecipient}
              />
            </div>

            {/* Panel 2: Active Chat Messages Window */}
            <div className="flex-1 h-full min-w-0">
              <ChatWindow
                recipientId={selectedRecipientId}
                onSelectTransaction={(trxId) => setSelectedChatTransactionId(trxId)}
              />
            </div>

            {/* Panel 3: Info Kontak & Info Transaksi Tertaut */}
            <div className="w-72 shrink-0 h-full bg-[#FAF3E0] border-l-2 border-[#D4AF37] p-4 flex flex-col gap-4 overflow-y-auto">
              {/* Profile Card */}
              <div className="bg-white p-4 rounded-2xl border border-[#D4AF37]/50 shadow-xs flex flex-col items-center text-center">
                {recipientUser ? (
                  <>
                    <Avatar
                      name={recipientUser.nama_lengkap}
                      url={recipientUser.avatar_url}
                      size="lg"
                      role={recipientUser.role}
                      showBadge
                      className="mb-2"
                    />
                    <h4 className="font-bold text-sm text-stone-900">
                      {recipientUser.nama_lengkap}
                    </h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] mt-0.5">
                      {recipientUser.role}
                    </span>
                    <p className="text-xs text-stone-500 mt-1">{recipientUser.email}</p>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sedang Bertugas
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B0000] to-[#C8102E] text-[#FAF3E0] flex items-center justify-center text-2xl shadow mb-2">
                      🏮
                    </div>
                    <h4 className="font-bold text-sm text-stone-900">Saluran Siaran</h4>
                    <p className="text-xs text-stone-500 mt-1">
                      Pesan dalam saluran ini akan diterima oleh seluruh kasir dan admin di restoran.
                    </p>
                  </>
                )}
              </div>

              {/* Linked Transaction Card if referenced */}
              {linkedTrx ? (
                <div className="bg-white p-4 rounded-2xl border-2 border-[#D4AF37] shadow-md space-y-2">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-xs font-bold text-[#8B0000] flex items-center gap-1">
                      <Receipt className="w-4 h-4" /> Detail Transaksi
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        linkedTrx.status === 'selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {linkedTrx.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex justify-between text-stone-600">
                      <span>No. Nota:</span>
                      <span className="font-mono font-bold">{linkedTrx.id}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Kasir:</span>
                      <span>{linkedTrx.nama_kasir}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Metode:</span>
                      <span className="uppercase font-semibold">{linkedTrx.metode_bayar}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#8B0000] pt-1 border-t">
                      <span>Total:</span>
                      <span>{formatRupiah(linkedTrx.total_bayar)}</span>
                    </div>
                  </div>

                  {linkedTrx.url_bukti_qris && (
                    <div className="mt-2 pt-2 border-t">
                      <span className="text-[10px] text-stone-400 font-semibold block mb-1">
                        Bukti Transfer:
                      </span>
                      <img
                        src={linkedTrx.url_bukti_qris}
                        alt="Bukti QRIS"
                        className="w-full h-24 object-cover rounded-lg border border-[#D4AF37]"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedChatTransactionId(null)}
                    className="w-full mt-1 text-[11px] text-stone-500 hover:text-stone-800 text-center py-1 cursor-pointer"
                  >
                    Tutup Info Transaksi
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-[#D4AF37]/50 text-center text-stone-500">
                  <Receipt className="w-6 h-6 mx-auto mb-1 text-stone-400" />
                  <p className="text-xs font-semibold">Tautan Transaksi</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    Klik nomor transaksi di riwayat atau chat untuk melihat detail nota di sini.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
