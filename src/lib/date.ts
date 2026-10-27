/**
 * Helper format tanggal dan waktu Indonesia
 */
export function formatTanggalWaktu(isoStringOrTimestamp: string | number | Date | null | undefined): string {
  if (!isoStringOrTimestamp) return '-';
  const d = new Date(isoStringOrTimestamp);
  if (isNaN(d.getTime())) return String(isoStringOrTimestamp);

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

export function formatWaktuSingkat(isoStringOrTimestamp: string | number | Date | null | undefined): string {
  if (!isoStringOrTimestamp) return '';
  const d = new Date(isoStringOrTimestamp);
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

export function formatWaktuRelatif(isoStringOrTimestamp: string | number | Date | null | undefined): string {
  if (!isoStringOrTimestamp) return '';
  const d = new Date(isoStringOrTimestamp);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return `Kemarin, ${formatWaktuSingkat(d)}`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return formatTanggalWaktu(d);
}
