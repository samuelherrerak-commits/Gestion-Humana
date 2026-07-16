/* ════════════════════════════════════════════════════════════
   HISTORIAL — Lista de auditorías finalizadas con scores
   ════════════════════════════════════════════════════════════ */

import { api } from '../utils/api-client.js';
import { abrirModalInforme } from './report-modal.js';

export async function renderHistorial() {
  const container = document.getElementById('historial-content');
  if (!container) return;

  container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--color-text-muted);">Cargando historial...</p>';

  try {
    const auditorias = await api.getAuditorias();
    const finalizadas = auditorias.filter(a => a.estado === 'finalizada');

    if (finalizadas.length === 0) {
      container.innerHTML = `
        <div class="placeholder-view">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <h3>Sin auditorías finalizadas</h3>
          <p>Complete y finalice una auditoría para ver el historial aquí</p>
        </div>
      `;
      return;
    }

    const filas = finalizadas.map((a, i) => {
      const fechaApertura = a.fecha_apertura ? new Date(a.fecha_apertura).toLocaleDateString('es-VE') : '—';
      const fechaCierre = a.fecha_cierre ? new Date(a.fecha_cierre).toLocaleDateString('es-VE') : '—';
      const lcs = a.puntaje_lcs != null ? a.puntaje_lcs : '—';
      const isl = a.puntaje_isl != null ? `${a.puntaje_isl}%` : '—';
      const clase = a.clase_lcs || '—';
      const nombre = a.nombre || `Auditoría #${a.id}`;

      let claseColor = 'var(--color-text-muted)';
      if (a.clase_lcs === 'A') claseColor = '#059669';
      else if (a.clase_lcs === 'B') claseColor = '#16a34a';
      else if (a.clase_lcs === 'C') claseColor = '#D97706';
      else if (a.clase_lcs === 'D') claseColor = '#DC2626';
      else if (a.clase_lcs === 'E') claseColor = '#991b1b';

      return `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${nombre}</strong></td>
          <td>${fechaApertura}</td>
          <td>${fechaCierre}</td>
          <td style="font-weight:600;">${lcs}</td>
          <td>${isl}</td>
          <td style="font-weight:700;color:${claseColor};">${clase}</td>
          <td>
            <button class="btn btn--ghost btn--sm" data-auditoria-id="${a.id}" onclick="abrirInformeHistorial(${a.id})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Ver Informe
            </button>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="historial">
        <div class="historial__header">
          <h2 style="margin:0;font-size:var(--font-size-lg);">Auditorías Finalizadas</h2>
          <p style="margin:4px 0 0;color:var(--color-text-secondary);font-size:var(--font-size-sm);">
            ${finalizadas.length} auditoría(s) completada(s)
          </p>
        </div>
        <div class="table-responsive" style="margin-top:var(--space-4);overflow-x:auto;">
          <table class="table" style="width:100%;border-collapse:collapse;font-size:var(--font-size-sm);">
            <thead>
              <tr style="border-bottom:2px solid var(--color-gray-200);text-align:left;">
                <th style="padding:var(--space-2) var(--space-2);color:var(--color-text-muted);font-weight:600;">#</th>
                <th style="padding:var(--space-2) var(--space-2);color:var(--color-text-muted);font-weight:600;">Nombre</th>
                <th style="padding:var(--space-2) var(--space-2);color:var(--color-text-muted);font-weight:600;">Fecha Apertura</th>
                <th style="padding:var(--space-2) var(--space-2);color:var(--color-text-muted);font-weight:600;">Fecha Cierre</th>
                <th style="padding:var(--space-2) var(--space-2);color:var(--color-text-muted);font-weight:600;">LCS</th>
                <th style="padding:var(--space-2) var(--space-2);color:var(--color-text-muted);font-weight:600;">ISL</th>
                <th style="padding:var(--space-2) var(--space-2);color:var(--color-text-muted);font-weight:600;">Clase</th>
                <th style="padding:var(--space-2) var(--space-2);color:var(--color-text-muted);font-weight:600;">Acción</th>
              </tr>
            </thead>
            <tbody>
              ${filas}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (e) {
    console.warn('[Historial] error:', e);
    container.innerHTML = `
      <div class="placeholder-view">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <h3>Error al cargar historial</h3>
        <p>${e.message || 'Intente nuevamente más tarde'}</p>
      </div>
    `;
  }
}

// Expuesto globalmente para onclick en botones del historial
window.abrirInformeHistorial = async function(auditoriaId) {
  try {
    const informes = await api.getInformes(auditoriaId);
    if (informes && informes.length > 0) {
      // Usar el informe más reciente
      const ultimo = informes[0];
      // Import dinámico para evitar circular dependency
      const { mostrarInformeGuardado } = await import('./report-modal.js');
      mostrarInformeGuardado(ultimo.contenido);
    } else {
      // Si no hay informe guardado, generar uno nuevo
      abrirModalInforme();
    }
  } catch (e) {
    console.warn('[Historial] error loading informe:', e);
    abrirModalInforme();
  }
};
