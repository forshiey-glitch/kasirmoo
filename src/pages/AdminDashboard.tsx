import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../lib/rupiah';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  UtensilsCrossed,
  Receipt,
  CheckCircle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { transaksiList, menuList, setActivePage } = useApp();

  // Metrics
  const stats = useMemo(() => {
    const totalOmzet = transaksiList
      .filter((t) => t.status === 'selesai')
      .reduce((sum, t) => sum + t.total_bayar, 0);

    const pendingQris = transaksiList.filter((t) => t.status === 'pending_verifikasi').length;

    const totalTrxSelesai = transaksiList.filter((t) => t.status === 'selesai').length;

    const totalItemTerjual = transaksiList.reduce((sum, t) => {
      if (t.items) {
        return sum + t.items.reduce((s, i) => s + i.qty, 0);
      }
      return sum;
    }, 0);

    return {
      totalOmzet,
      pendingQris,
      totalTrxSelesai,
      totalItemTerjual,
    };
  }, [transaksiList]);

  // Top Selling Items
  const topItems = useMemo(() => {
    const counts: Record<string, { nama: string; qty: number; revenue: number }> = {};
    transaksiList.forEach((t) => {
      t.items?.forEach((i) => {
        if (!counts[i.nama_menu]) {
          counts[i.nama_menu] = { nama: i.nama_menu, qty: 0, revenue: 0 };
        }
        counts[i.nama_menu].qty += i.qty;
        counts[i.nama_menu].revenue += i.subtotal;
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [transaksiList]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-lattice p-3 sm:p-5 lg:p-7 space-y-6">
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-[#8B0000] via-[#C8102E] to-[#8B0000] p-6 rounded-3xl border-2 border-[#D4AF37] text-[#FAF3E0] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF3E0] text-[#8B0000] flex items-center justify-center text-3xl shadow-lg border border-[#D4AF37]">
            🏮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-calligraphy text-3xl font-bold text-[#FAF3E0]">
                Ringkasan Usaha Restoran
              </h2>
              <span className="font-sans text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#4A3000] uppercase tracking-wider">
                Manager Panel
              </span>
            </div>
            <p className="text-xs text-[#F5C542] mt-0.5">
              Pantau arus transaksi kasir, inventori stok, dan verifikasi QRIS secara real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setActivePage('admin-transaksi')}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-[#FAF3E0] hover:bg-[#F2E5C8] text-[#8B0000] font-bold text-xs shadow-md border border-[#D4AF37] flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Receipt className="w-4 h-4" /> Riwayat Transaksi
          </button>
          <button
            onClick={() => setActivePage('admin-menu')}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/30 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <UtensilsCrossed className="w-4 h-4" /> Kelola Menu
          </button>
        </div>
      </div>

      {/* 4 Cards Statistic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Omzet */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Omzet Selesai
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-[#8B0000] border border-[#D4AF37]/40">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#8B0000]">
            {formatRupiah(stats.totalOmzet)}
          </div>
          <div className="mt-2 text-xs text-emerald-700 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> Pembayaran lunas terkonfirmasi
          </div>
        </div>

        {/* Card 2: Total Transaksi Selesai */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Transaksi Sukses
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {stats.totalTrxSelesai} Nota
          </div>
          <div className="mt-2 text-xs text-stone-500">
            Termasuk tunai & digital QRIS
          </div>
        </div>

        {/* Card 3: Pending QRIS Verifications */}
        <div
          onClick={() => setActivePage('admin-transaksi')}
          className={`p-5 rounded-2xl border-2 shadow-sm hover:shadow-md transition cursor-pointer ${
            stats.pendingQris > 0
              ? 'bg-[#FFFDF5] border-[#F57C00] ring-1 ring-[#F57C00]'
              : 'bg-white border-[#D4AF37]/50'
          }`}
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F57C00]">
              Pending QRIS
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-[#F57C00]">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#F57C00]">
            {stats.pendingQris} Menunggu
          </div>
          <div className="mt-2 text-xs text-stone-600 flex items-center gap-1 font-medium">
            <span>Klik untuk verifikasi</span>
            <ArrowRight className="w-3 h-3 text-[#F57C00]" />
          </div>
        </div>

        {/* Card 4: Total Item Makanan Terjual */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Porsi Terjual
            </span>
            <div className="p-2 rounded-xl bg-red-50 text-[#C8102E] border border-red-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {stats.totalItemTerjual} Porsi
          </div>
          <div className="mt-2 text-xs text-stone-500">
            Dari {menuList.length} varian hidangan
          </div>
        </div>
      </div>

      {/* Lower Section: Top Selling Dishes + Recent Transactions Quick Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Hidangan Terlaris */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🥟</span>
              <h3 className="font-bold text-stone-900 text-sm">
                5 Hidangan Paling Laris
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#8B0000]">Volume Terjual</span>
          </div>

          <div className="space-y-3">
            {topItems.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">Belum ada data penjualan</p>
            ) : (
              topItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#FAF3E0] text-[#8B0000] font-bold text-[11px] flex items-center justify-center border border-[#D4AF37]">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-stone-800">{item.nama}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#8B0000]">{item.qty} Porsi</span>
                    <span className="text-[10px] text-stone-400 block">
                      {formatRupiah(item.revenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transaksi Terkini */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏮</span>
                <h3 className="font-bold text-stone-900 text-sm">
                  Transaksi Terkini Kasir
                </h3>
              </div>
              <button
                onClick={() => setActivePage('admin-transaksi')}
                className="text-xs font-bold text-[#8B0000] hover:underline cursor-pointer"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-2.5">
              {transaksiList.slice(0, 4).map((trx) => (
                <div
                  key={trx.id}
                  className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-800">{trx.id}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          trx.status === 'selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {trx.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      Kasir: {trx.nama_kasir} • Metode: {trx.metode_bayar.toUpperCase()}
                    </p>
                  </div>
                  <span className="font-extrabold text-sm text-[#8B0000]">
                    {formatRupiah(trx.total_bayar)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
