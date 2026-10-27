import React, { useState } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useApp } from '../context/AppContext';
import { MenuGrid } from '../components/Menu/MenuGrid';
import { CartPanel } from '../components/Menu/CartPanel';
import { BottomSheet } from '../components/Menu/BottomSheet';
import { Search, Sparkles } from 'lucide-react';

export const Kasir: React.FC = () => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const { cart, cartTotal } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-lattice p-3 sm:p-4 lg:p-6">
      {/* Mobile / Tablet In-Page Search Bar if not already in header */}
      <div className="md:hidden mb-3">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Cari dim sum, hidangan utama, teh... 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white text-sm text-stone-800 placeholder-stone-400 border border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs hover:text-stone-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 flex overflow-hidden gap-4 lg:gap-6">
        {/* Left Column: Menu Catalog (Full width on Mobile, 60% on Tablet, flex-1 on Desktop) */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <MenuGrid searchTerm={searchTerm} />
        </div>

        {/* Right Column: Persistent Cart Panel on Tablet (40%) and Desktop (380px) */}
        {(isTablet || isDesktop) && (
          <div className="w-[340px] lg:w-[380px] shrink-0 h-full flex flex-col">
            <CartPanel />
          </div>
        )}
      </div>

      {/* Mobile Slide-Up Bottom Sheet for Cart */}
      {isMobile && (
        <BottomSheet
          isOpen={isMobileCartOpen}
          onOpen={() => setIsMobileCartOpen(true)}
          onClose={() => setIsMobileCartOpen(false)}
          totalItems={totalCartCount}
          totalPrice={cartTotal}
        />
      )}
    </div>
  );
};
