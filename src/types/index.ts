export type UserRole = 'admin' | 'kasir';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  role: UserRole;
  nama_lengkap: string;
  status_aktif: boolean;
  avatar_url?: string;
}

export interface MenuItem {
  id: string;
  nama_menu: string;
  kategori: string;
  harga: number;
  stok: number;
  status: 'aktif' | 'nonaktif';
  tanggal_ditambah: string;
  deskripsi?: string;
  gambar_url?: string;
}

export interface CartItem {
  menu: MenuItem;
  qty: number;
  catatan?: string;
}

export interface Transaksi {
  id: string;
  tanggal_waktu: string;
  id_kasir: string;
  nama_kasir: string;
  total_bayar: number;
  metode_bayar: 'cash' | 'qris';
  url_bukti_qris?: string;
  status: 'selesai' | 'pending_verifikasi' | 'dibatalkan';
  catatan?: string;
  jumlah_diterima?: number;
  kembalian?: number;
  items?: DetailTransaksi[];
}

export interface DetailTransaksi {
  id?: string;
  id_transaksi: string;
  id_menu: string;
  nama_menu: string;
  harga_satuan: number;
  qty: number;
  subtotal: number;
}

export interface MessageItem {
  id: string;
  id_pengirim: string;
  nama_pengirim: string;
  role_pengirim: UserRole;
  id_penerima: string | null; // null = broadcast
  isi_pesan: string;
  attachment_url?: string;
  attachment_type?: string; // 'image' | 'file'
  attachment_name?: string;
  waktu: string;
  sudah_dibaca: boolean;
  id_transaksi?: string;
}

export interface StoreSettings {
  qris_url?: string;
  updated_at?: string;
  nama_toko?: string;
  tagline?: string;
  alamat?: string;
  telepon?: string;
  ppn_persen?: number;
}
