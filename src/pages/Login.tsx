import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';
import { Lock, Mail, LogIn, Sparkles, AlertCircle, ShieldCheck, User } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isFirebaseConfigured } = useApp() as any;
  const { usersList } = useAuth();

  const [email, setEmail] = useState('kasir1@longmen.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Silakan masukkan alamat email.');
      return;
    }
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Gagal masuk. Periksa kembali akun Anda.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-lattice flex items-center justify-center p-4 bg-[#FAF7F2]">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-[#D4AF37] shadow-2xl overflow-hidden animate-scaleUp">
        {/* Banner Imperial Red & Gold */}
        <div className="relative bg-gradient-to-r from-[#8B0000] via-[#C8102E] to-[#8B0000] text-[#FAF3E0] p-8 text-center border-b-4 border-[#D4AF37] overflow-hidden">
          {/* Cloud Decorative motif */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0,20 Q25,5 50,20 T100,20" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF3E0] text-[#C8102E] flex items-center justify-center font-bold text-3xl shadow-lg border-2 border-[#D4AF37] mb-3">
              🏮
            </div>
            <h2 className="font-calligraphy text-4xl font-bold tracking-wider text-[#FAF3E0] drop-shadow-md">
              龍門客棧
            </h2>
            <p className="text-sm font-bold text-[#F5C542] tracking-widest uppercase mt-1">
              LongMen POS System
            </p>
            <p className="text-xs text-[#FAF3E0]/80 mt-1 max-w-xs">
              Sistem Kasir Pintar Restoran & Rumah Teh Modern
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Alamat Email:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="kasir@longmen.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Kata Sandi:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B0000] via-[#C8102E] to-[#8B0000] hover:brightness-110 text-[#FAF3E0] font-bold text-sm shadow-lg border border-[#D4AF37] flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Kasir (登录)'}</span>
            </button>
          </form>

          {/* Quick Demo Logins Box */}
          <div className="pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Coba Akun Demo Instan:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('kasir1@longmen.com')}
                className="p-2.5 rounded-xl bg-[#FAF3E0] hover:bg-[#F2E5C8] border border-[#D4AF37]/50 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8B0000]">
                  <User className="w-3.5 h-3.5" /> Kasir (Mei Ling)
                </div>
                <div className="text-[10px] text-stone-500">Katalog & Checkout POS</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@longmen.com')}
                className="p-2.5 rounded-xl bg-[#FAF3E0] hover:bg-[#F2E5C8] border border-[#D4AF37]/50 text-left transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8B0000]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin (Master Chen)
                </div>
                <div className="text-[10px] text-stone-500">Dashboard & Settings</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-[11px] text-stone-500">
          Terintegrasi Firebase Auth & Firestore • Siap Deploy Vercel
        </div>
      </div>
    </div>
  );
};
