import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  MenuItem,
  CartItem,
  Transaksi,
  DetailTransaksi,
  MessageItem,
  StoreSettings,
} from '../types';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  getDoc,
  getDocFromServer,
} from 'firebase/firestore';

// Ambil profil user langsung dari Firestore (users/{uid}); role HANYA dari sini
const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { ...(snap.data() as Omit<UserProfile, 'uid'>), uid: snap.id } as UserProfile;
};

const getHomePageForRole = (role?: string): string | null => {
  if (role === 'admin') return 'admin-dashboard';
  if (role === 'kasir') return 'kasir';
  return null;
};

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  currentUser: UserProfile | null;
  usersList: UserProfile[];
  menuList: MenuItem[];
  transaksiList: Transaksi[];
  messages: MessageItem[];
  settings: StoreSettings;
  cart: CartItem[];
  activePage: string;
  isFirebaseActive: boolean;
  toasts: ToastState[];
  selectedChatTransactionId: string | null;

  // Actions
  setActivePage: (page: string) => void;
  setSelectedChatTransactionId: (id: string | null) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Cart Actions
  addToCart: (menu: MenuItem, qty?: number, catatan?: string) => void;
  removeFromCart: (menuId: string) => void;
  updateCartQty: (menuId: string, delta: number) => void;
  setCartItemCatatan: (menuId: string, catatan: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;

  // POS / Transaksi Actions
  createTransaksi: (data: {
    metode_bayar: 'cash' | 'qris';
    url_bukti_qris?: string;
    catatan?: string;
    jumlah_diterima?: number;
    kembalian?: number;
  }) => Promise<Transaksi>;
  updateTransaksiStatus: (id: string, status: 'selesai' | 'pending_verifikasi' | 'dibatalkan') => Promise<void>;
  updateBuktiQRIS: (id: string, url: string) => Promise<void>;

  // Menu Actions
  addMenu: (menu: Omit<MenuItem, 'id' | 'tanggal_ditambah'>) => Promise<void>;
  updateMenu: (id: string, menu: Partial<MenuItem>) => Promise<void>;
  deleteMenu: (id: string) => Promise<void>;

  // User Actions
  addUser: (user: Omit<UserProfile, 'uid'>) => Promise<void>;
  updateUserStatus: (uid: string, aktif: boolean) => Promise<void>;

  // Message Actions
  sendMessage: (data: {
    isi_pesan: string;
    id_penerima?: string | null;
    attachment_url?: string;
    attachment_type?: string;
    attachment_name?: string;
    id_transaksi?: string;
  }) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  unreadCount: number;

  // Settings Actions
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  // Sesi login dikelola Firebase Auth (lihat onAuthStateChanged), bukan localStorage
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const loginInProgress = useRef(false);

  const [usersList, setUsersList] = useState<UserProfile[]>([]);

  const [menuList, setMenuList] = useState<MenuItem[]>([]);

  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);

  const [messages, setMessages] = useState<MessageItem[]>([]);

  const [settings, setSettings] = useState<StoreSettings>(({} as StoreSettings));

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('longmen_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [activePage, setActivePage] = useState<string>('login');
  const [selectedChatTransactionId, setSelectedChatTransactionId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Kosongkan semua data di memori saat logout agar tidak bocor ke sesi berikutnya
  const resetData = () => {
    setUsersList([]);
    setMenuList([]);
    setTransaksiList([]);
    setMessages([]);
    setSettings({} as StoreSettings);
  };

  // Hanya keranjang belanja yang disimpan di localStorage (tidak berisi data user)
  // Bersihkan sisa data demo/sesi lokal lama dari browser
  useEffect(() => {
    [
      'longmen_current_user',
      'longmen_users',
      'longmen_menu',
      'longmen_transaksi',
      'longmen_messages',
      'longmen_settings',
    ].forEach((key) => localStorage.removeItem(key));
  }, []);

  useEffect(() => {
    localStorage.setItem('longmen_cart', JSON.stringify(cart));
  }, [cart]);

  // Connect to Firebase Firestore listeners if configured
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !currentUser) return;

    const firestore = db;
    let isMounted = true;

    // Test connection as recommended by Firebase skill
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(firestore, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.info('ℹ️ Firestore client beroperasi dalam mode cache offline.');
        }
      }
    };
    testConnection();

    const unsubs: (() => void)[] = [];

    try {
      // Users listener (profil staf dari Firestore)
      const unsubUsers = onSnapshot(
        collection(firestore, 'users'),
        (snap) => {
          if (isMounted) {
            const items: UserProfile[] = [];
            snap.forEach((docSnap) => items.push({ ...docSnap.data(), uid: docSnap.id } as UserProfile));
            setUsersList(items);
          }
        },
        (err) => {
          console.warn('Firestore users listener notice:', err.message);
        }
      );
      unsubs.push(unsubUsers);

      // Menu listener
      const unsubMenu = onSnapshot(
        collection(firestore, 'menu'),
        (snap) => {
          if (isMounted) {
            const items: MenuItem[] = [];
            snap.forEach((docSnap) => items.push({ id: docSnap.id, ...docSnap.data() } as MenuItem));
            setMenuList(items);
          }
        },
        (err) => {
          if (err.code === 'unavailable' || err.message?.includes('offline')) {
            console.info('ℹ️ Menu Firestore: beroperasi dalam mode cache offline.');
          } else {
            console.warn('Firestore menu listener notice:', err.message);
          }
        }
      );
      unsubs.push(unsubMenu);

      // Transaksi listener
      const unsubTrx = onSnapshot(
        query(collection(firestore, 'transaksi'), orderBy('tanggal_waktu', 'desc')),
        (snap) => {
          if (isMounted) {
            const items: Transaksi[] = [];
            snap.forEach((docSnap) => items.push({ id: docSnap.id, ...docSnap.data() } as Transaksi));
            setTransaksiList(items);
          }
        },
        (err) => {
          if (err.code === 'unavailable' || err.message?.includes('offline')) {
            console.info('ℹ️ Transaksi Firestore: beroperasi dalam mode cache offline.');
          } else {
            console.warn('Firestore transaksi listener notice:', err.message);
          }
        }
      );
      unsubs.push(unsubTrx);

      // Messages listener
      const unsubMsg = onSnapshot(
        query(collection(firestore, 'messages'), orderBy('waktu', 'asc')),
        (snap) => {
          if (isMounted) {
            const items: MessageItem[] = [];
            snap.forEach((docSnap) => items.push({ id: docSnap.id, ...docSnap.data() } as MessageItem));
            setMessages(items);
          }
        },
        (err) => {
          if (err.code === 'unavailable' || err.message?.includes('offline')) {
            console.info('ℹ️ Messages Firestore: beroperasi dalam mode cache offline.');
          } else {
            console.warn('Firestore messages listener notice:', err.message);
          }
        }
      );
      unsubs.push(unsubMsg);

      // Settings listener
      const unsubSettings = onSnapshot(
        doc(firestore, 'settings', 'qris'),
        (docSnap) => {
          if (isMounted && docSnap.exists()) {
            setSettings((prev) => ({ ...prev, ...docSnap.data() }));
          }
        },
        (err) => {
          if (err.code === 'unavailable' || err.message?.includes('offline')) {
            console.info('ℹ️ Settings Firestore: beroperasi dalam mode cache offline.');
          } else {
            console.warn('Firestore settings listener notice:', err.message);
          }
        }
      );
      unsubs.push(unsubSettings);
    } catch (e) {
      console.warn('Realtime listeners initialization:', e);
    }

    return () => {
      isMounted = false;
      unsubs.forEach((unsub) => unsub());
    };
  }, [currentUser?.uid]);

  // Listen to Firebase Auth state: pulihkan sesi dari Firestore (bukan dari data lokal)
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    const firebaseAuth = auth;
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        resetData();
        return;
      }
      if (loginInProgress.current) return; // login() yang menangani
      try {
        const profile = await fetchUserProfile(user.uid);
        const home = profile ? getHomePageForRole(profile.role) : null;
        if (!profile || !home || profile.status_aktif === false) {
          await firebaseSignOut(firebaseAuth);
          setCurrentUser(null);
          return;
        }
        setCurrentUser(profile);
        setActivePage((prev) => (prev === 'login' ? home : prev));
      } catch (e) {
        console.warn('Gagal memuat profil user:', e);
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.menu.harga * item.qty, 0);
  const cartTax = Math.round((cartSubtotal * (settings.ppn_persen || 0)) / 100);
  const cartTotal = cartSubtotal + cartTax;

  const addToCart = (menu: MenuItem, qty: number = 1, catatan?: string) => {
    if (menu.stok <= 0 || menu.status === 'nonaktif') {
      showToast(`Stok ${menu.nama_menu} sedang habis!`, 'warning');
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.menu.id === menu.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].qty;
        if (currentQty + qty > menu.stok) {
          showToast(`Maksimal stok tersisa ${menu.stok}`, 'warning');
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: currentQty + qty,
          catatan: catatan !== undefined ? catatan : updated[existingIndex].catatan,
        };
        return updated;
      } else {
        return [...prev, { menu, qty, catatan: catatan || '' }];
      }
    });
    showToast(`Ditambahkan ke keranjang: ${menu.nama_menu}`, 'success');
  };

  const removeFromCart = (menuId: string) => {
    setCart((prev) => prev.filter((item) => item.menu.id !== menuId));
  };

  const updateCartQty = (menuId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menu.id === menuId);
      if (!existing) return prev;
      const newQty = existing.qty + delta;
      if (newQty <= 0) {
        return prev.filter((item) => item.menu.id !== menuId);
      }
      if (newQty > existing.menu.stok) {
        showToast(`Stok ${existing.menu.nama_menu} hanya ${existing.menu.stok}`, 'warning');
        return prev;
      }
      return prev.map((item) => (item.menu.id === menuId ? { ...item, qty: newQty } : item));
    });
  };

  const setCartItemCatatan = (menuId: string, catatan: string) => {
    setCart((prev) =>
      prev.map((item) => (item.menu.id === menuId ? { ...item, catatan } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Login handler: murni Firebase Auth, role dibaca dari Firestore
  const login = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    if (!isFirebaseConfigured || !auth || !db) {
      return { success: false, message: 'Firebase belum terkonfigurasi. Hubungi administrator.' };
    }

    const firebaseAuth = auth;
    loginInProgress.current = true;
    try {
      const userCred = await signInWithEmailAndPassword(firebaseAuth, email, pass);
      const profile = await fetchUserProfile(userCred.user.uid);

      if (!profile) {
        await firebaseSignOut(firebaseAuth);
        return { success: false, message: 'Profil pengguna tidak ditemukan di database. Hubungi admin.' };
      }
      if (profile.status_aktif === false) {
        await firebaseSignOut(firebaseAuth);
        return { success: false, message: 'Akun Anda dinonaktifkan oleh Admin. Hubungi manager.' };
      }

      const homePage = getHomePageForRole(profile.role);
      if (!homePage) {
        await firebaseSignOut(firebaseAuth);
        return { success: false, message: 'Role akun tidak valid. Hubungi admin.' };
      }

      setCurrentUser(profile);
      setActivePage(homePage); // admin -> 'admin-dashboard', kasir -> 'kasir'
      showToast(`Selamat datang kembali, ${profile.nama_lengkap}! 🏮`, 'success');
      return { success: true };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      // Gagal setelah autentikasi (mis. baca Firestore): jangan biarkan sesi menggantung
      if (!code?.startsWith('auth/') && firebaseAuth.currentUser) {
        await firebaseSignOut(firebaseAuth).catch(() => {});
      }
      let message: string;
      switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          message = 'Email atau password salah.';
          break;
        case 'auth/invalid-email':
          message = 'Format email tidak valid.';
          break;
        case 'auth/too-many-requests':
          message = 'Terlalu banyak percobaan login. Coba lagi beberapa saat.';
          break;
        case 'auth/network-request-failed':
          message = 'Gagal terhubung ke server. Periksa koneksi internet.';
          break;
        case 'permission-denied':
          message = 'Tidak punya izin membaca profil pengguna. Periksa Firestore Rules.';
          break;
        default:
          message = 'Gagal login: ' + (err instanceof Error ? err.message : String(err));
      }
      return { success: false, message };
    } finally {
      loginInProgress.current = false;
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn('Firebase logout:', e);
      }
    }
    setCurrentUser(null);
    resetData();
    clearCart();
    setActivePage('login');
    showToast('Berhasil keluar dari sesi kasir.', 'info');
  };

  // Create Transaksi
  const createTransaksi = async (data: {
    metode_bayar: 'cash' | 'qris';
    url_bukti_qris?: string;
    catatan?: string;
    jumlah_diterima?: number;
    kembalian?: number;
  }): Promise<Transaksi> => {
    if (!currentUser) throw new Error('Pengguna belum login');
    if (cart.length === 0) throw new Error('Keranjang belanja kosong');

    const trxId = `TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();

    const detailItems: DetailTransaksi[] = cart.map((item) => ({
      id_transaksi: trxId,
      id_menu: item.menu.id,
      nama_menu: item.menu.nama_menu,
      harga_satuan: item.menu.harga,
      qty: item.qty,
      subtotal: item.menu.harga * item.qty,
    }));

    const statusAwal: 'selesai' | 'pending_verifikasi' =
      data.metode_bayar === 'qris' && !data.url_bukti_qris ? 'pending_verifikasi' : 'selesai';

    const newTrx: Transaksi = {
      id: trxId,
      tanggal_waktu: nowIso,
      id_kasir: currentUser.uid,
      nama_kasir: currentUser.nama_lengkap,
      total_bayar: cartTotal,
      metode_bayar: data.metode_bayar,
      url_bukti_qris: data.url_bukti_qris,
      status: statusAwal,
      catatan: data.catatan,
      jumlah_diterima: data.jumlah_diterima,
      kembalian: data.kembalian,
      items: detailItems,
    };

    // Deduct stock locally
    setMenuList((prev) =>
      prev.map((m) => {
        const inCart = cart.find((c) => c.menu.id === m.id);
        if (inCart) {
          const newStok = Math.max(0, m.stok - inCart.qty);
          return { ...m, stok: newStok };
        }
        return m;
      })
    );

    // Save to Firestore if connected
    if (isFirebaseConfigured && db) {
      try {
        const firestore = db;
        const batch = writeBatch(firestore);
        // Transaksi doc
        const trxRef = doc(firestore, 'transaksi', trxId);
        batch.set(trxRef, {
          tanggal_waktu: nowIso,
          id_kasir: currentUser.uid,
          nama_kasir: currentUser.nama_lengkap,
          total_bayar: cartTotal,
          metode_bayar: data.metode_bayar,
          url_bukti_qris: data.url_bukti_qris || '',
          status: statusAwal,
          catatan: data.catatan || '',
          jumlah_diterima: data.jumlah_diterima || 0,
          kembalian: data.kembalian || 0,
        });

        // Detail items
        detailItems.forEach((d, idx) => {
          const detailRef = doc(firestore, 'detail_transaksi', `${trxId}_${idx}`);
          batch.set(detailRef, d);
        });

        // Update menu stock
        cart.forEach((c) => {
          const menuRef = doc(firestore, 'menu', c.menu.id);
          const currentItem = menuList.find((m) => m.id === c.menu.id);
          if (currentItem) {
            batch.update(menuRef, { stok: Math.max(0, currentItem.stok - c.qty) });
          }
        });

        await batch.commit();
        console.log('✅ Transaksi tersimpan ke Firestore:', trxId);
      } catch (err) {
        console.warn('Gagal commit batch Firestore, tetap simpan lokal:', err);
      }
    }

    setTransaksiList((prev) => [newTrx, ...prev]);
    clearCart();
    showToast(`Transaksi ${trxId} berhasil diproses! 🏮`, 'success');
    return newTrx;
  };

  const updateTransaksiStatus = async (
    id: string,
    status: 'selesai' | 'pending_verifikasi' | 'dibatalkan'
  ) => {
    setTransaksiList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );

    if (isFirebaseConfigured && db) {
      try {
        const firestore = db;
        await updateDoc(doc(firestore, 'transaksi', id), { status });
      } catch (err) {
        console.warn('Update Firestore trx status:', err);
      }
    }
    showToast(`Status transaksi diubah menjadi: ${status.replace('_', ' ').toUpperCase()}`, 'info');
  };

  const updateBuktiQRIS = async (id: string, url: string) => {
    setTransaksiList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, url_bukti_qris: url, status: 'selesai' } : t))
    );

    if (isFirebaseConfigured && db) {
      try {
        const firestore = db;
        await updateDoc(doc(firestore, 'transaksi', id), {
          url_bukti_qris: url,
          status: 'selesai',
        });
      } catch (err) {
        console.warn('Update Firestore bukti QRIS:', err);
      }
    }
    showToast('Bukti transfer QRIS berhasil ditautkan!', 'success');
  };

  // Menu CRUD
  const addMenu = async (item: Omit<MenuItem, 'id' | 'tanggal_ditambah'>) => {
    const newId = `m-${Date.now().toString().slice(-4)}`;
    const newItem: MenuItem = {
      ...item,
      id: newId,
      tanggal_ditambah: new Date().toISOString().slice(0, 10),
    };

    setMenuList((prev) => [newItem, ...prev]);

    if (isFirebaseConfigured && db) {
      try {
        const firestore = db;
        await setDoc(doc(firestore, 'menu', newId), newItem);
      } catch (e) {
        console.warn('Add menu Firestore:', e);
      }
    }
    showToast(`Menu baru "${newItem.nama_menu}" berhasil ditambahkan`, 'success');
  };

  const updateMenu = async (id: string, update: Partial<MenuItem>) => {
    setMenuList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...update } : m))
    );

    if (isFirebaseConfigured && db) {
      try {
        const firestore = db;
        await updateDoc(doc(firestore, 'menu', id), update);
      } catch (e) {
        console.warn('Update menu Firestore:', e);
      }
    }
    showToast('Perubahan menu berhasil disimpan', 'success');
  };

  const deleteMenu = async (id: string) => {
    setMenuList((prev) => prev.filter((m) => m.id !== id));

    if (isFirebaseConfigured && db) {
      try {
        const firestore = db;
        await deleteDoc(doc(firestore, 'menu', id));
      } catch (e) {
        console.warn('Delete menu Firestore:', e);
      }
    }
    showToast('Menu berhasil dihapus dari daftar', 'info');
  };

  // User Actions
  const addUser = async (user: Omit<UserProfile, 'uid'>) => {
    const newUid = `user-${Date.now().toString().slice(-4)}`;
    const newUser: UserProfile = { ...user, uid: newUid };
    setUsersList((prev) => [...prev, newUser]);

    if (isFirebaseConfigured && db) {
      try {
        const firestore = db;
        await setDoc(doc(firestore, 'users', newUid), newUser);
      } catch (e) {
        console.warn('Add user Firestore:', e);
      }
    }
    showToast(`Karyawan baru "${newUser.nama_lengkap}" berhasil didaftarkan`, 'success');
  };

  const updateUserStatus = async (uid: string, status_aktif: boolean) => {
    setUsersList((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, status_aktif } : u))
    );

    if (isFirebaseConfigured && db) {
      try {
        const firestore = db;
        await updateDoc(doc(firestore, 'users', uid), { status_aktif });
      } catch (e) {
        console.warn('Update user status Firestore:', e);
      }
    }
    showToast(`Status staf diubah menjadi ${status_aktif ? 'Aktif' : 'Nonaktif'}`, 'info');
  };

  // Messages Actions
  const sendMessage = async (data: {
    isi_pesan: string;
    id_penerima?: string | null;
    attachment_url?: string;
    attachment_type?: string;
    attachment_name?: string;
    id_transaksi?: string;
  }) => {
    if (!currentUser) return;
    const msgId = `msg-${Date.now()}`;
    const newMsg: MessageItem = {
      id: msgId,
      id_pengirim: currentUser.uid,
      nama_pengirim: currentUser.nama_lengkap,
      role_pengirim: currentUser.role,
      id_penerima: data.id_penerima || null,
      isi_pesan: data.isi_pesan,
      attachment_url: data.attachment_url,
      attachment_type: data.attachment_type,
      attachment_name: data.attachment_name,
      waktu: new Date().toISOString(),
      sudah_dibaca: false,
      id_transaksi: data.id_transaksi,
    };

    setMessages((prev) => [...prev, newMsg]);

    if (isFirebaseConfigured && db) {
      try {
        const firestore = db;
        await setDoc(doc(firestore, 'messages', msgId), newMsg);
      } catch (e) {
        console.warn('Send message Firestore:', e);
      }
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, sudah_dibaca: true } : m))
    );

    if (isFirebaseConfigured && db) {
      try {
        const firestore = db;
        await updateDoc(doc(firestore, 'messages', messageId), { sudah_dibaca: true });
      } catch (e) {
        console.warn('Mark read Firestore:', e);
      }
    }
  };

  const unreadCount = messages.filter(
    (m) =>
      !m.sudah_dibaca &&
      m.id_pengirim !== currentUser?.uid &&
      (m.id_penerima === null || m.id_penerima === currentUser?.uid)
  ).length;

  // Settings Actions
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings, updated_at: new Date().toISOString() }));

    if (isFirebaseConfigured && db) {
      try {
        const firestore = db;
        await setDoc(
          doc(firestore, 'settings', 'qris'),
          {
            ...newSettings,
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn('Update settings Firestore:', e);
      }
    }
    showToast('Pengaturan toko & QRIS berhasil diperbarui! 🏮', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        usersList,
        menuList,
        transaksiList,
        messages,
        settings,
        cart,
        activePage,
        isFirebaseActive: isFirebaseConfigured,
        toasts,
        selectedChatTransactionId,
        setActivePage,
        setSelectedChatTransactionId,
        login,
        logout,
        showToast,
        removeToast,
        addToCart,
        removeFromCart,
        updateCartQty,
        setCartItemCatatan,
        clearCart,
        cartSubtotal,
        cartTax,
        cartTotal,
        createTransaksi,
        updateTransaksiStatus,
        updateBuktiQRIS,
        addMenu,
        updateMenu,
        deleteMenu,
        addUser,
        updateUserStatus,
        sendMessage,
        markMessageAsRead,
        unreadCount,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
