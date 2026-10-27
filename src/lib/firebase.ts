import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';

/**
 * Konfigurasi Firebase dari Environment Variables (.env / Vercel Environment Variables)
 * Format menggunakan prefix standar Vite: VITE_FIREBASE_*
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'your_api_key' &&
  firebaseConfig.apiKey !== 'your_api_key_here'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
// Firebase Storage telah dihapus dan digantikan oleh Cloudinary untuk upload gambar
let storage = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);

    // Menggunakan experimentalAutoDetectLongPolling agar koneksi Firestore stabil
    // di dalam iframe preview, mobile browser, dan jaringan proxy tanpa error [code=unavailable]
    try {
      db = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
      });
    } catch {
      db = getFirestore(app);
    }

    console.log('🔥 Firebase Auth & Firestore berhasil diinisialisasi untuk project:', firebaseConfig.projectId);
  } catch (err) {
    console.error('❌ Gagal inisialisasi Firebase:', err);
  }
} else {
  console.error('❌ VITE_FIREBASE_* belum diisi di .env. Login tidak akan berfungsi sampai konfigurasi Firebase diisi.');
}

// Export instances (auth, db, storage)
export { app, auth, db, storage };
export default firebaseConfig;
