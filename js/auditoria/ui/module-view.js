/* ════════════════════════════════════════════════════════════
   MODULE VIEW — Renderizado de Módulos, Categorías y Requisitos
   ════════════════════════════════════════════════════════════ */

import { getModuleById, getModuleByCodigo } from '../data/index.js';
import { store } from '../engine/store.js';
import { validator } from '../engine/validator.js';
import { vencimientoEngine } from '../engine/vencimiento.js';
import { STATUS, STATUS_LABELS, RIESGO_COLOR, RIESGO_BG, RIESGO } from '../constants.js';
import { formatDate, daysUntil } from '../utils/format.js';

let _currentModId = null;
let _currentCatId = null;

export function renderModule(modId) {
  const mod = typeof modId === 'number' ? getModuleById(modId) : getModuleByCodigo(modId);
  if (!mod) return;

  _currentModId = mod.id;

  // Header
  document.getElementById('module-title').textContent = `${mod.icon} ${mod.title}`;
  document.getElementById('module-desc').textContent = mod.description;

  // Stats
  const stats = _calcModuleStats(mod);
  document.getElementById('module-stat-cumple').textContent = `✅ ${stats.cumple}`;
  document.getElementById('module-stat-parcial').textContent = `◐ ${stats.parcial}`;
  document.getElementById('module-stat-nocumple').textContent = `❌ ${stats.noCumple}`;
  document.getElementById('module-stat-na').textContent = `— ${stats.noAplica}`;
  document.getElementById('module-stat-pct').textContent = `${stats.pct}%`;

  // Content
  const container = document.getElementById('module-content');
  container.innerHTML = '';

  mod.categoria.forEach(cat => {
    const catEl = document.createElement('div');
    catEl.className = `category ${_currentCatId && _currentCatId !== cat.id ? 'category--collapsed' : ''}`;
    catEl.dataset.categoriaId = cat.id;

    catEl.innerHTML = `
      <div class="category__header" data-toggle-cat="${cat.id}">
        <span class="category__title">
          <span>${cat.title}</span>
          <span class="badge badge--info">${cat.items.length}</span>
        </span>
        <span class="category__toggle">▼</span>
      </div>
      <div class="category__body">
        ${cat.items.map(item => _renderRequisito(item, mod)).join('')}
      </div>
    `;

    container.appendChild(catEl);

    // Toggle category
    catEl.querySelector('[data-toggle-cat]').addEventListener('click', () => {
      catEl.classList.toggle('category--collapsed');
    });
  });
}

function _calcModuleStats(mod) {
  let cumple = 0, parcial = 0, noCumple = 0, noAplica = 0, totalPuntos = 0, maxPuntos = 0;

  mod.categoria.forEach(cat => {
    cat.items.forEach(item => {
      const st = store.getRequisitoState(item.codigo);
      const status = st?.status || null;
      const peso = _getPeso(item.nivelRiesgo);

      if (status === STATUS.NO_APLICA) { noAplica++; return; }

      if (status === STATUS.CUMPLE) { cumple++; totalPuntos += peso; }
      else if (status === STATUS.PARCIAL) { parcial++; totalPuntos += peso * 0.5; }
      else if (status === STATUS.NO_CUMPLE) { noCumple++; }

      maxPuntos += peso;
    });
  });

  return {
    cumple, parcial, noCumple, noAplica,
    pct: maxPuntos > 0 ? Math.round((totalPuntos / maxPuntos) * 100) : 0
  };
}

function _getPeso(riesgo) {
  const pesos = { 'CRÍTICO': 4, 'ALTO': 3, 'MEDIO': 2, 'BAJO': 1 };
  return pesos[riesgo] || 3;
}

