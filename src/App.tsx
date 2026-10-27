import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Layout/Header';
import { DesktopSidebar } from './components/Layout/DesktopSidebar';
import { MobileNav } from './components/Layout/MobileNav';
import { ToastContainer } from './components/Common/Toast';
import { Login } from './pages/Login';
import { Kasir } from './pages/Kasir';
import { Chat } from './pages/Chat';
import { Riwayat } from './pages/Riwayat';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminMenu } from './pages/AdminMenu';
import { AdminTransaksi } from './pages/AdminTransaksi';
import { AdminUser } from './pages/AdminUser';
import { AdminSettings } from './pages/AdminSettings';

const MainLayout: React.FC = () => {
  const { currentUser, activePage } = useApp();

  // If not logged in, display Login page
  if (!currentUser || activePage === 'login') {
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    );
  }

  // Render current active page
  const renderPage = () => {
    switch (activePage) {
      case 'kasir':
        return <Kasir />;
      case 'chat':
        return <Chat />;
      case 'riwayat':
        return <Riwayat />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-menu':
        return <AdminMenu />;
      case 'admin-transaksi':
        return <AdminTransaksi />;
      case 'admin-users':
        return <AdminUser />;
      case 'admin-settings':
        return <AdminSettings />;
      default:
        if (currentUser?.role === 'admin') return <AdminDashboard />;
        if (currentUser?.role === 'kasir') return <Kasir />;
        return <Login />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF7F2] text-[#2C2420]">
      {/* Desktop Sidebar (Collapsible, 240px to 72px) */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Page Content */}
        <main className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0">
          {renderPage()}
        </main>

        {/* Mobile Fixed Bottom Nav (<= 767px) */}
        <MobileNav />
      </div>

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
