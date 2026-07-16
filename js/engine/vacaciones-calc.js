import { DIAS_VACACIONES_BASE, DIAS_POR_ANIO_EXTRA } from '../constants.js';

export function calcularDiasDisponibles(fechaIngreso, diasUsados) {
  if (!fechaIngreso) return 0;
  const hoy = new Date();
  const ing = new Date(fechaIngreso);
  if (isNaN(ing.getTime())) return 0;

  let aniosServicio = hoy.getFullYear() - ing.getFullYear();
  const m = hoy.getMonth() - ing.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < ing.getDate())) aniosServicio--;
  if (aniosServicio < 0) aniosServicio = 0;

  let totalDias = DIAS_VACACIONES_BASE;
  if (aniosServicio > 1) {
    totalDias += (aniosServicio - 1) * DIAS_POR_ANIO_EXTRA;
  }
  if (totalDias > 30) totalDias = 30;

  return Math.max(0, totalDias - (diasUsados || 0));
}

export function calcularDiasHabiles(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return 0;

  let dias = 0;
  const current = new Date(inicio);
  while (current <= fin) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) dias++;
    current.setDate(current.getDate() + 1);
  }
  return dias;
}

export function calcularAniosServicio(fechaIngreso) {
  if (!fechaIngreso) return 0;
  const hoy = new Date();
  const ing = new Date(fechaIngreso);
  let anios = hoy.getFullYear() - ing.getFullYear();
  const m = hoy.getMonth() - ing.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < ing.getDate())) anios--;
  return Math.max(0, anios);
}
