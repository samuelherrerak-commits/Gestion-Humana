import { store } from '../engine/store.js';
import { pubsub } from '../utils/pubsub.js';
import { EVENT, ESTATUS_FIDEICOMISO_LABELS, ESTATUS_FIDEICOMISO_COLORS, TRIMESTRES, TRIMESTRE_LABELS, getLocalidadesFromStore } from '../constants.js';
import { formatCurrency, formatDate } from '../utils/format.js';

let currentTab = 'admin';
let uploadState = { file: null, data: null };

export function renderFideicomiso() {
  const container = document.getElementById('fideicomiso-content');
  if (!container) return;

  const isAdmin = store.hasRole('admin');

  if (currentTab === 'admin' && isAdmin) {
    renderAdminView(container);
  } else {
    renderEmpleadoView(container);
  }
}

function renderAdminView(container) {
  const aportes = Array.isArray(store.state.fideicomisoAportes) ? store.state.fideicomisoAportes : [];
  const solicitudes = Array.isArray(store.state.fideicomisoSolicitudes) ? store.state.fideicomisoSolicitudes : [];
  const empleados = (Array.isArray(store.state.empleados) ? store.state.empleados : []).filter(e => e.estatus === 'activo');
  const localidades = getLocalidadesFromStore(empleados);

  const years = [...new Set(aportes.map(a => a.anio))].sort((a, b) => b - a);
  const currentYear = new Date().getFullYear();
  if (!years.includes(currentYear)) years.unshift(currentYear);

  const pendientes = solicitudes.filter(s => s.estado === 'pendiente');

  container.innerHTML = `
    <div class="fid-admin-header">
      <div class="fid-admin-actions">
        <button class="btn btn--primary" id="fid-btn-upload">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          Subir Aportes Excel
        </button>
        <button class="btn btn--ghost" id="fid-btn-export">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Exportar Archivo Banco
        </button>
      </div>
      ${pendientes.length > 0 ? `<span class="fid-badge-pendientes">${pendientes.length} solicitud${pendientes.length !== 1 ? 'es' : ''} pendiente${pendientes.length !== 1 ? 's' : ''}</span>` : ''}
    </div>

    <div class="fid-tabs">
      <button class="fid-tab ${currentTab === 'admin' ? 'active' : ''}" data-ftab="admin-aportes">Aportes</button>
      <button class="fid-tab" data-ftab="admin-solicitudes">Solicitudes ${pendientes.length > 0 ? `<span class="fid-tab-badge">${pendientes.length}</span>` : ''}</button>
    </div>

    <div id="fid-tab-aportes" class="fid-tab-panel" style="display:${currentTab === 'admin' || currentTab === 'admin-aportes' ? 'block' : 'none'}">
      <div class="fid-filters">
        <select id="fid-filter-year">
          ${years.map(y => `<option value="${y}">${y}</option>`).join('')}
        </select>
        <select id="fid-filter-localidad">
          <option value="">Todas las localidades</option>
          ${localidades.map(l => `<option value="${l}">${l}</option>`).join('')}
        </select>
      </div>
      <div class="panel">
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Localidad</th>
                ${TRIMESTRES.map(q => `<th>${q}</th>`).join('')}
                <th>Total</th>
              </tr>
            </thead>
            <tbody id="fid-aportes-table-body"></tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="fid-tab-solicitudes" class="fid-tab-panel" style="display:none">
      <div class="panel">
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Monto</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="fid-solicitudes-table-body"></tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="fid-upload-modal" class="modal-overlay" style="display:none">
      <div class="modal" style="max-width:600px">
        <div class="modal__header">
          <h3 class="modal__title">Subir Aportes Excel</h3>
          <button class="modal__close" id="fid-upload-close">&times;</button>
        </div>
        <div class="modal__body">
          <p class="fid-upload-hint">El Excel debe tener columnas: <strong>Cedula</strong> (o <strong>Nombre</strong>), <strong>Q1</strong>, <strong>Q2</strong>, <strong>Q3</strong>, <strong>Q4</strong></p>
          <div class="exp-upload-zone" id="fid-drop-zone">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            <p>Arrastra un archivo Excel o</p>
            <label class="btn btn--primary btn--sm exp-upload-btn">
              Seleccionar archivo
              <input type="file" id="fid-file-input" accept=".xlsx,.xls,.csv" style="display:none">
            </label>
          </div>
          <p class="exp-upload-filename" id="fid-upload-filename"></p>
          <div id="fid-upload-preview" style="display:none; margin-top: var(--space-3);">
            <p class="fid-preview-label">Vista previa (<span id="fid-preview-count">0</span> registros):</p>
            <div class="fid-preview-table-wrap">
              <table class="data-table data-table--sm">
                <thead><tr><th>Cédula</th><th>Empleado</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th></tr></thead>
                <tbody id="fid-preview-body"></tbody>
              </table>
            </div>
          </div>
          <div class="form-error" id="fid-upload-error"></div>
        </div>
        <div class="modal__footer">
          <button class="btn btn--ghost" id="fid-upload-cancel">Cancelar</button>
          <button class="btn btn--primary" id="fid-upload-save" disabled>Guardar Aportes</button>
        </div>
      </div>
    </div>
  `;

  renderAportesTable();
  renderSolicitudesTable();
  bindAdminEvents();
}

