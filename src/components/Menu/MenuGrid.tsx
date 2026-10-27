import React, { useState, useMemo } from 'react';
import { MenuItem } from '../../types';
import { MenuCard } from './MenuCard';
import { useApp } from '../../context/AppContext';
import { Search } from 'lucide-react';

interface MenuGridProps {
  searchTerm?: string;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ searchTerm = '' }) => {
  const { menuList, cart, addToCart, updateCartQty } = useApp();
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');

  // Extract all categories
  const categories = useMemo(() => {
    const cats = ['Semua', 'Dim Sum', 'Hidangan Utama', 'Nasi & Mie', 'Minuman & Teh', 'Pencuci Mulut'];
    // Add any custom categories from menuList if not listed
    menuList.forEach((m) => {
      if (m.kategori && !cats.includes(m.kategori)) {
        cats.push(m.kategori);
      }
    });
    return cats;
  }, [menuList]);

  // Filter items
  const filteredItems = useMemo(() => {
    return menuList.filter((item) => {
      const matchKategori = selectedKategori === 'Semua' || item.kategori === selectedKategori;
      const matchSearch =
        searchTerm.trim() === '' ||
        item.nama_menu.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchKategori && matchSearch;
    });
  }, [menuList, selectedKategori, searchTerm]);

  const getKategoriEmoji = (cat: string) => {
    switch (cat) {
      case 'Dim Sum':
        return '🥟';
      case 'Hidangan Utama':
        return '🍗';
      case 'Nasi & Mie':
        return '🍜';
      case 'Minuman & Teh':
        return '🍵';
      case 'Pencuci Mulut':
        return '🍡';
      default:
        return '🏮';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category Horizontal Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none px-1">
        {categories.map((cat) => {
          const isSelected = selectedKategori === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedKategori(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-[#FAF3E0] shadow-md border border-[#D4AF37]'
                  : 'bg-white hover:bg-[#FAF3E0] text-stone-700 border border-stone-200'
              }`}
            >
              <span>{getKategoriEmoji(cat)}</span>
              <span>{cat}</span>
              {cat === 'Semua' ? (
                <span className="text-[10px] opacity-75">({menuList.length})</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Grid of Menus: Mobile 2 cols, Tablet 3 cols, Desktop 4 cols */}
      <div className="flex-1 overflow-y-auto pr-1 pb-20 md:pb-6">
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[#D4AF37]/30 rounded-2xl bg-white/50">
            <Search className="w-10 h-10 text-stone-400 mb-2" />
            <h4 className="font-calligraphy text-2xl text-[#8B0000]">Tidak ada hidangan</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              Tidak ditemukan hidangan yang cocok dengan kata kunci &quot;{searchTerm}&quot; atau kategori ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredItems.map((item) => {
              const inCart = cart.find((c) => c.menu.id === item.id);
              const qty = inCart ? inCart.qty : 0;

              return (
                <MenuCard
                  key={item.id}
                  item={item}
                  cartQty={qty}
                  onAddToCart={(m) => addToCart(m, 1)}
                  onUpdateCartQty={(delta) => updateCartQty(item.id, delta)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
