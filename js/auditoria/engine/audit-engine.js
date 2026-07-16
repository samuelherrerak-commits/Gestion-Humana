/* ════════════════════════════════════════════════════════════
   AUDIT ENGINE — Motor de Cálculo de Cumplimiento
   ════════════════════════════════════════════════════════════
   Calcula ISL, LCS, hallazgos por riesgo, planes de acción.
   ════════════════════════════════════════════════════════════ */

import { MODULES, getAllRequisitos } from '../data/index.js';
import { store } from './store.js';
import {
  RIESGO, RIESGO_PONDERACION,
  STATUS, STATUS_FACTOR,
  ISL_SEMAFORO, LCS_CLASES,
  ALERTA_DIAS
} from '../constants.js';
import { daysUntil } from '../utils/format.js';

class AuditEngine {
  constructor() {
    this._cache = null;
  }

  _getRequisitosConEstado() {
    const all = getAllRequisitos();
    return all.map(r => {
      const st = store.getRequisitoState(r.codigo);
      return {
        ...r,
        status: st?.status || null,
        evidencia: st?.evidencia || null,
        evidenciaStatus: st?.evidenciaStatus || null,
        hallazgo: st?.hallazgo || r.hallazgo,
        fechaVencimiento: st?.fechaVencimiento || r.fechaVencimiento,
        ponderacion: RIESGO_PONDERACION[r.nivelRiesgo] || 3
      };
    });
  }

  /* ── Índice de Salud Laboral (ISL) ── */

  calcularISL() {
    const reqs = this._getRequisitosConEstado();
    let puntosObtenidos = 0;
    let puntosMaximos = 0;
    let totalReqs = 0;
    let aplicables = 0;

    reqs.forEach(r => {
      totalReqs++;
      if (r.status === STATUS.NO_APLICA) return;
      aplicables++;

      const peso = r.ponderacion || 3;
      puntosMaximos += peso;

      const factor = STATUS_FACTOR[r.status] ?? 0;
      puntosObtenidos += peso * factor;
    });

    const isl = puntosMaximos > 0 ? (puntosObtenidos / puntosMaximos) * 100 : 0;
    const semaforo = ISL_SEMAFORO.find(s => isl >= s.min && isl <= s.max) || ISL_SEMAFORO[2];

    return {
      isl: Math.round(isl * 10) / 10,
      puntosObtenidos: Math.round(puntosObtenidos * 100) / 100,
      puntosMaximos: Math.round(puntosMaximos * 100) / 100,
      totalRequisitos: totalReqs,
      aplicables,
      noAplica: totalReqs - aplicables,
      semaforo
    };
  }

  /* ── Cumplimiento por Módulo ── */

  calcularPorModulo() {
    const result = [];
    MODULES.forEach(mod => {
      let puntos = 0;
      let max = 0;
      let cumple = 0, parcial = 0, noCumple = 0, noAplica = 0;

      mod.categoria.forEach(cat => {
        cat.items.forEach(item => {
          const st = store.getRequisitoState(item.codigo);
          const status = st?.status || null;
          const peso = RIESGO_PONDERACION[item.nivelRiesgo] || 3;

          if (status === STATUS.NO_APLICA) { noAplica++; return; }
          if (status === STATUS.NO_CUMPLE) { noCumple++; return; }

          max += peso;
          if (status === STATUS.CUMPLE) { puntos += peso; cumple++; }
          else if (status === STATUS.PARCIAL) { puntos += peso * 0.5; parcial++; }
        });
      });

      result.push({
        id: mod.id,
        codigo: mod.codigo,
        title: mod.title,
        icon: mod.icon,
        pct: max > 0 ? Math.round((puntos / max) * 100) : 0,
        cumple,
        parcial,
        noCumple,
        noAplica,
        puntos: Math.round(puntos * 100) / 100,
        max: Math.round(max * 100) / 100
      });
    });
    return result;
  }

  /* ── Hallazgos por Nivel de Riesgo ── */

