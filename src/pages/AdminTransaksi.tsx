import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Transaksi } from '../types';
import { formatRupiah } from '../lib/rupiah';
import { formatTanggalWaktu } from '../lib/date';
import { Modal } from '../components/Common/Modal';
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Maximize2,
  Printer,
  ChevronDown,
} from 'lucide-react';

export const AdminTransaksi: React.FC = () => {
  const {
    transaksiList,
    updateTransaksiStatus,
    setSelectedChatTransactionId,
    setActivePage,
    settings,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [activeReceiptTrx, setActiveReceiptTrx] = useState<Transaksi | null>(null);

  const filteredList = useMemo(() => {
    return transaksiList.filter((trx) => {
      const matchStatus =
        statusFilter === 'Semua' || trx.status === statusFilter;
      const matchSearch =
        searchTerm === '' ||
        trx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trx.nama_kasir.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trx.catatan && trx.catatan.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [transaksiList, statusFilter, searchTerm]);

  const handleChatAboutTrx = (trxId: string) => {
    setSelectedChatTransactionId(trxId);
    setActivePage('chat');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-lattice p-3 sm:p-5 lg:p-7 space-y-5">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF3E0] text-[#8B0000] flex items-center justify-center font-bold text-xl border border-[#D4AF37]">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-calligraphy text-2xl font-bold text-[#8B0000]">
              Riwayat & Verifikasi Transaksi
            </h2>
            <p className="text-xs text-stone-500">
              Validasi bukti transfer QRIS dan arsip struk penjualan
            </p>
          </div>
        </div>

        {/* Status Count Pill */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
            {transaksiList.filter((t) => t.status === 'selesai').length} Selesai
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
            {transaksiList.filter((t) => t.status === 'pending_verifikasi').length} Pending QRIS
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari ID nota TRX, nama kasir, atau nomor meja..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['Semua', 'pending_verifikasi', 'selesai', 'dibatalkan'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#8B0000] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {st === 'Semua' ? 'Semua Status' : st.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF3E0] border-b-2 border-[#D4AF37]/40 text-stone-800 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Waktu & Kasir</th>
                <th className="py-3 px-4">Metode & Bukti</th>
                <th className="py-3 px-4">Total Bayar</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-400">
                    Tidak ditemukan data transaksi yang cocok.
                  </td>
                </tr>
              ) : (
                filteredList.map((trx) => (
                  <tr key={trx.id} className="hover:bg-stone-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-stone-900">{trx.id}</div>
                      {trx.catatan && (
                        <div className="text-[11px] text-stone-500 italic">
                          &quot;{trx.catatan}&quot;
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-stone-800 font-medium">
                        {formatTanggalWaktu(trx.tanggal_waktu)}
                      </div>
                      <div className="text-[11px] text-stone-400">Kasir: {trx.nama_kasir}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                          {trx.metode_bayar}
                        </span>
                        {trx.url_bukti_qris && (
                          <button
                            type="button"
                            onClick={() => setSelectedProofUrl(trx.url_bukti_qris!)}
                            className="flex items-center gap-1 text-[11px] text-[#8B0000] font-bold hover:underline cursor-pointer"
                          >
                            <img
                              src={trx.url_bukti_qris}
                              alt="Thumbnail Bukti"
                              className="w-7 h-7 rounded object-cover border border-[#D4AF37]"
                            />
                            <span>Lihat Bukti</span>
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-extrabold text-[#8B0000]">
                      {formatRupiah(trx.total_bayar)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          trx.status === 'selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : trx.status === 'pending_verifikasi'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {trx.status === 'selesai' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : trx.status === 'pending_verifikasi' ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{trx.status.replace('_', ' ')}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Tombol Verifikasi jika QRIS Pending */}
                        {trx.status === 'pending_verifikasi' && (
                          <button
                            type="button"
                            onClick={() => updateTransaksiStatus(trx.id, 'selesai')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                            title="Konfirmasi Pembayaran Lunas"
                          >
                            Verifikasi
                          </button>
                        )}

                        {/* Tombol Chat tentang Transaksi */}
                        <button
                          type="button"
                          onClick={() => handleChatAboutTrx(trx.id)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#FAF3E0] text-[#8B0000] border border-stone-200 transition cursor-pointer"
                          title="Tanyakan via Chat Internal"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {/* Cetak Struk */}
                        <button
                          type="button"
                          onClick={() => setActiveReceiptTrx(trx)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition cursor-pointer"
                          title="Lihat Struk Thermal"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lightbox Preview Bukti QRIS */}
      {selectedProofUrl && (
        <Modal
          isOpen={Boolean(selectedProofUrl)}
          onClose={() => setSelectedProofUrl(null)}
          title="Bukti Transfer QRIS"
          subtitle="Diupload oleh kasir / pelanggan saat transaksi"
          maxWidth="md"
        >
          <div className="flex flex-col items-center">
            <div className="w-full aspect-square bg-stone-900 rounded-2xl overflow-hidden border-2 border-[#D4AF37] flex items-center justify-center">
              <img
                src={selectedProofUrl}
                alt="Bukti Transfer QRIS Full"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-3 flex gap-2 w-full">
              <a
                href={selectedProofUrl}
                download="bukti-qris.jpg"
                className="flex-1 py-2 rounded-xl bg-stone-100 text-stone-800 font-bold text-xs flex items-center justify-center gap-1 border hover:bg-stone-200 transition"
              >
                Unduh Foto
              </a>
              <button
                type="button"
                onClick={() => setSelectedProofUrl(null)}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-white font-bold text-xs hover:brightness-110 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Cetak Struk Thermal */}
      {activeReceiptTrx && (
        <Modal
          isOpen={Boolean(activeReceiptTrx)}
          onClose={() => setActiveReceiptTrx(null)}
          title="Salinan Struk Transaksi"
          subtitle={activeReceiptTrx.id}
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
                onClick={() => setActiveReceiptTrx(null)}
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
                <span className="font-bold">{activeReceiptTrx.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{activeReceiptTrx.nama_kasir}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{formatTanggalWaktu(activeReceiptTrx.tanggal_waktu)}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="uppercase font-bold">{activeReceiptTrx.metode_bayar}</span>
              </div>
            </div>

            <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-2">
              {activeReceiptTrx.items && activeReceiptTrx.items.length > 0 ? (
                activeReceiptTrx.items.map((item, idx) => (
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
                  <span className="font-semibold">{formatRupiah(activeReceiptTrx.total_bayar)}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL:</span>
                <span>{formatRupiah(activeReceiptTrx.total_bayar)}</span>
              </div>
              {activeReceiptTrx.metode_bayar === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Uang Diterima:</span>
                    <span>{formatRupiah(activeReceiptTrx.jumlah_diterima)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Kembalian:</span>
                    <span>{formatRupiah(activeReceiptTrx.kembalian)}</span>
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
