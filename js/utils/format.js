export function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function formatDateLong(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatCurrency(value) {
  if (value == null || isNaN(value)) return '—';
  return Number(value).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' Bs.';
}

export function formatPct(value) {
  if (value == null || isNaN(value)) return '—';
  return Math.round(value) + '%';
}

export function daysUntil(date) {
  if (!date) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  if (isNaN(target.getTime())) return null;
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function diasEntre(fechaInicio, fechaFin) {
  const a = new Date(fechaInicio);
  const b = new Date(fechaFin);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  return Math.ceil((b - a) / (1000 * 60 * 60 * 24)) + 1;
}

export function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  if (isNaN(nac.getTime())) return null;
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

export function calcularAntiguedad(fechaIngreso) {
  if (!fechaIngreso) return '—';
  const hoy = new Date();
  const ing = new Date(fechaIngreso);
  if (isNaN(ing.getTime())) return '—';
  let anios = hoy.getFullYear() - ing.getFullYear();
  const m = hoy.getMonth() - ing.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < ing.getDate())) anios--;
  if (anios < 0) anios = 0;
  return anios === 1 ? '1 año' : `${anios} años`;
}

export function formatCedula(cedula) {
  if (!cedula) return '—';
  return cedula;
}

export function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function getInitials(nombre, apellido) {
  return ((nombre?.[0] || '') + (apellido?.[0] || '')).toUpperCase();
}
