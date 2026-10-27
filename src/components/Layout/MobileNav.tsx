import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { ShoppingBag, MessageSquare, Receipt, ShieldCheck, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activePage, setActivePage, unreadCount, cart } = useApp();
  const { isAdmin } = useAuth();

  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const navItems = [
    {
      id: 'kasir',
      label: 'Kasir',
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: totalCartItems > 0 ? totalCartItems : null,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      id: 'riwayat',
      label: 'Riwayat',
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      id: isAdmin ? 'admin-dashboard' : 'profile',
      label: isAdmin ? 'Admin' : 'Profil',
      icon: isAdmin ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2] border-t-2 border-[#D4AF37] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1 safe-area-inset-bottom">
      <div className="grid grid-cols-4 h-14 items-center">
        {navItems.map((item) => {
          const isActive =
            activePage === item.id ||
            (item.id === 'admin-dashboard' && activePage.startsWith('admin'));

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition-all cursor-pointer rounded-lg ${
                isActive
                  ? 'text-[#C8102E] font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C8102E] text-white text-[10px] font-bold flex items-center justify-center border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-1 bg-[#C8102E] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
