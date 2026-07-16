/* ════════════════════════════════════════════════════════════
   FORMAT UTILITIES
   ════════════════════════════════════════════════════════════ */

export function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-VE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function formatDateShort(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit'
  });
}

export function formatPct(value) {
  if (value == null || isNaN(value)) return '—';
  return `${Math.round(value)}%`;
}

export function formatCurrency(value) {
  if (value == null || isNaN(value)) return '—';
  return value.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' Bs.';
}

export function daysUntil(date) {
  if (!date) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  if (isNaN(target.getTime())) return null;
  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isExpired(date) {
  const days = daysUntil(date);
  return days !== null && days < 0;
}

export function isDueSoon(date, daysThreshold = 15) {
  const days = daysUntil(date);
  return days !== null && days >= 0 && days <= daysThreshold;
}

export function getStatusIcon(status) {
  const icons = {
    'cumple': '✅',
    'parcial': '◐',
    'no-cumple': '❌',
    'no-aplica': '—'
  };
  return icons[status] || '◻';
}

export function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