function renderAportesTable() {
  const tbody = document.getElementById('fid-aportes-table-body');
  if (!tbody) return;

  const aportes = Array.isArray(store.state.fideicomisoAportes) ? store.state.fideicomisoAportes : [];
  const empleados = (Array.isArray(store.state.empleados) ? store.state.empleados : []).filter(e => e.estatus === 'activo');

  const filterYear = parseInt(document.getElementById('fid-filter-year')?.value) || new Date().getFullYear();
  const filterLoc = document.getElementById('fid-filter-localidad')?.value || '';

  let filteredEmpleados = empleados;
  if (filterLoc) filteredEmpleados = empleados.filter(e => e.localidad === filterLoc);

  const rows = filteredEmpleados.map(emp => {
    const empAportes = aportes.filter(a => a.empleado_id === emp.id && a.anio === filterYear);
    const byQ = {};
    empAportes.forEach(a => { byQ[a.trimestre] = Number(a.monto || 0); });
    const total = Object.values(byQ).reduce((s, v) => s + v, 0);

    return `
      <tr>
        <td class="cell-primary">${emp.nombre} ${emp.apellido}</td>
        <td>${emp.localidad || '—'}</td>
        ${TRIMESTRES.map(q => `<td>${byQ[q] ? formatCurrency(byQ[q]) : '—'}</td>`).join('')}
        <td class="cell-primary">${total > 0 ? formatCurrency(total) : '—'}</td>
      </tr>`;
  }).join('');

  tbody.innerHTML = rows || '<tr><td colspan="6" class="text-center text-muted">No hay datos para este filtro</td></tr>';
}

