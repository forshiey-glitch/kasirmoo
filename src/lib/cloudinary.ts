/**
 * Layanan Upload Gambar ke Cloudinary
 * Endpoint: https://api.cloudinary.com/v1_1/{cloud_name}/image/upload
 * Unsigned upload preset: kasir_qris
 */

export const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'v2evmutn';

export const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'kasir_qris';

export const CLOUDINARY_ENDPOINT = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Mengunggah file gambar (File atau Blob) ke Cloudinary dan mengembalikan secure_url.
 * Mendukung callback onProgress opsional untuk menampilkan progress bar (0 - 100).
 */
export async function uploadToCloudinary(
  file: File | Blob,
  onProgress?: (percent: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  // Jika callback onProgress disertakan, gunakan XMLHttpRequest untuk event upload.onprogress
  if (onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', CLOUDINARY_ENDPOINT);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.secure_url) {
              onProgress(100);
              resolve(data.secure_url);
            } else {
              reject(new Error(data.error?.message || 'Tidak ada secure_url dari Cloudinary'));
            }
          } catch (e) {
            reject(new Error('Gagal memproses respons JSON dari Cloudinary'));
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData.error?.message || `Gagal upload Cloudinary: HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`Gagal upload Cloudinary: HTTP ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Koneksi jaringan gagal saat mengunggah ke Cloudinary'));
      };

      xhr.send(formData);
    });
  }

  // Jika tanpa onProgress, gunakan fetch standar
  const response = await fetch(CLOUDINARY_ENDPOINT, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error?.message || `Gagal upload ke Cloudinary (Status: ${response.status})`
    );
  }

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error('Cloudinary tidak mengembalikan secure_url');
  }

  return data.secure_url;
}
