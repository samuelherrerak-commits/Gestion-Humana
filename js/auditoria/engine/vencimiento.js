/* ════════════════════════════════════════════════════════════
   VENCIMIENTO — Motor de Alertas y Vencimientos
   ════════════════════════════════════════════════════════════
   Calcula alertas de vencimiento próximos (default 15 días)
   y genera listas de alarmas para el dashboard.
   ════════════════════════════════════════════════════════════ */

import { getAllRequisitos } from '../data/index.js';
import { store } from './store.js';
import { ALERTA_DIAS } from '../constants.js';
import { daysUntil, isExpired, isDueSoon } from '../utils/format.js';

class VencimientoEngine {

  /**
   * Obtiene todas las alarmas de vencimiento activas.
   * @param {number} diasAlerta - Días de anticipación para alertar (default 15)
   * @returns {Array} Lista de alarmas ordenadas por urgencia
   */
  getAlarmas(diasAlerta = ALERTA_DIAS) {
    const reqs = getAllRequisitos();
    const alarmas = [];

    reqs.forEach(r => {
      const st = store.getRequisitoState(r.codigo);
      const fechaVencimiento = st?.fechaVencimiento || r.fechaVencimiento;
      if (!fechaVencimiento) return;

      const days = daysUntil(fechaVencimiento);
      if (days === null) return;

      // Si está vencido o dentro del umbral de alerta
      if (days < 0 || days <= (r.diasAlerta || diasAlerta)) {
        alarmas.push({
          codigo: r.codigo,
          pregunta: r.pregunta,
          modulo: r._moduloTitle,
          categoria: r._categoriaTitle,
          fechaVencimiento,
          daysUntil: days,
          isExpired: days < 0,
          urgencia: days < 0 ? 'danger'
            : days <= 5 ? 'danger'
            : days <= (r.diasAlerta || diasAlerta) ? 'warning' : 'info',
          nivelRiesgo: r.nivelRiesgo,
          responsable: r.responsable,
          periodicidad: r.periodicidad
        });
      }
    });

    // Ordenar: primero vencidos, luego por menor días
    alarmas.sort((a, b) => {
      if (a.isExpired && !b.isExpired) return -1;
      if (!a.isExpired && b.isExpired) return 1;
      return a.daysUntil - b.daysUntil;
    });

    return alarmas;
  }

  /**
   * Cuenta cuántos vencimientos hay en los próximos N días
   */
  countProximos(dias = 30) {
    return this.getAlarmas(dias).length;
  }

  /**
   * Obtiene los próximos vencimientos agrupados por módulo
   */
  getProximosPorModulo(dias = 30) {
    const alarmas = this.getAlarmas();
    const grouped = {};

    alarmas.forEach(a => {
      if (a.daysUntil > dias) return;
      if (!grouped[a.modulo]) grouped[a.modulo] = [];
      grouped[a.modulo].push(a);
    });

    return grouped;
  }

  /**
   * Verifica si un requisito específico está próximo a vencer
   */
  isProximoAVencer(codigo, diasAlerta = ALERTA_DIAS) {
    const r = getAllRequisitos().find(req => req.codigo === codigo);
    if (!r) return { isDue: false, days: null };

    const st = store.getRequisitoState(codigo);
    const fechaVencimiento = st?.fechaVencimiento || r.fechaVencimiento;
    if (!fechaVencimiento) return { isDue: false, days: null };

    const days = daysUntil(fechaVencimiento);
    if (days === null) return { isDue: false, days: null };

    return {
      isDue: (days < 0 || days <= diasAlerta),
      days,
      isExpired: days < 0,
      fecha: fechaVencimiento
    };
  }

  /**
   * Genera las alertas para el panel de alarmas del dashboard
   */
  generarAlertasPanel() {
    const alarmas = this.getAlarmas();

    return {
      criticas: alarmas.filter(a => a.urgencia === 'danger').slice(0, 10),
      warnings: alarmas.filter(a => a.urgencia === 'warning').slice(0, 10),
      total: alarmas.length,
      vencidos: alarmas.filter(a => a.isExpired).length,
      proximos15: alarmas.filter(a => !a.isExpired && a.daysUntil <= 15).length
    };
  }

  /**
   * Obtiene las fechas de vencimiento configuradas para recordatorios
   * de cumplimiento recurrente (IVSS, FAOV, INCES, declaraciones, etc.)
   */
  getVencimientosRecurrentes() {
    const reqs = getAllRequisitos();
    const recurrentes = [];

    reqs.forEach(r => {
      if (r.periodicidad === 'Única' || r.periodicidad === 'Permanente') return;
      const st = store.getRequisitoState(r.codigo);
      const fecha = st?.fechaVencimiento || r.fechaVencimiento;
      if (!fecha) return;

      recurrentes.push({
        codigo: r.codigo,
        titulo: r.pregunta,
        modulo: r._moduloTitle,
        periodicidad: r.periodicidad,
        fechaVencimiento: fecha,
        responsable: r.responsable,
        riesgo: r.nivelRiesgo
      });
    });

    return recurrentes;
  }
}

export const vencimientoEngine = new VencimientoEngine();
