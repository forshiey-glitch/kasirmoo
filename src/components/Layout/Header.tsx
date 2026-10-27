import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../Common/Avatar';
import {
  MessageSquare,
  LogOut,
  Sparkles,
  ChevronDown,
  ShoppingBag,
  Sliders,
} from 'lucide-react';
 
interface HeaderProps {
  onToggleSidebar?: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}
 
export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  const {
    unreadCount,
    activePage,
    setActivePage,
    isFirebaseActive,
  } = useApp();
  const { currentUser, logout, isAdmin } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
 
  return (
    <header className="relative bg-gradient-to-r from-[#8B0000] via-[#C8102E] to-[#8B0000] text-[#FAF3E0] shadow-md border-b-2 border-[#D4AF37] px-4 py-3 z-30 shrink-0">
      {/* Decorative Cloud SVG Lattice on Header */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path
            d="M0 30 Q 75 0, 150 30 T 300 30 T 450 30 T 600 30 T 750 30 T 900 30 T 1050 30 T 1200 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      </div>
 
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 relative z-10">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActivePage(isAdmin ? 'admin-dashboard' : 'kasir')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FAF3E0] to-[#E9D8B4] text-[#C8102E] flex items-center justify-center font-bold text-2xl shadow border border-[#D4AF37] group-hover:scale-105 transition-transform">
              🏮
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-calligraphy text-2xl sm:text-3xl font-bold tracking-wider text-[#FAF3E0] leading-none drop-shadow">
                  龍門客棧
                </h1>
                <span className="hidden sm:inline-block font-sans text-xs uppercase px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#4A3000] font-bold tracking-wider">
                  LongMen POS
                </span>
              </div>
              <p className="text-[11px] text-[#F5C542] hidden md:block">
                Modern Chinese Restaurant & Tea House Point of Sale
              </p>
            </div>
          </div>
        </div>
 
        {/* Center: Search Bar if on Kasir page */}
        {onSearchChange !== undefined && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Cari menu dim sum, mie, bebek, atau teh... 🔍"
                value={searchTerm || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-4 pr-10 py-1.5 rounded-xl bg-[#FAF7F2] text-[#2C2420] placeholder-stone-400 border border-[#D4AF37] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
 
        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Firebase Status Badge */}
          {isFirebaseActive && (
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-950/60 text-emerald-300 border-emerald-500/50"
              title="Terhubung ke Firebase Auth & Firestore"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Firebase Live</span>
            </div>
          )}
 
          {/* Quick Chat Button with Badge */}
          <button
            onClick={() => setActivePage('chat')}
            className={`relative p-2 rounded-xl border border-[#D4AF37]/50 hover:bg-white/10 transition cursor-pointer flex items-center justify-center ${
              activePage === 'chat' ? 'bg-white/20 ring-2 ring-[#D4AF37]' : ''
            }`}
            title="Chat Staf & Admin"
          >
            <MessageSquare className="w-5 h-5 text-[#FAF3E0]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#D4AF37] text-[#4A3000] text-[10px] font-bold flex items-center justify-center px-1 border border-[#8B0000] animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
 
          {/* Switch Role / Admin Shortcut (Tablet/Desktop) */}
          {isAdmin ? (
            <button
              onClick={() => setActivePage(activePage.startsWith('admin') ? 'kasir' : 'admin-dashboard')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#F5C542] text-[#4A3000] font-bold text-xs shadow transition cursor-pointer"
            >
              {activePage.startsWith('admin') ? (
                <>
                  <ShoppingBag className="w-4 h-4" /> Buka Kasir
                </>
              ) : (
                <>
                  <Sliders className="w-4 h-4" /> Admin Panel
                </>
              )}
            </button>
          ) : null}
 
          {/* User Profile & Dropdown */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 sm:pl-2 sm:pr-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-[#D4AF37]/40 transition cursor-pointer"
              >
                <Avatar
                  name={currentUser.nama_lengkap}
                  url={currentUser.avatar_url}
                  size="sm"
                  role={currentUser.role}
                  showBadge
                />
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-[#FAF3E0] leading-tight">
                    {currentUser.nama_lengkap}
                  </div>
                  <div className="text-[10px] text-[#F5C542] uppercase tracking-wider">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#F5C542] hidden sm:block" />
              </button>
 
              {/* Dropdown Menu */}
              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-[#FAF7F2] rounded-xl shadow-2xl border-2 border-[#D4AF37] py-2 z-50 text-[#2C2420] animate-fadeIn">
                    <div className="px-4 py-2 border-b border-stone-200">
                      <p className="text-xs text-stone-500">Masuk sebagai</p>
                      <p className="font-bold text-sm text-[#8B0000]">{currentUser.nama_lengkap}</p>
                      <p className="text-xs text-stone-600">{currentUser.email}</p>
                    </div>
 
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#C8102E] hover:bg-red-50 flex items-center gap-2 cursor-pointer transition"
                      >
                        <LogOut className="w-4 h-4" /> Keluar dari Akun (Logout)
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
 
