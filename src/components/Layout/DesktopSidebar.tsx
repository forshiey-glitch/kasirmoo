import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import {
  ShoppingBag,
  Receipt,
  MessageSquare,
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  QrCode,
} from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { activePage, setActivePage, unreadCount, cart } = useApp();
  const { isAdmin } = useAuth();

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const mainNav = [
    {
      id: 'kasir',
      label: 'Kasir Utama',
      chinese: '收银台',
      icon: <ShoppingBag className="w-5 h-5 shrink-0" />,
      badge: totalCartCount > 0 ? `${totalCartCount} item` : null,
    },
    {
      id: 'riwayat',
      label: 'Riwayat Transaksi',
      chinese: '交易记录',
      icon: <Receipt className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'chat',
      label: 'Chat Internal',
      chinese: '员工通讯',
      icon: <MessageSquare className="w-5 h-5 shrink-0" />,
      badge: unreadCount > 0 ? `${unreadCount} baru` : null,
      badgeColor: 'bg-[#C8102E] text-white',
    },
  ];

  const adminNav = [
    {
      id: 'admin-dashboard',
      label: 'Statistik & Analisis',
      chinese: '营业概览',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'admin-menu',
      label: 'Kelola Menu Makanan',
      chinese: '菜单管理',
      icon: <UtensilsCrossed className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'admin-transaksi',
      label: 'Verifikasi & Laporan',
      chinese: '订单审核',
      icon: <QrCode className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'admin-users',
      label: 'Staf & Kasir',
      chinese: '员工权限',
      icon: <Users className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'admin-settings',
      label: 'Pengaturan QRIS & Toko',
      chinese: '店铺设置',
      icon: <SettingsIcon className="w-5 h-5 shrink-0" />,
    },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col bg-[#FAF7F2] border-r-2 border-[#D4AF37] transition-all duration-300 relative select-none shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-6 z-20 w-7 h-7 rounded-full bg-[#FAF7F2] border-2 border-[#D4AF37] text-[#8B0000] flex items-center justify-center hover:bg-[#FAF3E0] shadow-md transition cursor-pointer"
        title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Top Banner inside sidebar */}
      <div className="p-4 border-b border-[#D4AF37]/30 flex items-center justify-between">
        {!collapsed ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏮</span>
              <span className="font-calligraphy text-2xl font-bold text-[#8B0000]">
                龍門餐飲
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium">Sistem Kasir Pintar</p>
          </div>
        ) : (
          <div className="mx-auto text-center">
            <span className="text-2xl">🏮</span>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {/* Section: Operasional Kasir */}
        <div>
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Operasional Harian
            </p>
          )}
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8B0000] to-[#C8102E] text-[#FAF3E0] shadow-md border border-[#D4AF37]'
                      : 'text-stone-700 hover:bg-stone-200/60'
                  }`}
                  title={item.label}
                >
                  {item.icon}
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <span>{item.label}</span>
                        <span className="block text-[10px] text-stone-400 opacity-80 -mt-0.5 font-calligraphy">
                          {item.chinese}
                        </span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.badgeColor || 'bg-[#D4AF37] text-[#4A3000]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section: Administrasi & Manager */}
        {isAdmin && (
          <div>
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1">
                <span>★</span> Menu Manager
              </p>
            )}
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#FAF3E0] text-[#8B0000] font-bold border-2 border-[#D4AF37] shadow-sm'
                        : 'text-stone-700 hover:bg-stone-200/60'
                    }`}
                    title={item.label}
                  >
                    {item.icon}
                    {!collapsed && (
                      <div className="flex-1">
                        <span>{item.label}</span>
                        <span className="block text-[10px] text-[#B89628] font-calligraphy">
                          {item.chinese}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#D4AF37]/30 bg-[#F4EDE0]">
        {!collapsed ? (
          <div className="text-center text-[11px] text-stone-500">
            <p className="font-calligraphy text-sm text-[#8B0000] font-bold">吉星高照 • 生意兴隆</p>
            <p>v2.4 Modern Chinese POS</p>
          </div>
        ) : (
          <div className="text-center text-xs font-calligraphy text-[#8B0000]">吉</div>
        )}
      </div>
    </aside>
  );
};
