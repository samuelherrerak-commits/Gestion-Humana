/* ════════════════════════════════════════════════════════════
   REPORT GENERATOR — Recolecta datos de auditoría y construye prompt
   ════════════════════════════════════════════════════════════ */

import { MODULES, getAllRequisitos } from '../data/index.js';
import { store } from './store.js';
import { auditEngine } from './audit-engine.js';
import { vencimientoEngine } from './vencimiento.js';
import { RIESGO_PONDERACION } from '../constants.js';

function _calcRiesgoStats() {
  const niveles = { CRÍTICO: { total: 0, cumple: 0, parcial: 0, noCumple: 0 },
    ALTO: { total: 0, cumple: 0, parcial: 0, noCumple: 0 },
    MEDIO: { total: 0, cumple: 0, parcial: 0, noCumple: 0 },
    BAJO: { total: 0, cumple: 0, parcial: 0, noCumple: 0 } };

  MODULES.forEach(mod => {
    mod.categoria.forEach(cat => {
      cat.items.forEach(item => {
        const st = store.getRequisitoState(item.codigo);
        const status = st?.status || 'sin-evaluar';
        const n = niveles[item.nivelRiesgo];
        if (!n) return;
        n.total++;
        if (status === 'cumple') n.cumple++;
        else if (status === 'parcial') n.parcial++;
        else if (status === 'no-cumple') n.noCumple++;
      });
    });
  });
  return niveles;
}

export function recolectarDatosAuditoria() {
  const islData = auditEngine.calcularISL();
  const porModulo = auditEngine.calcularPorModulo();
  const hallazgos = auditEngine.calcularHallazgos();
  const planes = auditEngine.calcularPlanesAccion();
  const lcsData = auditEngine.calcularLCS();
  const alarmas = vencimientoEngine.getAlarmas();
  const riesgoStats = _calcRiesgoStats();

  const requisitosDetalle = getAllRequisitos().map(r => {
    const st = store.getRequisitoState(r.codigo);
    return {
      codigo: r.codigo,
      modulo: r._moduloTitle,
      categoria: r._categoriaTitle,
      pregunta: r.pregunta,
      ley: `${r.fundamentoLegal.articulo} · ${r.fundamentoLegal.ley}`,
      riesgo: r.nivelRiesgo,
      responsable: r.responsable,
      periodicidad: r.periodicidad,
      status: st?.status || 'Sin evaluar',
      tieneEvidencia: !!st?.evidencia,
      observaciones: st?.observaciones || ''
    };
  });

  const infoEmpresa = store.state.infoEmpresa;

  return {
    infoEmpresa: {
      razonSocial: infoEmpresa.razonSocial || 'No registrada',
      numTrabajadores: infoEmpresa.numTrabajadores || 0,
      actividadEconomica: infoEmpresa.actividadEconomica || 'No registrada'
    },
    resumen: {
      isl: islData.isl,
      lcs: lcsData.lcs,
      lcsClase: lcsData.clase,
      lcsLabel: lcsData.label,
      totalRequisitos: islData.totalRequisitos,
      aplicables: islData.aplicables,
      noAplica: islData.noAplica,
      semaforo: islData.semaforo
    },
    cumplimiento: {
      hallazgos: {
        criticos: hallazgos.criticos.count,
        altos: hallazgos.altos.count,
        medios: hallazgos.medios.count,
        bajos: hallazgos.bajos.count,
        total: hallazgos.total,
        riesgoGeneral: hallazgos.riesgoGeneral
      },
      planesAccion: planes,
      alarmas: {
        total: alarmas.length,
        vencidos: alarmas.filter(a => a.isExpired).length,
        proximos: alarmas.filter(a => !a.isExpired && a.daysUntil <= 15).length
      }
    },
    porModulo: porModulo.map(m => ({
      codigo: m.codigo,
      titulo: m.title,
      icono: m.icon,
      porcentaje: m.pct,
      cumplidos: m.cumple,
      parciales: m.parcial,
      incumplidos: m.noCumple,
      noAplica: m.noAplica
    })),
    riesgoStats: Object.entries(riesgoStats).map(([nivel, st]) => ({ nivel, ...st })),
    requisitos: requisitosDetalle,
    noCumplidos: requisitosDetalle.filter(r => r.status === 'no-cumple'),
    parciales: requisitosDetalle.filter(r => r.status === 'parcial'),
    cumplidos: requisitosDetalle.filter(r => r.status === 'cumple')
  };
}

