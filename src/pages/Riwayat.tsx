import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Transaksi } from '../types';
import { formatRupiah } from '../lib/rupiah';
import { formatTanggalWaktu } from '../lib/date';
import { Modal } from '../components/Common/Modal';
import {
  Receipt,
  Search,
  MessageSquare,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
} from 'lucide-react';

export const Riwayat: React.FC = () => {
  const { transaksiList, setSelectedChatTransactionId, setActivePage, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrx, setSelectedTrx] = useState<Transaksi | null>(null);

  const filtered = useMemo(() => {
    return transaksiList.filter((t) => {
      const matchSearch =
        searchTerm === '' ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.nama_kasir.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.catatan && t.catatan.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [transaksiList, searchTerm]);

  const handleChat = (id: string) => {
    setSelectedChatTransactionId(id);
    setActivePage('chat');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-lattice p-3 sm:p-5 lg:p-7 space-y-4">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF3E0] text-[#8B0000] flex items-center justify-center font-bold text-xl border border-[#D4AF37]">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-calligraphy text-2xl font-bold text-[#8B0000]">
              Riwayat Transaksi Penjualan
            </h2>
            <p className="text-xs text-stone-500">
              Daftar nota transaksi kasir hari ini ({transaksiList.length} pesanan tercatat)
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor nota TRX..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          />
        </div>
      </div>

      {/* Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-400 bg-white rounded-2xl border border-dashed border-[#D4AF37]/40">
            <Receipt className="w-10 h-10 mx-auto mb-2 text-stone-300" />
            <p className="text-sm font-semibold text-stone-600">Tidak ada riwayat transaksi</p>
            <p className="text-xs text-stone-400 mt-0.5">Transaksi yang berhasil akan muncul di sini</p>
          </div>
        ) : (
          filtered.map((trx) => (
            <div
              key={trx.id}
              className="bg-white rounded-2xl border-2 border-[#D4AF37]/40 hover:border-[#D4AF37] p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5 mb-2.5">
                  <div>
                    <span className="font-mono font-bold text-sm text-stone-900 block">
                      {trx.id}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {formatTanggalWaktu(trx.tanggal_waktu)}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      trx.status === 'selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : trx.status === 'pending_verifikasi'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {trx.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-stone-600 mb-3">
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span className="font-semibold text-stone-800">{trx.nama_kasir}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metode:</span>
                    <span className="uppercase font-semibold text-stone-800">{trx.metode_bayar}</span>
                  </div>
                  {trx.catatan && (
                    <div className="flex justify-between text-stone-500 italic">
                      <span>Catatan:</span>
                      <span className="truncate max-w-[150px]">{trx.catatan}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t text-sm font-extrabold text-[#8B0000]">
                    <span>Total:</span>
                    <span>{formatRupiah(trx.total_bayar)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTrx(trx)}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-[#FAF3E0] text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#8B0000]" /> Struk
                </button>

                <button
                  type="button"
                  onClick={() => handleChat(trx.id)}
                  className="py-1.5 px-3 rounded-xl bg-[#FAF3E0] hover:bg-[#F2E5C8] text-[#8B0000] border border-[#D4AF37] text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                  title="Tanyakan transaksi ini di chat staf"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Cetak Struk */}
      {selectedTrx && (
        <Modal
          isOpen={Boolean(selectedTrx)}
          onClose={() => setSelectedTrx(null)}
          title="Struk Penjualan"
          subtitle={selectedTrx.id}
          maxWidth="sm"
          footer={
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-white text-stone-800 border border-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-stone-50 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak Resi
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrx(null)}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-white font-bold text-xs hover:brightness-110 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          }
        >
          <div className="bg-white p-5 rounded-xl border border-stone-300 font-mono text-xs text-stone-800 shadow-inner space-y-3">
            <div className="text-center border-b border-dashed border-stone-300 pb-3">
              <p className="font-calligraphy text-2xl text-[#8B0000] font-bold">
                {settings.nama_toko || 'Restoran LongMen'}
              </p>
              <p className="text-[10px] text-stone-500">{settings.tagline}</p>
              <p className="text-[10px] text-stone-500">{settings.alamat}</p>
            </div>

            <div className="space-y-1 text-[11px] border-b border-dashed border-stone-300 pb-2">
              <div className="flex justify-between">
                <span>No. TRX:</span>
                <span className="font-bold">{selectedTrx.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{selectedTrx.nama_kasir}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{formatTanggalWaktu(selectedTrx.tanggal_waktu)}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="uppercase font-bold">{selectedTrx.metode_bayar}</span>
              </div>
            </div>

            <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-2">
              {selectedTrx.items && selectedTrx.items.length > 0 ? (
                selectedTrx.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <div>
                      <span>{item.nama_menu}</span>
                      <span className="text-stone-400 block text-[9px]">
                        {item.qty} x {formatRupiah(item.harga_satuan)}
                      </span>
                    </div>
                    <span className="font-semibold">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-[11px]">
                  <span>Item Pesanan Menu</span>
                  <span className="font-semibold">{formatRupiah(selectedTrx.total_bayar)}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL:</span>
                <span>{formatRupiah(selectedTrx.total_bayar)}</span>
              </div>
              {selectedTrx.metode_bayar === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Uang Diterima:</span>
                    <span>{formatRupiah(selectedTrx.jumlah_diterima)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Kembalian:</span>
                    <span>{formatRupiah(selectedTrx.kembalian)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-center pt-2 border-t border-dashed border-stone-300 text-[10px] text-stone-500">
              <p>Terima Kasih atas Kunjungan Anda! 🏮</p>
              <p className="font-calligraphy text-sm text-[#8B0000]">谢谢光临 • 祝您用餐愉快</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