function _renderRequisito(item, mod) {
  const st = store.getRequisitoState(item.codigo);
  const status = st?.status || null;
  const hasEvidence = !!st?.evidencia;
  const eviName = st?.evidencia?.name || '';
  const venc = st?.fechaVencimiento || item.fechaVencimiento;
  const venInfo = vencimientoEngine.isProximoAVencer(item.codigo);

  let venClass = '';
  let venLabel = '';
  if (venInfo.isDue && venc) {
    if (venInfo.isExpired) { venClass = 'danger'; venLabel = `Vencido (${formatDate(venc)})`; }
    else { venClass = 'warning'; venLabel = `${venInfo.days} días (${formatDate(venc)})`; }
  } else if (venc) {
    venClass = 'ok'; venLabel = formatDate(venc);
  }

  const riesgoColor = RIESGO_COLOR[item.nivelRiesgo] || 'var(--color-text-muted)';
  const riesgoBg = RIESGO_BG[item.nivelRiesgo] || 'var(--color-gray-100)';
  const riesgoLabel = item.nivelRiesgo;

  const statusOptions = Object.entries(STATUS_LABELS).map(([val, label]) =>
    `<option value="${val}" ${status === val ? 'selected' : ''}>${label}</option>`
  ).join('');

  const hasHallazgo = status === STATUS.NO_CUMPLE || status === STATUS.PARCIAL;
  const hal = st?.hallazgo || item.hallazgo;

  return `
    <div class="requisito" data-codigo="${item.codigo}">
      <div class="requisito__header">
        <span class="requisito__codigo">${item.codigo}</span>
        <div class="requisito__content">
          <div class="requisito__pregunta">${item.pregunta}</div>
          <div class="requisito__legal">
            <strong>Base Legal:</strong> ${item.fundamentoLegal.articulo} · ${item.fundamentoLegal.ley}
          </div>
          <div class="requisito__meta">
            <span class="badge" style="background:${riesgoBg};color:${riesgoColor}">${riesgoLabel}</span>
            <span class="badge badge--info">${item.responsable || 'No asignado'}</span>
            <span class="badge badge--info">${item.periodicidad}</span>
            ${venc ? `<span class="requisito__vencimiento requisito__vencimiento--${venClass}">📅 ${venLabel}</span>` : ''}
          </div>
          ${!venc ? `
            <div style="margin-top:6px;display:flex;align-items:center;gap:8px;">
              <input type="date" class="requisito__vencimiento-input" data-vencimiento="${item.codigo}"
                placeholder="Fecha vencimiento" value="${venc || ''}">
              <span style="font-size:var(--font-size-xs);color:var(--color-text-muted)">Vencimiento</span>
            </div>
          ` : ''}
        </div>
        <div class="requisito__actions">
          <select class="requisito__select" data-status="${item.codigo}">
            <option value="" ${!status ? 'selected' : ''}>Seleccionar...</option>
            ${statusOptions}
          </select>
          <button class="requisito__file-btn ${hasEvidence ? 'has-file' : ''}"
                  data-evidencia="${item.codigo}"
                  title="${hasEvidence ? 'Cambiar evidencia' : 'Adjuntar evidencia'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
        </div>
      </div>
      ${hasEvidence ? `
        <div style="margin-top:4px;margin-left:calc(24px + var(--space-3));font-size:var(--font-size-xs);color:var(--color-success);display:flex;align-items:center;gap:8px;">
          <span>📎 ${eviName}</span>
          <span class="badge badge--success">Validado</span>
        </div>
      ` : ''}
      <div class="error-msg error-msg--hidden" data-error="${item.codigo}"></div>

      ${status === STATUS.NO_APLICA ? '' : `
      <div style="margin-top:6px;margin-left:calc(24px + var(--space-3));">
        <textarea class="form-textarea" data-observaciones="${item.codigo}" rows="1"
          placeholder="Observaciones del auditor..." style="min-height:32px;font-size:var(--font-size-xs);">${st?.observaciones || ''}</textarea>
      </div>
      `}
    </div>
  `;
}

export function attachModuleEvents() {
  const container = document.getElementById('module-content');

  // Status change
  container.querySelectorAll('[data-status]').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const codigo = e.target.dataset.status;
      const nuevoStatus = e.target.value;
      const errorEl = container.querySelector(`[data-error="${codigo}"]`);

      // Validar regla: Cumple y Cumple Parcial necesitan evidencia
      if (nuevoStatus === STATUS.CUMPLE || nuevoStatus === STATUS.PARCIAL) {
        const result = validator.validarRequerimientoEvidencia(codigo);
        if (!result.valid) {
          errorEl.textContent = `⚠️ ${result.error}`;
          errorEl.classList.remove('error-msg--hidden');
          e.target.value = store.getRequisitoState(codigo)?.status || '';
          return;
        }
      }

      errorEl.classList.add('error-msg--hidden');
      store.setRequisitoStatus(codigo, nuevoStatus || null);

      // Re-render module stats
      const mod = getModuleById(_currentModId);
      if (mod) {
        const stats = document.getElementById('module-stats'); // We'll update the header manually
        const st = _calcModuleStats(mod);
        document.getElementById('module-stat-cumple').textContent = `✅ ${st.cumple}`;
        document.getElementById('module-stat-parcial').textContent = `◐ ${st.parcial}`;
        document.getElementById('module-stat-nocumple').textContent = `❌ ${st.noCumple}`;
        document.getElementById('module-stat-na').textContent = `— ${st.noAplica}`;
        document.getElementById('module-stat-pct').textContent = `${st.pct}%`;
      }
    });
  });

  // Observations
  container.querySelectorAll('[data-observaciones]').forEach(el => {
    el.addEventListener('blur', (e) => {
      const codigo = e.target.dataset.observaciones;
      store.setRequisitoObservaciones(codigo, e.target.value);
    });
  });

  // Vencimiento date picker
  container.querySelectorAll('[data-vencimiento]').forEach(el => {
    el.addEventListener('change', (e) => {
      const codigo = e.target.dataset.vencimiento;
      store.setFechaVencimiento(codigo, e.target.value || null);
    });
  });

  // Evidence buttons
  container.querySelectorAll('[data-evidencia]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const codigo = e.currentTarget.dataset.evidencia;
      _openEvidenceModal(codigo);
    });
  });
}

function _openEvidenceModal(codigo) {
  // Dispatched to main.js which handles the modal
  document.dispatchEvent(new CustomEvent('open-evidence-modal', { detail: { codigo } }));
}

export function refreshModuleAfterEvidence(codigo) {
  // Re-render just the evidence button for that codigo
  const reqRow = document.querySelector(`.requisito[data-codigo="${codigo}"]`);
  if (!reqRow) return;

  const st = store.getRequisitoState(codigo);
  const btn = reqRow.querySelector('[data-evidencia]');
  if (btn) {
    btn.classList.toggle('has-file', !!st?.evidencia);
  }

  // Update evidence info if it exists
  const existingInfo = reqRow.querySelector('.evidence-info');
  if (existingInfo) existingInfo.remove();

  if (st?.evidencia) {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'evidence-info';
    infoDiv.innerHTML = `
      <span>📎</span>
      <span class="evidence-info__name">${st.evidencia.name}</span>
      <span class="badge badge--success">Validado</span>
    `;
    const content = reqRow.querySelector('.requisito__content');
    if (content) content.after(infoDiv);
  }
}
