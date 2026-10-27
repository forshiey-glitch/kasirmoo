import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, parseRupiah } from '../../lib/rupiah';
import { QRISDisplay } from '../QRIS/QRISDisplay';
import { UploadBuktiQRIS } from '../QRIS/UploadBuktiQRIS';
import { Modal } from '../Common/Modal';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Banknote,
  QrCode,
  FileText,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { Transaksi } from '../../types';

interface CartPanelProps {
  onCloseMobile?: () => void;
  className?: string;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  onCloseMobile,
  className = '',
}) => {
  const {
    cart,
    removeFromCart,
    updateCartQty,
    setCartItemCatatan,
    clearCart,
    cartSubtotal,
    cartTax,
    cartTotal,
    createTransaksi,
    settings,
  } = useApp();

  // Payment State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('cash');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [uploadedQrisProof, setUploadedQrisProof] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedTrx, setCompletedTrx] = useState<Transaksi | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const cashAmount = parseRupiah(cashGiven);
  const changeAmount = Math.max(0, cashAmount - cartTotal);
  const isCashSufficient = cashAmount >= cartTotal;

  // Quick cash buttons
  const setQuickCash = (amt: number) => {
    setCashGiven(amt.toString());
  };

  const handleCheckoutSubmit = async () => {
    try {
      setIsSubmitting(true);
      const trx = await createTransaksi({
        metode_bayar: paymentMethod,
        url_bukti_qris: uploadedQrisProof || undefined,
        catatan: orderNotes || undefined,
        jumlah_diterima: paymentMethod === 'cash' ? cashAmount : cartTotal,
        kembalian: paymentMethod === 'cash' ? changeAmount : 0,
      });

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C8102E', '#D4AF37', '#F5C542', '#8B0000'],
      });

      setIsCheckoutOpen(false);
      setCompletedTrx(trx);
      setIsReceiptOpen(true);
      setCashGiven('');
      setOrderNotes('');
      setUploadedQrisProof('');
      if (onCloseMobile) onCloseMobile();
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`bg-[#FAF7F2] rounded-2xl border-2 border-[#D4AF37] shadow-lg flex flex-col h-full overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-[#FAF3E0] flex items-center justify-between border-b-2 border-[#D4AF37]">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#F5C542]" />
          <div>
            <h3 className="font-calligraphy text-xl font-bold leading-none">
              Keranjang Pesanan
            </h3>
            <span className="text-[11px] text-[#F5C542]">
              {cart.reduce((sum, item) => sum + item.qty, 0)} item dipilih
            </span>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-[#FAF3E0]/80 hover:text-white flex items-center gap-1 hover:bg-white/10 px-2 py-1 rounded-lg transition cursor-pointer"
            title="Kosongkan Keranjang"
          >
            <Trash2 className="w-3.5 h-3.5" /> Bersihkan
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {cart.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <span className="text-4xl mb-2">🥢</span>
            <p className="font-semibold text-sm text-stone-600">Keranjang masih kosong</p>
            <p className="text-xs text-stone-400 mt-0.5">
              Klik menu hidangan di sebelah kiri untuk menambahkan pesanan
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.menu.id}
              className="bg-white p-3 rounded-xl border border-stone-200/80 shadow-xs flex flex-col gap-2 transition hover:border-[#D4AF37]/60"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h5 className="font-semibold text-stone-900 text-xs sm:text-sm leading-tight">
                    {item.menu.nama_menu}
                  </h5>
                  <span className="text-xs font-bold text-[#8B0000]">
                    {formatRupiah(item.menu.harga)}
                  </span>
                </div>

                {/* Subtotal Item */}
                <div className="text-right">
                  <span className="font-bold text-xs text-stone-800">
                    {formatRupiah(item.menu.harga * item.qty)}
                  </span>
                </div>
              </div>

              {/* Stepper + Catatan Bar */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                <input
                  type="text"
                  placeholder="Catatan (misal: pedas, kuah pisah)..."
                  value={item.catatan || ''}
                  onChange={(e) => setCartItemCatatan(item.menu.id, e.target.value)}
                  className="text-[11px] text-stone-600 placeholder-stone-400 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 w-36 sm:w-44 focus:outline-none focus:border-[#D4AF37]"
                />

                <div className="flex items-center gap-1.5 bg-[#FAF3E0] rounded-lg border border-[#D4AF37]/50 p-0.5">
                  <button
                    onClick={() => updateCartQty(item.menu.id, -1)}
                    className="w-6 h-6 rounded-md bg-white text-[#8B0000] flex items-center justify-center hover:bg-stone-100 shadow-xs transition cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-xs text-[#8B0000]">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateCartQty(item.menu.id, 1)}
                    disabled={item.qty >= item.menu.stok}
                    className="w-6 h-6 rounded-md bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-white flex items-center justify-center hover:brightness-110 shadow-xs transition disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.menu.id)}
                    className="p-1 text-stone-400 hover:text-red-600 transition ml-1 cursor-pointer"
                    title="Hapus item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Action */}
      {cart.length > 0 && (
        <div className="p-4 bg-[#F5EFE6] border-t-2 border-[#D4AF37] space-y-3 shrink-0">
          <div className="space-y-1.5 text-xs text-stone-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">{formatRupiah(cartSubtotal)}</span>
            </div>
            {settings.ppn_persen ? (
              <div className="flex justify-between text-stone-500">
                <span>PPN ({settings.ppn_persen}%)</span>
                <span>{formatRupiah(cartTax)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-sm sm:text-base font-extrabold text-[#8B0000] pt-1.5 border-t border-[#D4AF37]/30">
              <span>Total Tagihan</span>
              <span>{formatRupiah(cartTotal)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B0000] via-[#C8102E] to-[#8B0000] hover:brightness-110 text-[#FAF3E0] font-bold text-sm shadow-lg hover:shadow-xl transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-[#D4AF37]"
          >
            <span>🏮 Proses Pembayaran</span>
            <span>({formatRupiah(cartTotal)})</span>
          </button>
        </div>
      )}

      {/* Modal Checkout / Pembayaran */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Pembayaran Kasir"
        subtitle="Pilih metode Cash atau QRIS Toko"
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Total Tagihan Banner */}
          <div className="bg-[#FAF3E0] p-4 rounded-2xl border-2 border-[#D4AF37] text-center">
            <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider block">
              Total Pembayaran
            </span>
            <span className="font-extrabold text-2xl sm:text-3xl text-[#8B0000]">
              {formatRupiah(cartTotal)}
            </span>
          </div>

          {/* Toggle Metode Bayar: Cash / QRIS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 font-bold text-sm transition cursor-pointer ${
                paymentMethod === 'cash'
                  ? 'border-[#8B0000] bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-[#FAF3E0] shadow-md'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Banknote className="w-5 h-5" />
              <span>Tunai (Cash)</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('qris')}
              className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2.5 font-bold text-sm transition cursor-pointer ${
                paymentMethod === 'qris'
                  ? 'border-[#D4AF37] bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-[#FAF3E0] shadow-md'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span>QRIS Digital</span>
            </button>
          </div>

          {/* Tab Cash Form */}
          {paymentMethod === 'cash' ? (
            <div className="space-y-4 bg-white p-4 rounded-2xl border border-stone-200">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Nominal Uang Diterima dari Pelanggan:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 font-bold text-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div>
                <span className="text-[11px] text-stone-500 font-medium block mb-1.5">
                  Pilihan Cepat:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickCash(cartTotal)}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#FAF3E0] text-stone-700 border border-stone-200 text-xs font-semibold cursor-pointer"
                  >
                    Uang Pas ({formatRupiah(cartTotal)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCash(50000)}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#FAF3E0] text-stone-700 border border-stone-200 text-xs font-semibold cursor-pointer"
                  >
                    Rp 50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCash(100000)}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#FAF3E0] text-stone-700 border border-stone-200 text-xs font-semibold cursor-pointer"
                  >
                    Rp 100.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCash(200000)}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#FAF3E0] text-stone-700 border border-stone-200 text-xs font-semibold cursor-pointer"
                  >
                    Rp 200.000
                  </button>
                </div>
              </div>

              {/* Change calculation */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#D4AF37]/50 flex items-center justify-between">
                <span className="text-sm font-bold text-stone-700">Uang Kembalian:</span>
                <span
                  className={`text-lg font-extrabold ${
                    changeAmount >= 0 && isCashSufficient ? 'text-[#2E7D32]' : 'text-[#C8102E]'
                  }`}
                >
                  {isCashSufficient ? formatRupiah(changeAmount) : 'Uang Kurang'}
                </span>
              </div>
            </div>
          ) : (
            /* Tab QRIS Display & Proof Upload */
            <div className="space-y-4">
              <div className="flex justify-center">
                <QRISDisplay amount={cartTotal} />
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200">
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  Lampirkan Bukti Transfer Pelanggan (Kamera / Galeri):
                </label>
                <UploadBuktiQRIS
                  idTransaksi={`TRX-${Date.now()}`}
                  currentUrl={uploadedQrisProof}
                  onUploaded={(url) => setUploadedQrisProof(url)}
                />
              </div>
            </div>
          )}

          {/* Catatan Transaksi */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Catatan Pesanan / Meja (Opsional):
            </label>
            <input
              type="text"
              placeholder="Contoh: Meja 12, Dibungkus, atau Tamu VIP"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Submit Checkout Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isSubmitting || (paymentMethod === 'cash' && !isCashSufficient)}
              onClick={handleCheckoutSubmit}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B0000] via-[#C8102E] to-[#8B0000] hover:brightness-110 text-[#FAF3E0] font-bold text-sm shadow-xl transition active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 border border-[#D4AF37]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isSubmitting
                  ? 'Menyimpan Transaksi...'
                  : paymentMethod === 'cash'
                  ? 'Konfirmasi Pembayaran Tunai'
                  : 'Selesaikan Pembayaran QRIS'}
              </span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Struk Transaksi Selesai */}
      {completedTrx && (
        <Modal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          title="Struk Transaksi Berhasil"
          subtitle={completedTrx.id}
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
                onClick={() => setIsReceiptOpen(false)}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-white font-bold text-xs hover:brightness-110 cursor-pointer"
              >
                Selesai / Pesanan Baru
              </button>
            </div>
          }
        >
          {/* Struk Thermal Style */}
          <div className="bg-white p-5 rounded-xl border border-stone-300 font-mono text-xs text-stone-800 shadow-inner space-y-3">
            <div className="text-center border-b border-dashed border-stone-300 pb-3">
              <p className="font-calligraphy text-2xl text-[#8B0000] font-bold">
                {settings.nama_toko || 'Restoran LongMen'}
              </p>
              <p className="text-[10px] text-stone-500">{settings.tagline}</p>
              <p className="text-[10px] text-stone-500">{settings.alamat}</p>
              <p className="text-[10px] text-stone-500">Telp: {settings.telepon}</p>
            </div>

            <div className="space-y-1 text-[11px] border-b border-dashed border-stone-300 pb-2">
              <div className="flex justify-between">
                <span>No. TRX:</span>
                <span className="font-bold">{completedTrx.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{completedTrx.nama_kasir}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{new Date(completedTrx.tanggal_waktu).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="uppercase font-bold">{completedTrx.metode_bayar}</span>
              </div>
              {completedTrx.catatan && (
                <div className="flex justify-between text-stone-500">
                  <span>Catatan:</span>
                  <span>{completedTrx.catatan}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-2">
              {completedTrx.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <div>
                    <span>{item.nama_menu}</span>
                    <span className="text-stone-400 block text-[9px]">
                      {item.qty} x {formatRupiah(item.harga_satuan)}
                    </span>
                  </div>
                  <span className="font-semibold">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Total Calculation */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL:</span>
                <span>{formatRupiah(completedTrx.total_bayar)}</span>
              </div>
              {completedTrx.metode_bayar === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Tunai:</span>
                    <span>{formatRupiah(completedTrx.jumlah_diterima)}</span>
                  </div>
                  <div className="flex justify-between text-[#2E7D32] font-bold">
                    <span>Kembalian:</span>
                    <span>{formatRupiah(completedTrx.kembalian)}</span>
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