export function construirPromptUsuario(datos) {
  const totalEvaluados = datos.resumen.aplicables;
  const totalCumplidos = datos.cumplidos.length;
  const totalParciales = datos.parciales.length;
  const totalNoCumplen = datos.noCumplidos.length;

  const iconStatus = s => s === 'cumple' ? '✅' : s === 'parcial' ? '⚠️' : s === 'no-cumple' ? '❌' : '⬜';

  const modulosBloque = MODULES.map(mod => {
    const modData = datos.porModulo.find(m => m.codigo === mod.codigo);
    const pct = modData ? modData.porcentaje : 0;

    const itemsMod = datos.requisitos.filter(r => r.modulo === mod.title);
    const itemsTexto = itemsMod.map(item => {
      const icono = iconStatus(item.status);
      const observacion = item.observaciones ? ` — ${item.observaciones}` : '';
      return `  ${icono} [${item.codigo}] ${item.pregunta} | Riesgo: ${item.riesgo} | ${item.ley}${observacion}`;
    }).join('\n');

    return `${mod.icono} MÓDULO ${mod.codigo?.replace('M','') || ''}: ${mod.title} (${pct}%)
${itemsTexto || '  (sin requisitos)'}`;
  }).join('\n\n');

  return `DATOS DE LA EMPRESA:
- Razón Social: ${datos.infoEmpresa.razonSocial}
- Actividad: ${datos.infoEmpresa.actividadEconomica}
- Trabajadores: ${datos.infoEmpresa.numTrabajadores}

RESUMEN GLOBAL:
- ISL (Índice de Salud Laboral): ${datos.resumen.isl}%
- LCS (Legal Compliance Score): ${datos.resumen.lcs}/1000 (Clase ${datos.resumen.lcsClase}: ${datos.resumen.lcsLabel})
- Requisitos evaluados: ${totalEvaluados}
- Cumplidos: ${totalCumplidos}
- Parciales: ${totalParciales}
- No Cumplen: ${totalNoCumplen}
- No Aplica: ${datos.resumen.noAplica}

CUMPLIMIENTO POR NIVEL DE RIESGO:
${datos.riesgoStats.map(r => `- ${r.nivel}: ${r.cumple} cumplidos, ${r.parcial} parciales, ${r.noCumple} incumplidos (de ${r.total} totales)`).join('\n')}

HALLAZGOS:
- Críticos: ${datos.cumplimiento.hallazgos.criticos}
- Altos: ${datos.cumplimiento.hallazgos.altos}
- Medios: ${datos.cumplimiento.hallazgos.medios}
- Bajos: ${datos.cumplimiento.hallazgos.bajos}
- Riesgo General: ${datos.cumplimiento.hallazgos.riesgoGeneral}

PLANES DE ACCIÓN:
- Abiertos: ${datos.cumplimiento.planesAccion.abiertos}
- Cerrados: ${datos.cumplimiento.planesAccion.cerrados}
- Vencidos: ${datos.cumplimiento.planesAccion.vencidos}

ALERTAS DE VENCIMIENTO:
- Total alarmas: ${datos.cumplimiento.alarmas.total}
- Vencidos: ${datos.cumplimiento.alarmas.vencidos}
- Próximos 15 días: ${datos.cumplimiento.alarmas.proximos}

DETALLE POR MÓDULO (TODOS LOS REQUISITOS):

${modulosBloque}

INSTRUCCIONES FINALES:
Analiza la auditoría módulo por módulo. Por cada módulo: señala fortalezas y debilidades específicas, menciona los items críticos incumplidos, sus consecuencias legales y recomendaciones concretas.
Genera el informe completo siguiendo la estructura indicada en las instrucciones del sistema. NO incluyas ningún texto adicional, instrucciones o metadatos fuera del informe.`;
}
