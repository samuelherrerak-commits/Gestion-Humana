import { store } from '../engine/store.js';
import { AUDITORIA_ESTADO, ESTADO_PLAN, RIESGO_COLOR, RIESGO_BG, EVENT } from '../constants.js';
import { formatDate } from '../utils/format.js';
import { pubsub } from '../utils/pubsub.js';

let _filterModulo = 'todos';
let _filterRiesgo = 'todos';

export function renderPlanAccion() {
  const container = document.getElementById('plan-content');
  if (!container) return;

  const finalizada = store.estaFinalizada();

  container.innerHTML = `
    <div class="plan-banner" id="plan-banner">
      ${finalizada
        ? '<span class="badge badge--success">✔ Auditoría Finalizada</span> <span>Los planes de acción están habilitados para edición.</span>'
        : '<span class="badge badge--warning">⏳ Auditoría en Progreso</span> <span>Finalice la auditoría para activar la edición de los planes de acción.</span>'
      }
    </div>

    <div class="plan-filters" id="plan-filters">
      <div class="form-group" style="display:flex;gap:var(--space-3);align-items:center;flex-wrap:wrap;">
        <label class="form-label" style="margin:0">Filtrar por módulo:</label>
        <select class="form-select" id="plan-filter-modulo" style="width:auto;min-width:180px;">
          <option value="todos">Todos los módulos</option>
        </select>
        <label class="form-label" style="margin:0">Nivel de riesgo:</label>
        <select class="form-select" id="plan-filter-riesgo" style="width:auto;min-width:140px;">
          <option value="todos">Todos</option>
          <option value="CRÍTICO">Crítico</option>
          <option value="ALTO">Alto</option>
          <option value="MEDIO">Medio</option>
          <option value="BAJO">Bajo</option>
        </select>
        <span class="plan-count" id="plan-count"></span>
      </div>
    </div>

    <div class="plan-list" id="plan-list"></div>
  `;

  _renderPlanItems(finalizada);
  _attachFilterEvents(finalizada);

  // Re-render on plan updates
  pubsub.on(EVENT.PLAN_UPDATED, () => {
    _renderPlanItems(store.estaFinalizada());
  });
}

function _attachFilterEvents(finalizada) {
  const selMod = document.getElementById('plan-filter-modulo');
  const selRies = document.getElementById('plan-filter-riesgo');

  if (selMod) {
    // Populate module options
    const mods = [];
    store.getNoCumplenRequisitos().forEach(r => {
      if (!mods.find(m => m.id === r._moduloId)) {
        mods.push({ id: r._moduloId, title: r._moduloTitle });
      }
    });
    mods.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.title;
      selMod.appendChild(opt);
    });

    selMod.addEventListener('change', () => {
      _filterModulo = selMod.value;
      _renderPlanItems(store.estaFinalizada());
    });
  }

  if (selRies) {
    selRies.addEventListener('change', () => {
      _filterRiesgo = selRies.value;
      _renderPlanItems(store.estaFinalizada());
    });
  }
}