function renderSolicitudesTable() {
  const tbody = document.getElementById('fid-solicitudes-table-body');
  if (!tbody) return;

  const solicitudes = Array.isArray(store.state.fideicomisoSolicitudes) ? store.state.fideicomisoSolicitudes : [];
  if (solicitudes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay solicitudes</td></tr>';
    return;
  }

  tbody.innerHTML = solicitudes.map(sol => {
    const emp = store.getEmpleadoById(sol.empleado_id);
    const colorClass = ESTATUS_FIDEICOMISO_COLORS[sol.estado] || '';
    const label = ESTATUS_FIDEICOMISO_LABELS[sol.estado] || sol.estado;

    return `
      <tr>
        <td class="cell-primary">${emp ? emp.nombre + ' ' + emp.apellido : '—'}</td>
        <td>${formatCurrency(sol.monto_solicitado)}</td>
        <td>${sol.motivo || '—'}</td>
        <td><span class="badge badge--${colorClass}">${label}</span></td>
        <td>${formatDate(sol.created_at)}</td>
        <td>
          ${sol.estado === 'pendiente' ? `
            <button class="btn btn--ghost btn--sm fid-btn-approve" data-id="${sol.id}" title="Aprobar">\u2713</button>
            <button class="btn btn--ghost btn--sm fid-btn-reject" data-id="${sol.id}" title="Rechazar">\u2717</button>
          ` : '—'}
        </td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('.fid-btn-approve').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('\u00BFAprobar esta solicitud de retiro?')) {
        await store.updateSolicitudFideicomiso(parseInt(btn.dataset.id), { estado: 'aprobada' });
      }
    });
  });

  tbody.querySelectorAll('.fid-btn-reject').forEach(btn => {
    btn.addEventListener('click', async () => {
      const notas = prompt('Motivo del rechazo (opcional):');
      await store.updateSolicitudFideicomiso(parseInt(btn.dataset.id), { estado: 'rechazada', notas_admin: notas || null });
    });
  });
}

function renderEmpleadoView(container) {
  const user = store.state.authUser;
  const empleado = store.getEmpleadoById(user?.empleado_id || user?.id);

  if (!empleado) {
    container.innerHTML = '<div class="empty-state"><h3>No se encontró tu perfil</h3><p>Contacta a Recursos Humanos</p></div>';
    return;
  }

  const aportes = store.getAportesByEmpleado(empleado.id);
  const solicitudes = store.getSolicitudesByEmpleado(empleado.id);
  const saldo = store.getSaldoFideicomiso(empleado.id);

  const aportesByYear = {};
  aportes.forEach(a => {
    if (!aportesByYear[a.anio]) aportesByYear[a.anio] = {};
    aportesByYear[a.anio][a.trimestre] = Number(a.monto || 0);
  });

  container.innerHTML = `
    <div class="fid-empleado-header">
      <div class="fid-saldo-card">
        <span class="fid-saldo-label">Saldo Total en Fideicomiso</span>
        <span class="fid-saldo-amount">${formatCurrency(saldo)}</span>
      </div>
    </div>

    <div class="fid-section">
      <h3 class="fid-section__title">Mis Aportes</h3>
      ${Object.keys(aportesByYear).sort((a, b) => b - a).map(year => `
        <div class="fid-year-block">
          <h4 class="fid-year-label">${year}</h4>
          <div class="fid-trimestres">
            ${TRIMESTRES.map(q => `
              <div class="fid-trimestre-card ${aportesByYear[year][q] ? 'fid-trimestre-card--filled' : ''}">
                <span class="fid-trimestre-q">${q}</span>
                <span class="fid-trimestre-monto">${aportesByYear[year][q] ? formatCurrency(aportesByYear[year][q]) : '—'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('') || '<p class="text-muted">No hay aportes registrados</p>'}
    </div>

    <div class="fid-section">
      <div class="fid-section__header">
        <h3 class="fid-section__title">Mis Solicitudes de Retiro</h3>
        <button class="btn btn--primary btn--sm" id="fid-btn-nueva-solicitud">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva Solicitud
        </button>
      </div>
      ${solicitudes.length > 0 ? `
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>Monto</th><th>Motivo</th><th>Estado</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              ${solicitudes.map(sol => `
                <tr>
                  <td>${formatCurrency(sol.monto_solicitado)}</td>
                  <td>${sol.motivo || '—'}</td>
                  <td><span class="badge badge--${ESTATUS_FIDEICOMISO_COLORS[sol.estado] || ''}">${ESTATUS_FIDEICOMISO_LABELS[sol.estado] || sol.estado}</span></td>
                  <td>${formatDate(sol.created_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<p class="text-muted">No has realizado solicitudes</p>'}
    </div>

    <div id="fid-solicitud-modal" class="modal-overlay" style="display:none">
      <div class="modal" style="max-width:440px">
        <div class="modal__header">
          <h3 class="modal__title">Solicitar Retiro</h3>
          <button class="modal__close" id="fid-sol-close">&times;</button>
        </div>
        <div class="modal__body">
          <p class="fid-saldo-info">Saldo disponible: <strong>${formatCurrency(saldo)}</strong></p>
          <div class="form-group">
            <label class="form-label">Monto a solicitar *</label>
            <input type="number" id="fid-sol-monto" class="form-input" min="0" step="0.01" max="${saldo}" placeholder="0.00">
          </div>
          <div class="form-group">
            <label class="form-label">Motivo</label>
            <textarea id="fid-sol-motivo" class="form-input" rows="3" placeholder="Describe el motivo de la solicitud..."></textarea>
          </div>
          <div class="form-error" id="fid-sol-error"></div>
        </div>
        <div class="modal__footer">
          <button class="btn btn--ghost" id="fid-sol-cancel">Cancelar</button>
          <button class="btn btn--primary" id="fid-sol-save">Enviar Solicitud</button>
        </div>
      </div>
    </div>
  `;

  bindEmpleadoEvents(empleado.id, saldo);
}

function bindAdminEvents() {
  document.querySelectorAll('.fid-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.fid-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.ftab;
      document.getElementById('fid-tab-aportes').style.display = target === 'admin-aportes' ? 'block' : 'none';
      document.getElementById('fid-tab-solicitudes').style.display = target === 'admin-solicitudes' ? 'block' : 'none';
    });
  });

  document.getElementById('fid-filter-year')?.addEventListener('change', renderAportesTable);
  document.getElementById('fid-filter-localidad')?.addEventListener('change', renderAportesTable);

  document.getElementById('fid-btn-upload')?.addEventListener('click', openUploadModal);
  document.getElementById('fid-btn-export')?.addEventListener('click', exportBanco);

  document.getElementById('fid-upload-close')?.addEventListener('click', closeUploadModal);
  document.getElementById('fid-upload-cancel')?.addEventListener('click', closeUploadModal);
  document.getElementById('fid-upload-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeUploadModal();
  });

  const fileInput = document.getElementById('fid-file-input');
  const dropZone = document.getElementById('fid-drop-zone');

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleExcelFile(e.target.files[0]);
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
    if (e.dataTransfer.files.length > 0) handleExcelFile(e.dataTransfer.files[0]);
  });

  document.getElementById('fid-upload-save')?.addEventListener('click', saveAportes);
}

function bindEmpleadoEvents(empleadoId, saldo) {
  document.getElementById('fid-btn-nueva-solicitud')?.addEventListener('click', () => {
    document.getElementById('fid-sol-monto').value = '';
    document.getElementById('fid-sol-motivo').value = '';
    document.getElementById('fid-sol-error').textContent = '';
    document.getElementById('fid-sol-monto').max = saldo;
    document.getElementById('fid-solicitud-modal').style.display = 'flex';
  });

  document.getElementById('fid-sol-close')?.addEventListener('click', () => {
    document.getElementById('fid-solicitud-modal').style.display = 'none';
  });
  document.getElementById('fid-sol-cancel')?.addEventListener('click', () => {
    document.getElementById('fid-solicitud-modal').style.display = 'none';
  });
  document.getElementById('fid-solicitud-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) document.getElementById('fid-solicitud-modal').style.display = 'none';
  });

  document.getElementById('fid-sol-save')?.addEventListener('click', async () => {
    const monto = parseFloat(document.getElementById('fid-sol-monto').value);
    const motivo = document.getElementById('fid-sol-motivo').value.trim();
    const errorEl = document.getElementById('fid-sol-error');

    if (!monto || monto <= 0) {
      errorEl.textContent = 'Ingresa un monto válido';
      return;
    }
    if (monto > saldo) {
      errorEl.textContent = 'El monto supera tu saldo disponible';
      return;
    }

    const btn = document.getElementById('fid-sol-save');
    btn.disabled = true;
    try {
      await store.addSolicitudFideicomiso({ empleado_id: empleadoId, monto_solicitado: monto, motivo });
      document.getElementById('fid-solicitud-modal').style.display = 'none';
      renderFideicomiso();
    } catch (err) {
      errorEl.textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  });
}

function openUploadModal() {
  uploadState = { file: null, data: null };
  document.getElementById('fid-file-input').value = '';
  document.getElementById('fid-upload-filename').textContent = '';
  document.getElementById('fid-upload-preview').style.display = 'none';
  document.getElementById('fid-upload-error').textContent = '';
  document.getElementById('fid-upload-save').disabled = true;
  document.getElementById('fid-upload-modal').style.display = 'flex';
}

function closeUploadModal() {
  document.getElementById('fid-upload-modal').style.display = 'none';
  uploadState = { file: null, data: null };
}

function handleExcelFile(file) {
  if (!file.name.match(/\.xlsx?|\.xls|\.csv$/i)) {
    document.getElementById('fid-upload-error').textContent = 'Formato no válido. Usa .xlsx, .xls o .csv';
    return;
  }

  document.getElementById('fid-upload-filename').textContent = file.name;
  uploadState.file = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const empleados = Array.isArray(store.state.empleados) ? store.state.empleados : [];
      const parsed = [];

      for (const row of rows) {
        const cedula = String(row.Cedula || row.cedula || row.CEDULA || '').trim();
        const nombre = String(row.Nombre || row.nombre || row.NOMBRE || '').trim();
        let emp = null;
        if (cedula) emp = empleados.find(e => String(e.cedula) === cedula);
        if (!emp && nombre) emp = empleados.find(e => `${e.nombre} ${e.apellido}`.toLowerCase() === nombre.toLowerCase());
        if (!emp) continue;

        parsed.push({
          empleado_id: emp.id,
          nombre: `${emp.nombre} ${emp.apellido}`,
          cedula: emp.cedula || '',
          Q1: parseFloat(row.Q1 || row.q1 || 0) || 0,
          Q2: parseFloat(row.Q2 || row.q2 || 0) || 0,
          Q3: parseFloat(row.Q3 || row.q3 || 0) || 0,
          Q4: parseFloat(row.Q4 || row.q4 || 0) || 0
        });
      }

      uploadState.data = parsed;

      const previewBody = document.getElementById('fid-preview-body');
      const previewCount = document.getElementById('fid-preview-count');
      previewCount.textContent = parsed.length;
      previewBody.innerHTML = parsed.slice(0, 20).map(r => `
        <tr>
          <td>${r.cedula}</td>
          <td>${r.nombre}</td>
          <td>${r.Q1 ? formatCurrency(r.Q1) : '—'}</td>
          <td>${r.Q2 ? formatCurrency(r.Q2) : '—'}</td>
          <td>${r.Q3 ? formatCurrency(r.Q3) : '—'}</td>
          <td>${r.Q4 ? formatCurrency(r.Q4) : '—'}</td>
        </tr>
      `).join('') + (parsed.length > 20 ? `<tr><td colspan="6" class="text-muted">... y ${parsed.length - 20} más</td></tr>` : '');

      document.getElementById('fid-upload-preview').style.display = 'block';
      document.getElementById('fid-upload-save').disabled = parsed.length === 0;
      document.getElementById('fid-upload-error').textContent = parsed.length === 0 ? 'No se encontraron empleados válidos en el archivo' : '';
    } catch (err) {
      document.getElementById('fid-upload-error').textContent = 'Error leyendo el archivo: ' + err.message;
    }
  };
  reader.readAsArrayBuffer(file);
}

async function saveAportes() {
  if (!uploadState.data || uploadState.data.length === 0) return;

  const year = new Date().getFullYear();
  const aportes = [];
  for (const row of uploadState.data) {
    for (const q of TRIMESTRES) {
      if (row[q] > 0) {
        aportes.push({ empleado_id: row.empleado_id, trimestre: q, anio: year, monto: row[q] });
      }
    }
  }

  const btn = document.getElementById('fid-upload-save');
  btn.disabled = true;
  btn.textContent = 'Guardando...';
  try {
    await store.batchUpsertAportes(aportes);
    closeUploadModal();
  } catch (err) {
    document.getElementById('fid-upload-error').textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar Aportes';
  }
}

function exportBanco() {
  const solicitudes = (Array.isArray(store.state.fideicomisoSolicitudes) ? store.state.fideicomisoSolicitudes : [])
    .filter(s => s.estado === 'aprobada');

  if (solicitudes.length === 0) {
    alert('No hay solicitudes aprobadas para exportar');
    return;
  }

  const rows = solicitudes.map(sol => {
    const emp = store.getEmpleadoById(sol.empleado_id);
    return {
      'Cedula': emp?.cedula || '',
      'Nombre': emp ? `${emp.nombre} ${emp.apellido}` : '',
      'Banco': emp?.banco || '',
      'Cuenta': emp?.cuenta_bancaria || '',
      'Monto': sol.monto_solicitado,
      'Motivo': sol.motivo || '',
      'Fecha Solicitud': sol.created_at,
      'Fecha Aprobacion': sol.processed_at || ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Fideicomiso');
  XLSX.writeFile(wb, `fideicomiso-banco-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function initFideicomiso() {
  pubsub.on(EVENT.FIDEICOMISO_UPDATED, () => {
    if (store.state.ui.currentView === 'fideicomiso') renderFideicomiso();
  });
  pubsub.on(EVENT.EMPLOYEES_UPDATED, () => {
    if (store.state.ui.currentView === 'fideicomiso') renderFideicomiso();
  });
}
