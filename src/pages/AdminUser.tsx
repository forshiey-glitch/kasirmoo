import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, UserRole } from '../types';
import { Avatar } from '../components/Common/Avatar';
import { Modal } from '../components/Common/Modal';
import { Users, Plus, ShieldCheck, UserCheck, UserX, Mail, Key } from 'lucide-react';

export const AdminUser: React.FC = () => {
  const { usersList, addUser, updateUserStatus, currentUser } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [namaLengkap, setNamaLengkap] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('kasir');
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleOpenAdd = () => {
    setNamaLengkap('');
    setUsername('');
    setEmail('');
    setRole('kasir');
    setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim() || !email.trim()) return;

    await addUser({
      nama_lengkap: namaLengkap,
      username: username || email.split('@')[0],
      email: email.trim(),
      role: role,
      status_aktif: true,
      avatar_url: avatarUrl || undefined,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-lattice p-3 sm:p-5 lg:p-7 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border-2 border-[#D4AF37]/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF3E0] text-[#8B0000] flex items-center justify-center font-bold text-xl border border-[#D4AF37]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-calligraphy text-2xl font-bold text-[#8B0000]">
              Manajemen Staf & Hak Akses
            </h2>
            <p className="text-xs text-stone-500">
              Kelola akun kasir dan role manager restoran
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#C8102E] hover:brightness-110 text-[#FAF3E0] font-bold text-xs shadow-md border border-[#D4AF37] flex items-center gap-2 cursor-pointer transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Daftarkan Staf Baru
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {usersList.map((user) => {
          const isMe = user.uid === currentUser?.uid;

          return (
            <div
              key={user.uid}
              className={`bg-white rounded-2xl border-2 p-4 sm:p-5 shadow-sm flex flex-col justify-between transition ${
                user.status_aktif ? 'border-[#D4AF37]/40 hover:border-[#D4AF37]' : 'border-stone-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={user.nama_lengkap}
                      url={user.avatar_url}
                      size="lg"
                      role={user.role}
                      showBadge
                    />
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-stone-900 leading-snug">
                        {user.nama_lengkap}
                      </h4>
                      <p className="text-xs text-stone-500">@{user.username}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'admin'
                        ? 'bg-[#D4AF37]/20 text-[#8B0000] border border-[#D4AF37]'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>UID: {user.uid}</span>
                  </div>
                </div>
              </div>

              {/* Status Toggle Bar */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span
                  className={`text-xs font-semibold flex items-center gap-1 ${
                    user.status_aktif ? 'text-emerald-700' : 'text-stone-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      user.status_aktif ? 'bg-emerald-500' : 'bg-stone-300'
                    }`}
                  />
                  {user.status_aktif ? 'Akun Aktif' : 'Dinonaktifkan'}
                </span>

                {!isMe ? (
                  <button
                    type="button"
                    onClick={() => updateUserStatus(user.uid, !user.status_aktif)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 border ${
                      user.status_aktif
                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {user.status_aktif ? (
                      <>
                        <UserX className="w-3.5 h-3.5" /> Nonaktifkan
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" /> Aktifkan
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-[11px] text-stone-400 italic">Akun Anda saat ini</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tambah User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Daftarkan Akun Staf Baru"
        subtitle="Akun akan tersimpan di Firestore users/{uid}"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Nama Lengkap Karyawan:
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Lin Dan"
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Username:
              </label>
              <input
                type="text"
                placeholder="lindan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Role Akses:
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] bg-white"
              >
                <option value="kasir">Kasir (POS & Chat)</option>
                <option value="admin">Admin (Manager Penuh)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Alamat Email:
            </label>
            <input
              type="email"
              required
              placeholder="kasir@longmen.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              URL Foto Avatar (Opsional):
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
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
              Daftarkan Staf
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