function _renderPlanItems(finalizada) {
  const list = document.getElementById('plan-list');
  const count = document.getElementById('plan-count');
  if (!list) return;

  let items = store.getNoCumplenRequisitos();

  if (_filterModulo !== 'todos') {
    items = items.filter(r => r._moduloId === parseInt(_filterModulo));
  }
  if (_filterRiesgo !== 'todos') {
    items = items.filter(r => r.nivelRiesgo === _filterRiesgo);
  }

  if (count) {
    count.textContent = `${items.length} hallazgo(s)`;
  }

  if (items.length === 0) {
    list.innerHTML = `
      <div class="placeholder-view">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <h3>Sin hallazgos pendientes</h3>
        <p>No hay requisitos marcados como "No Cumple"${_filterModulo !== 'todos' || _filterRiesgo !== 'todos' ? ' con los filtros actuales' : ''}.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = items.map(item => _renderPlanItem(item, finalizada)).join('');

  // Attach save events
  if (finalizada) {
    list.querySelectorAll('[data-plan-save]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const codigo = e.currentTarget.dataset.planSave;
        _guardarPlan(codigo);
      });
    });
  }
}

function _renderPlanItem(item, finalizada) {
  const hal = item._state?.hallazgo || item.hallazgo || {};
  const readonly = !finalizada ? 'readonly disabled' : '';
  const dis = !finalizada ? 'disabled' : '';

  const riesgoColor = RIESGO_COLOR[item.nivelRiesgo] || 'var(--color-text-muted)';
  const riesgoBg = RIESGO_BG[item.nivelRiesgo] || 'var(--color-gray-100)';

  const estatusPlan = hal.estadoPlan || ESTADO_PLAN.ABIERTO;

  return `
    <div class="plan-card" data-plan-codigo="${item.codigo}">
      <div class="plan-card__header">
        <span class="plan-card__codigo">${item.codigo}</span>
        <span class="plan-card__modulo">${item._moduloTitle}</span>
        <span class="badge" style="background:${riesgoBg};color:${riesgoColor}">${item.nivelRiesgo}</span>
        <span class="plan-card__estado">
          <select class="form-select plan-estado-select" data-plan-estado="${item.codigo}" ${dis}>
            <option value="abierto" ${estatusPlan === 'abierto' ? 'selected' : ''}>Abierto</option>
            <option value="en-proceso" ${estatusPlan === 'en-proceso' ? 'selected' : ''}>En Proceso</option>
            <option value="cerrado" ${estatusPlan === 'cerrado' ? 'selected' : ''}>Cerrado</option>
            <option value="vencido" ${estatusPlan === 'vencido' ? 'selected' : ''}>Vencido</option>
          </select>
        </span>
      </div>
      <div class="plan-card__body">
        <div class="plan-card__pregunta">${item.pregunta}</div>
        <div class="plan-card__legal">${item.fundamentoLegal.articulo} · ${item.fundamentoLegal.ley}</div>
        <div class="plan-card__fields">
          <div class="plan-field">
            <label class="form-label">Descripción del Hallazgo</label>
            <textarea class="form-textarea plan-input" data-plan-desc="${item.codigo}" rows="2" ${readonly}>${hal.descripcion || ''}</textarea>
          </div>
          <div class="plan-field">
            <label class="form-label">Acción Correctiva / Recomendación</label>
            <textarea class="form-textarea plan-input" data-plan-recom="${item.codigo}" rows="2" ${readonly}>${hal.recomendacion || ''}</textarea>
          </div>
          <div class="plan-field-row">
            <div class="plan-field">
              <label class="form-label">Responsable</label>
              <input type="text" class="form-input plan-input" data-plan-resp="${item.codigo}" value="${hal.responsableAccion || ''}" ${readonly}>
            </div>
            <div class="plan-field">
              <label class="form-label">Fecha Compromiso</label>
              <input type="date" class="form-input plan-input" data-plan-fecha="${item.codigo}" value="${hal.fechaCompromiso || ''}" ${readonly}>
            </div>
            <div class="plan-field">
              <label class="form-label">Costo Estimado</label>
              <input type="number" class="form-input plan-input" data-plan-costo="${item.codigo}" value="${hal.costoEstimado || ''}" min="0" step="0.01" ${readonly}>
            </div>
            <div class="plan-field">
              <label class="form-label">Prioridad</label>
              <select class="form-select plan-input" data-plan-prioridad="${item.codigo}" ${dis}>
                <option value="bajo" ${hal.prioridad === 'bajo' ? 'selected' : ''}>Bajo</option>
                <option value="medio" ${(hal.prioridad || 'medio') === 'medio' ? 'selected' : ''}>Medio</option>
                <option value="alto" ${hal.prioridad === 'alto' ? 'selected' : ''}>Alto</option>
                <option value="crítico" ${hal.prioridad === 'crítico' ? 'selected' : ''}>Crítico</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      ${finalizada ? `
        <div class="plan-card__footer">
          <button class="btn btn--primary btn--sm" data-plan-save="${item.codigo}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Guardar
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function _guardarPlan(codigo) {
  const desc = document.querySelector(`[data-plan-desc="${codigo}"]`)?.value || '';
  const recomendacion = document.querySelector(`[data-plan-recom="${codigo}"]`)?.value || '';
  const responsable = document.querySelector(`[data-plan-resp="${codigo}"]`)?.value || '';
  const fechaCompromiso = document.querySelector(`[data-plan-fecha="${codigo}"]`)?.value || null;
  const costoEstimado = parseFloat(document.querySelector(`[data-plan-costo="${codigo}"]`)?.value) || null;
  const prioridad = document.querySelector(`[data-plan-prioridad="${codigo}"]`)?.value || 'medio';
  const estadoPlan = document.querySelector(`[data-plan-estado="${codigo}"]`)?.value || 'abierto';

  store.setHallazgo(codigo, {
    descripcion: desc,
    recomendacion,
    responsableAccion: responsable,
    fechaCompromiso: fechaCompromiso,
    costoEstimado,
    prioridad,
    estadoPlan
  });

  // Visual feedback
  const btn = document.querySelector(`[data-plan-save="${codigo}"]`);
  if (btn) {
    const origText = btn.innerHTML;
    btn.innerHTML = '✔ Guardado';
    btn.classList.add('btn--success');
    setTimeout(() => {
      btn.innerHTML = origText;
      btn.classList.remove('btn--success');
    }, 2000);
  }
}