  calcularHallazgos() {
    const reqs = this._getRequisitosConEstado();
    const hallazgos = {
      criticos: { count: 0, items: [] },
      altos: { count: 0, items: [] },
      medios: { count: 0, items: [] },
      bajos: { count: 0, items: [] },
      total: 0
    };

    let evaluados = 0;
    let cumplidos = 0;

    reqs.forEach(r => {
      if (r.status === STATUS.NO_APLICA) return;
      evaluados++;
      if (r.status === STATUS.CUMPLE) cumplidos++;
      else if (r.status === STATUS.PARCIAL) cumplidos += 0.5;

      if (r.status !== STATUS.NO_CUMPLE && r.status !== STATUS.PARCIAL) return;
      const nivel = r.hallazgo?.nivelRiesgoHallazgo || r.nivelRiesgo?.toLowerCase() || 'bajo';
      hallazgos.total++;

      const entry = {
        codigo: r.codigo,
        modulo: r._moduloTitle,
        pregunta: r.pregunta,
        descripcion: r.hallazgo?.descripcion || r.pregunta,
        riesgo: r.nivelRiesgo,
        recomendacion: r.hallazgo?.recomendacion || '',
        responsable: r.hallazgo?.responsableAccion || '',
        fechaCompromiso: r.hallazgo?.fechaCompromiso || null
      };

      if (nivel === 'crítico') { hallazgos.criticos.count++; hallazgos.criticos.items.push(entry); }
      else if (nivel === 'alto') { hallazgos.altos.count++; hallazgos.altos.items.push(entry); }
      else if (nivel === 'medio') { hallazgos.medios.count++; hallazgos.medios.items.push(entry); }
      else { hallazgos.bajos.count++; hallazgos.bajos.items.push(entry); }
    });

    // Riesgo general en función al cumplimiento
    let riesgoGeneral = 'BAJO';
    if (evaluados === 0) {
      riesgoGeneral = 'CRÍTICO';
    } else {
      const ratio = cumplidos / evaluados;
      if (ratio < 0.3) riesgoGeneral = 'CRÍTICO';
      else if (ratio < 0.7) riesgoGeneral = 'ALTO';
      else if (ratio < 0.9) riesgoGeneral = 'MEDIO';
    }

    return { ...hallazgos, riesgoGeneral };
  }

  /* ── Planes de Acción ── */

  calcularPlanesAccion() {
    const reqs = this._getRequisitosConEstado();
    let abiertos = 0, cerrados = 0, vencidos = 0;

    reqs.forEach(r => {
      if (!r.hallazgo || r.hallazgo.estadoPlan === 'cerrado') {
        if (r.hallazgo?.estadoPlan === 'cerrado') cerrados++;
        return;
      }

      abiertos++;
      if (r.hallazgo.fechaCompromiso) {
        const days = daysUntil(r.hallazgo.fechaCompromiso);
        if (days !== null && days < 0) vencidos++;
      }
    });

    return { abiertos, cerrados, vencidos, total: abiertos + cerrados };
  }

  /* ── Legal Compliance Score (LCS) ── */

  calcularLCS() {
    const islData = this.calcularISL();
    const hallazgos = this.calcularHallazgos();
    const planes = this.calcularPlanesAccion();
    const reqs = this._getRequisitosConEstado();

    // D1: Cumplimiento Legal (40%)
    const D1 = islData.isl * 0.40;

    // D2: Calidad de Evidencias (25%)
    let eviValidas = 0, eviTotal = 0;
    reqs.forEach(r => {
      if (r.status === STATUS.CUMPLE || r.status === STATUS.PARCIAL) {
        eviTotal++;
        if (r.evidencia && r.evidenciaStatus !== 'rechazado') eviValidas++;
      }
    });
    const pctEvidencias = eviTotal > 0 ? (eviValidas / eviTotal) * 100 : 100;
    const D2 = pctEvidencias * 0.25;

    // D3: Riesgo (20%) — inversamente proporcional
    const scoreRiesgo = Math.max(0, 100 - (
      hallazgos.criticos.count * 25 +
      hallazgos.altos.count * 15 +
      hallazgos.medios.count * 8 +
      hallazgos.bajos.count * 3
    ));
    const D3 = scoreRiesgo * 0.20;

    // D4: Tiempo de respuesta (15%)
    const pctCerrados = planes.total > 0 ? (planes.cerrados / planes.total) * 100 : 100;
    const factorVencidos = planes.vencidos > 0 ? Math.max(0, 1 - (planes.vencidos / planes.total)) : 1;
    const D4 = (pctCerrados * factorVencidos) * 0.15;

    const lcs = Math.round(D1 + D2 + D3 + D4);
    const clamped = Math.max(0, Math.min(1000, lcs));

    const clase = LCS_CLASES.find(c => clamped >= c.min && clamped <= c.max) || LCS_CLASES[4];

    return {
      lcs: clamped,
      clase: clase.clase,
      label: clase.label,
      color: clase.color,
      componentes: {
        cumplimiento: Math.round(D1),
        evidencias: Math.round(D2),
        riesgo: Math.round(D3),
        respuesta: Math.round(D4)
      }
    };
  }

  /* ── Score de Riesgo General (textual) ── */
  getRiesgoGeneral() {
    const h = this.calcularHallazgos();
    return h.riesgoGeneral;
  }

  /* ── Invalidate cache ── */
  invalidate() {
    this._cache = null;
  }
}

export const auditEngine = new AuditEngine();
