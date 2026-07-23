import { store } from '../engine/store.js';
import { pubsub } from '../utils/pubsub.js';
import { EVENT, SECCIONES_EXPEDIENTE, getTipoExpMeta, getTiposExpFlat, getLocalidadesFromStore } from '../constants.js';
import { formatDate, getInitials } from '../utils/format.js';
import { getFileIcon, formatFileSize } from '../utils/file.js';

let currentView = 'dashboard';
let selectedEmpleadoId = null;

export function renderExpedientes() {
  const container = document.getElementById('expedientes-content');
  if (!container) return;

  if (currentView === 'detail' && selectedEmpleadoId) {
    renderDetail(container);
  } else {
    renderDashboard(container);
  }
}

function renderDashboard(container) {
  const allEmpleados = (Array.isArray(store.state.empleados) ? store.state.empleados : [])
    .filter(e => e.estatus === 'activo');
  const documentos = Array.isArray(store.state.documentos) ? store.state.documentos : [];

  const filterLoc = document.getElementById('exp-filter-localidad')?.value || '';
  const search = (document.getElementById('exp-search')?.value || '').toLowerCase();
  let empleados = filterLoc ? allEmpleados.filter(e => e.localidad === filterLoc) : allEmpleados;
  if (search) {
    empleados = empleados.filter(e =>
      (e.nombre + ' ' + e.apellido).toLowerCase().includes(search) ||
      (e.cedula || '').toLowerCase().includes(search)
    );
  }

  const tiposEsperados = getTiposExpFlat().filter(t => !t.multiple);
  let completos = 0;
  let incompletos = 0;
  let totalPct = 0;

  const faltantesMap = {};
  tiposEsperados.forEach(t => { faltantesMap[t.key] = { ...t, count: 0 }; });

  empleados.forEach(emp => {
    const docs = documentos.filter(d => d.empleado_id === emp.id);
    const completados = tiposEsperados.filter(t => docs.some(d => d.tipo === t.key)).length;
    const pct = tiposEsperados.length > 0 ? Math.round((completados / tiposEsperados.length) * 100) : 0;
    totalPct += pct;
    if (pct === 100) completos++;
    else incompletos++;

    tiposEsperados.forEach(t => {
      if (!docs.some(d => d.tipo === t.key)) {
        faltantesMap[t.key].count++;
      }
    });
  });

  const promedio = empleados.length > 0 ? Math.round(totalPct / empleados.length) : 0;
  const faltantesList = Object.values(faltantesMap).filter(f => f.count > 0).sort((a, b) => b.count - a.count);

  const localidades = getLocalidadesFromStore(allEmpleados);

  container.innerHTML = `
    <div class="exp-dashboard-kpis">
      <div class="exp-kpi">
        <div class="exp-kpi__value">${empleados.length}</div>
        <div class="exp-kpi__label">Empleados</div>
      </div>
      <div class="exp-kpi exp-kpi--success">
        <div class="exp-kpi__value">${completos}</div>
        <div class="exp-kpi__label">Completos</div>
      </div>
      <div class="exp-kpi exp-kpi--warning">
        <div class="exp-kpi__value">${incompletos}</div>
        <div class="exp-kpi__label">Incompletos</div>
      </div>
    </div>

    <div class="exp-progress-general">
      <div class="exp-progress-general__header">
        <span>Progreso General</span>
        <span class="exp-progress-general__pct">${promedio}%</span>
      </div>
      <div class="exp-progress exp-progress--lg">
        <div class="exp-progress__bar" style="width:${promedio}%"></div>
      </div>
    </div>

    ${faltantesList.length > 0 ? `
    <div class="exp-faltantes">
      <h3 class="exp-faltantes__title">Documentos Más Faltantes</h3>
      <div class="exp-faltantes__list">
        ${faltantesList.map(f => {
          const severity = f.count > 50 ? 'danger' : f.count > 20 ? 'warning' : 'success';
          return `
          <div class="exp-faltante exp-faltante--${severity}">
            <span class="exp-faltante__label">${f.icon} ${f.label}</span>
            <span class="exp-faltante__count">${f.count} faltan</span>
          </div>`;
        }).join('')}
      </div>
    </div>` : ''}

    <div class="exp-toolbar">
      <div class="toolbar__search" data-action="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="exp-search" placeholder="Buscar por nombre o cédula...">
      </div>
      <select id="exp-filter-localidad" class="form-select">
        <option value="">Todas las localidades</option>
        ${localidades.map(l => `<option value="${l}" ${filterLoc === l ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
    </div>

    <div class="expedientes-grid">
      ${empleados.map(emp => {
        const docs = documentos.filter(d => d.empleado_id === emp.id);
        const completados = tiposEsperados.filter(t => docs.some(d => d.tipo === t.key)).length;
        const pct = tiposEsperados.length > 0 ? Math.round((completados / tiposEsperados.length) * 100) : 0;
        const inicial = getInitials(emp.nombre, emp.apellido);

        return `
          <div class="exp-card" data-empleado-id="${emp.id}">
            <div class="exp-card__header">
              <div class="exp-card__avatar">${inicial}</div>
              <div class="exp-card__info">
                <h4 class="exp-card__name">${emp.nombre} ${emp.apellido}</h4>
                <p class="exp-card__dept">${emp.departamento || 'Sin departamento'}</p>
              </div>
            </div>
            <div class="exp-card__progress">
              <div class="exp-progress">
                <div class="exp-progress__bar" style="width:${pct}%"></div>
              </div>
              <span class="exp-progress__label">${pct}% completado</span>
            </div>
          </div>`;
      }).join('')}
    </div>
  `;

  container.querySelectorAll('.exp-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedEmpleadoId = parseInt(card.dataset.empleadoId);
      currentView = 'detail';
      renderExpedientes();
    });
  });

  document.getElementById('exp-search')?.addEventListener('input', () => renderDashboard(container));
  document.getElementById('exp-filter-localidad')?.addEventListener('change', () => renderDashboard(container));
}

function renderDetail(container) {
  const emp = store.getEmpleadoById(selectedEmpleadoId);
  if (!emp) {
    currentView = 'dashboard';
    selectedEmpleadoId = null;
    return renderDashboard(container);
  }

  const documentos = (Array.isArray(store.state.documentos) ? store.state.documentos : [])
    .filter(d => d.empleado_id === selectedEmpleadoId);

  container.innerHTML = `
    <button class="btn btn--ghost exp-back" id="exp-btn-back">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Volver al Resumen
    </button>

    <div class="exp-detail-header">
      <div class="exp-detail-avatar">${getInitials(emp.nombre, emp.apellido)}</div>
      <div>
        <h2 class="exp-detail-name">${emp.nombre} ${emp.apellido}</h2>
        <p class="exp-detail-meta">${emp.cedula ? 'C.I. ' + emp.cedula : ''} ${emp.departamento ? '— ' + emp.departamento : ''}</p>
      </div>
    </div>

    ${Object.values(SECCIONES_EXPEDIENTE).map(seccion => `
      <div class="exp-section">
        <h3 class="exp-section__title">${seccion.label}</h3>
        <div class="exp-section__grid">
          ${seccion.tipos.map(tipo => {
            const docsForType = documentos.filter(d => d.tipo === tipo.key);
            if (tipo.multiple) {
              return renderDocSlotMultiple(tipo, docsForType);
            } else {
              return renderDocSlotSingle(tipo, docsForType[0] || null);
            }
          }).join('')}
        </div>
      </div>
    `).join('')}

    <div id="exp-upload-modal" class="modal-overlay" style="display:none">
      <div class="modal" style="max-width:480px">
        <div class="modal__header">
          <h3 class="modal__title">Subir Documento</h3>
          <button class="modal__close" id="exp-upload-close">&times;</button>
        </div>
        <div class="modal__body">
          <p class="exp-upload-label" id="exp-upload-tipo-label"></p>
          <div class="exp-upload-zone" id="exp-drop-zone">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            <p>Arrastra un archivo aquí o</p>
            <label class="btn btn--primary btn--sm exp-upload-btn">
              Seleccionar archivo
              <input type="file" id="exp-file-input" accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.zip,.rar" style="display:none">
            </label>
            <p class="exp-upload-hint">PDF, imágenes, Word, Excel, ZIP (máx. 10MB)</p>
          </div>
          <p class="exp-upload-filename" id="exp-upload-filename"></p>
          <div class="form-error" id="exp-upload-error"></div>
        </div>
        <div class="modal__footer">
          <button class="btn btn--ghost" id="exp-upload-cancel">Cancelar</button>
          <button class="btn btn--primary" id="exp-upload-save" disabled>Subir</button>
        </div>
      </div>
    </div>

    <div id="exp-preview-modal" class="modal-overlay" style="display:none">
      <div class="modal modal--lg">
        <div class="modal__header">
          <h3 class="modal__title" id="exp-preview-title"></h3>
          <button class="modal__close" id="exp-preview-close">&times;</button>
        </div>
        <div class="modal__body exp-preview-body" id="exp-preview-body"></div>
        <div class="modal__footer">
          <a class="btn btn--primary" id="exp-preview-download" href="#" target="_blank" download>Descargar</a>
          <button class="btn btn--ghost" id="exp-preview-ok">Cerrar</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('exp-btn-back')?.addEventListener('click', () => {
    currentView = 'dashboard';
    selectedEmpleadoId = null;
    renderExpedientes();
  });

  bindDetailEvents();
}

function renderDocSlotSingle(tipo, doc) {
  if (doc) {
    return `
      <div class="exp-slot exp-slot--filled">
        <div class="exp-slot__icon">${tipo.icon}</div>
        <div class="exp-slot__info">
          <span class="exp-slot__label">${tipo.label}</span>
          <span class="exp-slot__file">${doc.nombre_archivo}</span>
          <span class="exp-slot__date">${formatDate(doc.fecha_subida)}</span>
        </div>
        <div class="exp-slot__actions">
          <button class="btn btn--ghost btn--sm exp-btn-preview" data-url="${doc.url}" data-name="${doc.nombre_archivo}" title="Ver">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          ${store.hasRole('admin') ? `<button class="btn btn--ghost btn--sm exp-btn-delete" data-id="${doc.id}" title="Eliminar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>` : ''}
        </div>
      </div>`;
  }
  return `
    <div class="exp-slot exp-slot--empty">
      <div class="exp-slot__icon">${tipo.icon}</div>
      <span class="exp-slot__label">${tipo.label}</span>
      ${store.hasRole('admin') ? `<button class="btn btn--primary btn--sm exp-btn-upload" data-tipo="${tipo.key}" data-tipo-label="${tipo.label}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Subir
      </button>` : ''}
    </div>`;
}

function renderDocSlotMultiple(tipo, docs) {
  const items = docs.map(doc => `
    <div class="exp-slot__item">
      <div class="exp-slot__item-info">
        <span class="exp-slot__file">${getFileIcon(doc.nombre_archivo.split('.').pop())} ${doc.nombre_archivo}</span>
        <span class="exp-slot__date">${formatDate(doc.fecha_subida)}</span>
      </div>
      <div class="exp-slot__actions">
        <button class="btn btn--ghost btn--sm exp-btn-preview" data-url="${doc.url}" data-name="${doc.nombre_archivo}" title="Ver">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        ${store.hasRole('admin') ? `<button class="btn btn--ghost btn--sm exp-btn-delete" data-id="${doc.id}" title="Eliminar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        </button>` : ''}
      </div>
    </div>`).join('');

  return `
    <div class="exp-slot exp-slot--filled exp-slot--multiple">
      <div class="exp-slot__header">
        <div class="exp-slot__icon">${tipo.icon}</div>
        <span class="exp-slot__label">${tipo.label}</span>
        <span class="exp-slot__count">${docs.length} archivo${docs.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="exp-slot__list">
        ${items}
      </div>
      ${store.hasRole('admin') ? `<button class="btn btn--primary btn--sm exp-btn-upload" data-tipo="${tipo.key}" data-tipo-label="${tipo.label}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Agregar archivo
      </button>` : ''}
    </div>`;
}

let pendingFile = null;
let pendingTipo = '';

function openUploadModal(tipo, tipoLabel) {
  pendingFile = null;
  pendingTipo = tipo;
  const modal = document.getElementById('exp-upload-modal');
  document.getElementById('exp-upload-tipo-label').textContent = tipoLabel;
  document.getElementById('exp-upload-filename').textContent = '';
  document.getElementById('exp-upload-error').textContent = '';
  document.getElementById('exp-upload-save').disabled = true;
  document.getElementById('exp-file-input').value = '';
  modal.style.display = 'flex';
}

function closeUploadModal() {
  document.getElementById('exp-upload-modal').style.display = 'none';
  pendingFile = null;
}

function openPreviewModal(url, name) {
  const modal = document.getElementById('exp-preview-modal');
  const body = document.getElementById('exp-preview-body');
  const title = document.getElementById('exp-preview-title');
  const download = document.getElementById('exp-preview-download');

  title.textContent = name;
  download.href = url;

  const ext = (name.split('.').pop() || '').toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    body.innerHTML = `<img src="${url}" alt="${name}" class="exp-preview-img">`;
  } else if (ext === 'pdf') {
    body.innerHTML = `<iframe src="${url}" class="exp-preview-pdf" title="${name}"></iframe>`;
  } else {
    body.innerHTML = `
      <div class="exp-preview-unsupported">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
        <p>Vista previa no disponible para este tipo de archivo</p>
      </div>`;
  }

  modal.style.display = 'flex';
}

function closePreviewModal() {
  document.getElementById('exp-preview-modal').style.display = 'none';
  document.getElementById('exp-preview-body').innerHTML = '';
}

function bindDetailEvents() {
  document.querySelectorAll('.exp-btn-upload').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openUploadModal(btn.dataset.tipo, btn.dataset.tipoLabel);
    });
  });

  document.querySelectorAll('.exp-btn-preview').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openPreviewModal(btn.dataset.url, btn.dataset.name);
    });
  });

  document.querySelectorAll('.exp-btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('\u00BFEliminar este documento?')) {
        await store.deleteDocumento(parseInt(btn.dataset.id));
      }
    });
  });

  document.getElementById('exp-upload-close')?.addEventListener('click', closeUploadModal);
  document.getElementById('exp-upload-cancel')?.addEventListener('click', closeUploadModal);
  document.getElementById('exp-upload-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeUploadModal();
  });

  document.getElementById('exp-preview-close')?.addEventListener('click', closePreviewModal);
  document.getElementById('exp-preview-ok')?.addEventListener('click', closePreviewModal);
  document.getElementById('exp-preview-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closePreviewModal();
  });

  const fileInput = document.getElementById('exp-file-input');
  const dropZone = document.getElementById('exp-drop-zone');

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
  });

  dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('exp-drop-zone--hover');
  });

  dropZone?.addEventListener('dragleave', () => {
    dropZone.classList.remove('exp-drop-zone--hover');
  });

  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('exp-drop-zone--hover');
    if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
  });

  document.getElementById('exp-upload-save')?.addEventListener('click', doUpload);
}

function handleFileSelect(file) {
  if (file.size > 10 * 1024 * 1024) {
    document.getElementById('exp-upload-error').textContent = 'El archivo supera los 10MB';
    return;
  }
  pendingFile = file;
  document.getElementById('exp-upload-filename').textContent = `${file.name} (${formatFileSize(file.size)})`;
  document.getElementById('exp-upload-error').textContent = '';
  document.getElementById('exp-upload-save').disabled = false;
}

async function doUpload() {
  if (!pendingFile || !selectedEmpleadoId) return;
  const btn = document.getElementById('exp-upload-save');
  btn.disabled = true;
  btn.textContent = 'Subiendo...';

  const fd = new FormData();
  fd.append('empleado_id', selectedEmpleadoId);
  fd.append('tipo', pendingTipo);
  fd.append('file', pendingFile);

  try {
    await store.uploadDocumento(fd);
    closeUploadModal();
  } catch (err) {
    document.getElementById('exp-upload-error').textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Subir';
  }
}

export function initExpedientes() {
  pubsub.on(EVENT.DOCUMENTS_UPDATED, () => {
    if (store.state.ui.currentView === 'expedientes') renderExpedientes();
  });
  pubsub.on(EVENT.EMPLOYEES_UPDATED, () => {
    if (store.state.ui.currentView === 'expedientes') renderExpedientes();
  });
}
