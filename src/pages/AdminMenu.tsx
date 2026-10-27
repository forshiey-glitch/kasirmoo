import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem } from '../types';
import { formatRupiah } from '../lib/rupiah';
import { Modal } from '../components/Common/Modal';
import { ConfirmDialog } from '../components/Common/ConfirmDialog';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  UtensilsCrossed,
  Image as ImageIcon,
} from 'lucide-react';

export const AdminMenu: React.FC = () => {
  const { menuList, addMenu, updateMenu, deleteMenu } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [formNama, setFormNama] = useState('');
  const [formKategori, setFormKategori] = useState('Dim Sum');
  const [formHarga, setFormHarga] = useState<number>(30000);
  const [formStok, setFormStok] = useState<number>(25);
  const [formStatus, setFormStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formGambarUrl, setFormGambarUrl] = useState('');

  // Delete Confirm State
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  const categories = ['Semua', 'Dim Sum', 'Hidangan Utama', 'Nasi & Mie', 'Minuman & Teh', 'Pencuci Mulut'];

  const filteredItems = useMemo(() => {
    return menuList.filter((item) => {
      const matchCat = selectedCategory === 'Semua' || item.kategori === selectedCategory;
      const matchSearch =
        searchTerm === '' ||
        item.nama_menu.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuList, selectedCategory, searchTerm]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormNama('');
    setFormKategori('Dim Sum');
    setFormHarga(25000);
    setFormStok(30);
    setFormStatus('aktif');
    setFormDeskripsi('');
    setFormGambarUrl('https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormNama(item.nama_menu);
    setFormKategori(item.kategori);
    setFormHarga(item.harga);
    setFormStok(item.stok);
    setFormStatus(item.status);
    setFormDeskripsi(item.deskripsi || '');
    setFormGambarUrl(item.gambar_url || '');
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) return;

    if (editingItem) {
      await updateMenu(editingItem.id, {
        nama_menu: formNama,
        kategori: formKategori,
        harga: Number(formHarga),
        stok: Number(formStok),
        status: formStatus,
        deskripsi: formDeskripsi,
        gambar_url: formGambarUrl,
      });
    } else {
      await addMenu({
        nama_menu: formNama,
        kategori: formKategori,
        harga: Number(formHarga),
        stok: Number(formStok),
        status: formStatus,
        deskripsi: formDeskripsi,
        gambar_url: formGambarUrl,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-lattice p-3 sm:p-5 lg:p-7 space-y-5">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF3E0] text-[#8B0000] flex items-center justify-center font-bold text-xl border border-[#D4AF37]">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-calligraphy text-2xl font-bold text-[#8B0000]">
              Manajemen Daftar Menu
            </h2>
            <p className="text-xs text-stone-500">
              Total {menuList.length} menu terdaftar di database
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#C8102E] hover:brightness-110 text-[#FAF3E0] font-bold text-xs shadow-md border border-[#D4AF37] flex items-center gap-2 cursor-pointer transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Tambah Menu Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#8B0000] text-[#FAF3E0] shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Grid of Menu */}
      <div className="bg-white rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF3E0] border-b-2 border-[#D4AF37]/40 text-stone-800 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Menu & Foto</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Harga Jual</th>
                <th className="py-3 px-4">Stok</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.gambar_url || 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=100'}
                        alt={item.nama_menu}
                        className="w-11 h-11 rounded-lg object-cover border border-[#D4AF37]/40 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-stone-900 leading-snug">
                          {item.nama_menu}
                        </div>
                        {item.deskripsi && (
                          <div className="text-[11px] text-stone-400 line-clamp-1">
                            {item.deskripsi}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium">
                      {item.kategori}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-bold text-[#8B0000]">
                    {formatRupiah(item.harga)}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-xs ${
                        item.stok <= 5
                          ? 'bg-red-100 text-red-800'
                          : item.stok <= 15
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.stok} porsi
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() =>
                        updateMenu(item.id, {
                          status: item.status === 'aktif' ? 'nonaktif' : 'aktif',
                        })
                      }
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        item.status === 'aktif'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      {item.status === 'aktif' ? (
                        <>
                          <Check className="w-3 h-3" /> Aktif
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" /> Nonaktif
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#FAF3E0] text-[#8B0000] border border-stone-200 transition cursor-pointer"
                        title="Edit Menu"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-100 text-red-600 border border-stone-200 transition cursor-pointer"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Menu */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Hidangan Menu' : 'Tambah Hidangan Baru'}
        subtitle="Data akan otomatis tersinkron ke Firebase Firestore"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Nama Hidangan (disertai Hanzi jika ada):
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Hakau Udang Giok (水晶虾饺)"
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Kategori:
              </label>
              <select
                value={formKategori}
                onChange={(e) => setFormKategori(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] bg-white"
              >
                <option value="Dim Sum">Dim Sum 🥟</option>
                <option value="Hidangan Utama">Hidangan Utama 🍗</option>
                <option value="Nasi & Mie">Nasi & Mie 🍜</option>
                <option value="Minuman & Teh">Minuman & Teh 🍵</option>
                <option value="Pencuci Mulut">Pencuci Mulut 🍡</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Status Menu:
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] bg-white"
              >
                <option value="aktif">Aktif (Dijual)</option>
                <option value="nonaktif">Nonaktif (Disembunyikan)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Harga Jual (Rp):
              </label>
              <input
                type="number"
                required
                min={0}
                step={1000}
                value={formHarga}
                onChange={(e) => setFormHarga(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Stok Porsi:
              </label>
              <input
                type="number"
                required
                min={0}
                value={formStok}
                onChange={(e) => setFormStok(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              URL Foto Makanan:
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formGambarUrl}
              onChange={(e) => setFormGambarUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Deskripsi Singkat:
            </label>
            <textarea
              rows={2}
              placeholder="Bahan utama, rasa, atau catatan sajian..."
              value={formDeskripsi}
              onChange={(e) => setFormDeskripsi(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-white text-xs font-bold shadow-md hover:brightness-110 cursor-pointer"
            >
              {editingItem ? 'Simpan Perubahan' : 'Tambahkan ke Menu'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      {itemToDelete && (
        <ConfirmDialog
          isOpen={Boolean(itemToDelete)}
          onClose={() => setItemToDelete(null)}
          onConfirm={() => deleteMenu(itemToDelete.id)}
          title="Hapus Menu Makanan"
          message={`Apakah Anda yakin ingin menghapus "${itemToDelete.nama_menu}" dari daftar menu? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Ya, Hapus"
        />
      )}
    </div>
  );
};
