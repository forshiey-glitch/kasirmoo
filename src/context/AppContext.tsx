import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  MenuItem,
  CartItem,
  Transaksi,
  DetailTransaksi,
  MessageItem,
  StoreSettings,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_MENU,
  INITIAL_TRANSAKSI,
  INITIAL_MESSAGES,
  INITIAL_SETTINGS,
} from '../data/mockData';
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
  getDocFromServer,
} from 'firebase/firestore';

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
  switchUser: (uid: string) => void;
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
  syncInitialDataToFirestore: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('longmen_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[1]; // Default to Mei Ling (kasir) for immediate testing
  });

  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('longmen_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [menuList, setMenuList] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('longmen_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU;
  });

  const [transaksiList, setTransaksiList] = useState<Transaksi[]>(() => {
    const saved = localStorage.getItem('longmen_transaksi');
    return saved ? JSON.parse(saved) : INITIAL_TRANSAKSI;
  });

  const [messages, setMessages] = useState<MessageItem[]>(() => {
    const saved = localStorage.getItem('longmen_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('longmen_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('longmen_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [activePage, setActivePage] = useState<string>('kasir');
  const [selectedChatTransactionId, setSelectedChatTransactionId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Sync state to localStorage for persistence in demo mode
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('longmen_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('longmen_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('longmen_menu', JSON.stringify(menuList));
  }, [menuList]);

  useEffect(() => {
    localStorage.setItem('longmen_transaksi', JSON.stringify(transaksiList));
  }, [transaksiList]);

  useEffect(() => {
    localStorage.setItem('longmen_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('longmen_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('longmen_users', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('longmen_cart', JSON.stringify(cart));
  }, [cart]);

  // Connect to Firebase Firestore listeners if configured
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

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
      // Menu listener
      const unsubMenu = onSnapshot(
        collection(firestore, 'menu'),
        (snap) => {
          if (isMounted && !snap.empty) {
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
          if (isMounted && !snap.empty) {
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
          if (isMounted && !snap.empty) {
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
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Find in user profiles or set default
        const match = usersList.find((u) => u.email === user.email || u.uid === user.uid);
        if (match) {
          setCurrentUser(match);
        }
      }
    });
    return () => unsubscribe();
  }, [usersList]);

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

  // Login handler
  const login = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    if (isFirebaseConfigured && auth) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, pass);
        const match = usersList.find((u) => u.email === email || u.uid === userCred.user.uid);
        if (match) {
          if (!match.status_aktif) {
            await firebaseSignOut(auth);
            return { success: false, message: 'Akun Anda dinonaktifkan oleh Admin. Hubungi manager.' };
          }
          setCurrentUser(match);
          showToast(`Selamat datang kembali, ${match.nama_lengkap}! 🏮`, 'success');
          setActivePage(match.role === 'admin' ? 'admin-dashboard' : 'kasir');
          return { success: true };
        }
      } catch (err: unknown) {
        // Jika akun belum dibuat di Firebase Console, cek apakah cocok dengan akun demo lokal
        const demoMatch = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (demoMatch) {
          if (!demoMatch.status_aktif) {
            return { success: false, message: 'Akun Anda dinonaktifkan oleh Admin. Hubungi manager.' };
          }
          setCurrentUser(demoMatch);
          showToast(`Masuk sebagai ${demoMatch.nama_lengkap} (Mode demo / lokal) 🏮`, 'info');
          setActivePage(demoMatch.role === 'admin' ? 'admin-dashboard' : 'kasir');
          return { success: true };
        }
        const errorMsg = err instanceof Error ? err.message : String(err);
        return { success: false, message: 'Gagal login Firebase: ' + errorMsg };
      }
    }

    // Local / Demo Login Match
    const match = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!match) {
      return { success: false, message: 'Email tidak ditemukan dalam sistem.' };
    }
    if (!match.status_aktif) {
      return { success: false, message: 'Akun ini dinonaktifkan oleh Manager.' };
    }

    setCurrentUser(match);
    showToast(`Login berhasil sebagai ${match.nama_lengkap} (${match.role}) 🏮`, 'success');
    setActivePage(match.role === 'admin' ? 'admin-dashboard' : 'kasir');
    return { success: true };
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
    clearCart();
    setActivePage('login');
    showToast('Berhasil keluar dari sesi kasir.', 'info');
  };

  const switchUser = (uid: string) => {
    const user = usersList.find((u) => u.uid === uid);
    if (user) {
      setCurrentUser(user);
      showToast(`Beralih akun ke: ${user.nama_lengkap} (${user.role.toUpperCase()})`, 'info');
    }
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

  const syncInitialDataToFirestore = async () => {
    if (!isFirebaseConfigured || !db) {
      showToast('Firebase belum terkonfigurasi di environment (.env)', 'warning');
      return;
    }
    try {
      const firestore = db;
      const batch = writeBatch(firestore);

      // Seed Menu
      INITIAL_MENU.forEach((item) => {
        const itemRef = doc(firestore, 'menu', item.id);
        batch.set(itemRef, item, { merge: true });
      });

      // Seed QRIS Settings
      const settingsRef = doc(firestore, 'settings', 'qris');
      batch.set(settingsRef, INITIAL_SETTINGS, { merge: true });

      // Seed Users
      INITIAL_USERS.forEach((u) => {
        const uRef = doc(firestore, 'users', u.uid);
        batch.set(uRef, u, { merge: true });
      });

      await batch.commit();
      showToast('Data awal restoran (15 menu & QRIS) berhasil diunggah ke Firestore! 🏮', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Sync initial data Firestore:', msg);
      showToast('Gagal inisialisasi ke Firestore: ' + msg, 'error');
    }
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
        switchUser,
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
        syncInitialDataToFirestore,
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
