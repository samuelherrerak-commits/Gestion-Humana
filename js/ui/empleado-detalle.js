import { store } from '../engine/store.js';
import { formatDate, calcularEdad, calcularAntiguedad, formatCurrency, getInitials } from '../utils/format.js';
import { showView } from './app.js';

export function renderEmpleadoDetalle(empleadoId) {
  const container = document.getElementById('empleado-detalle-content');
  if (!container) return;

  const emp = store.getEmpleadoById(empleadoId);
  if (!emp) {
    container.innerHTML = `<div class="empty-state">
      <h3>Empleado no encontrado</h3>
      <p>Seleccione un empleado desde la lista</p>
      <button class="btn btn--primary mt-4" data-action="go-lista">Ver Empleados</button>
    </div>`;
    container.querySelector('[data-action="go-lista"]')?.addEventListener('click', () => showView('empleados'));
    return;
  }

  if (!store.hasRole('admin', 'gerente')) {
    const myEmp = store.getEmpleadoById(store.state.authUser?.empleado_id);
    if (!myEmp || emp.id !== myEmp.id) {
      container.innerHTML = `<div class="empty-state">
        <h3>Sin acceso</h3>
        <p>No tiene permiso para ver este empleado</p>
      </div>`;
      return;
    }
  }

  const isAdmin = store.hasRole('admin');

  const edad = calcularEdad(emp.fecha_nacimiento);
  const antiguedad = calcularAntiguedad(emp.fecha_ingreso);
  const diasDisponibles = emp.vacaciones_saldo || 0;
  const historial = store.getHistorialByEmpleado(emp.id);
  const documentos = store.getDocumentosByEmpleado(emp.id);
  const vacaciones = store.getVacacionesByEmpleado(emp.id);
  const constancias = store.getConstanciasByEmpleado(emp.id);

  container.innerHTML = `
    <div class="detail-header">
      <div class="avatar avatar--lg">
        ${emp.foto_url ? `<img src="${emp.foto_url}" alt="">` : getInitials(emp.nombre, emp.apellido)}
      </div>
      <div class="detail-header__info">
        <div class="detail-header__name">${emp.nombre} ${emp.apellido}</div>
        <div class="detail-header__meta">
          <span>C.I. ${emp.cedula}</span>
          <span>${emp.cargo || 'Sin cargo'}</span>
          <span class="badge badge--${emp.estatus === 'activo' ? 'active' : 'inactive'}">${emp.estatus === 'activo' ? 'Activo' : 'Inactivo'}</span>
        </div>
      </div>
      <div class="detail-header__actions">
        <button class="btn btn--ghost" data-action="back">← Volver</button>
      </div>
    </div>

    <div class="tabs" id="detalle-tabs">
      <button class="tabs__tab active" data-tab="info">Información</button>
      <button class="tabs__tab" data-tab="docs">Documentos (${documentos.length})</button>
      <button class="tabs__tab" data-tab="vac">Vacaciones</button>
      <button class="tabs__tab" data-tab="const">Constancias (${constancias.length})</button>
    </div>

    <div id="tab-content-info" class="tab-panel">
      <div class="panel">
        <div class="panel__header"><h2 class="panel__title">Datos Personales</h2></div>
        <div class="panel__body">
          <div class="form-row">
            <div><span class="form-label">Fecha de Nacimiento</span><p>${formatDate(emp.fecha_nacimiento)}${edad ? ` (${edad} años)` : ''}</p></div>
            <div><span class="form-label">Fecha de Ingreso</span><p>${formatDate(emp.fecha_ingreso)}${antiguedad ? ` (${antiguedad})` : ''}</p></div>
          </div>
          <div class="form-row mt-4">
            <div><span class="form-label">Departamento</span><p>${emp.departamento || '—'}</p></div>
            ${isAdmin ? `<div><span class="form-label">Salario</span><p>${formatCurrency(emp.salario)}</p></div>` : ''}
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel__header"><h2 class="panel__title">Saldo de Vacaciones</h2></div>
        <div class="panel__body">
          <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
            <div class="kpi-card"><div class="kpi-card__label">Saldo Actual</div><div class="kpi-card__value" style="color:var(--color-success)">${diasDisponibles} d\u00EDas</div></div>
            <div class="kpi-card"><div class="kpi-card__label">Correspondientes 25-26</div><div class="kpi-card__value" style="color:var(--color-info)">${emp.vacaciones_correspondientes || 0}</div></div>
            <div class="kpi-card"><div class="kpi-card__label">A\u00F1os de Servicio</div><div class="kpi-card__value">${calcularAntiguedad(emp.fecha_ingreso)}</div></div>
          </div>
        </div>
      </div>
      ${historial.length > 0 ? `
      <div class="panel">
        <div class="panel__header"><h2 class="panel__title">Hist\u00F3rico por Per\u00EDodo</h2></div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr><th>Per\u00EDodo</th><th>Correspondiente</th><th>Disfrutados</th><th>Pendientes</th></tr></thead>
            <tbody>${historial.map(h => `
              <tr>
                <td class="cell-primary">${h.periodo}</td>
                <td>${h.correspondiente}</td>
                <td>${h.disfrutados}</td>
                <td style="color:${h.pendientes > 0 ? 'var(--color-warning)' : 'var(--color-success)'};font-weight:var(--font-weight-semibold)">${h.pendientes}</td>
              </tr>
            `).join('')}</tbody>
          </table>
        </div>
      </div>` : ''}
    </div>

    <div id="tab-content-docs" class="tab-panel" style="display:none">
      ${documentos.length === 0 ? '<div class="empty-state"><p>No hay documentos registrados</p></div>' : `
      <div class="data-table-wrap"><table class="data-table">
        <thead><tr><th>Tipo</th><th>Nombre</th><th>Fecha Subida</th><th>Vencimiento</th><th></th></tr></thead>
        <tbody>${documentos.map(d => `
          <tr>
            <td><span class="badge badge--info">${d.tipo}</span></td>
            <td class="cell-primary">${d.nombre_archivo}</td>
            <td>${formatDate(d.fecha_subida)}</td>
            <td>${d.fecha_vencimiento ? formatDate(d.fecha_vencimiento) : '—'}</td>
            <td><button class="btn btn--ghost btn--sm" data-action="open-doc" data-url="${d.url}">Abrir</button></td>
          </tr>
        `).join('')}</tbody>
      </table></div>`}
    </div>

    <div id="tab-content-vac" class="tab-panel" style="display:none">
      <div class="kpi-card mb-4"><div class="kpi-card__label">Saldo disponible</div><div class="kpi-card__value" style="color:var(--color-success);font-size:var(--font-size-2xl)">${diasDisponibles} d\u00EDas</div></div>
      ${vacaciones.length === 0 ? '<div class="empty-state"><p>No hay solicitudes de vacaciones</p></div>' : `
      <div class="data-table-wrap"><table class="data-table">
        <thead><tr><th>Período</th><th>Días</th><th>Estatus</th><th>Solicitud</th></tr></thead>
        <tbody>${vacaciones.map(v => `
          <tr>
            <td class="cell-primary">${formatDate(v.fecha_inicio)} — ${formatDate(v.fecha_fin)}</td>
            <td>${v.dias_solicitados}</td>
            <td><span class="badge badge--${v.estatus === 'aprobado' ? 'active' : v.estatus === 'rechazado' ? 'danger' : 'warning'}">${v.estatus}</span></td>
            <td>${formatDate(v.fecha_solicitud)}</td>
          </tr>
        `).join('')}</tbody>
      </table></div>`}
    </div>

    <div id="tab-content-const" class="tab-panel" style="display:none">
      ${constancias.length === 0 ? '<div class="empty-state"><p>No hay constancias emitidas</p></div>' : `
      <div class="data-table-wrap"><table class="data-table">
        <thead><tr><th>Tipo</th><th>Fecha Emisión</th><th></th></tr></thead>
        <tbody>${constancias.map(c => `
          <tr>
            <td><span class="badge badge--info">${c.tipo}</span></td>
            <td>${formatDate(c.fecha_emision)}</td>
            <td><button class="btn btn--ghost btn--sm" data-action="view-const" data-id="${c.id}">Ver</button></td>
          </tr>
        `).join('')}</tbody>
      </table></div>`}
    </div>
  `;

  container.querySelector('[data-action="back"]')?.addEventListener('click', () => showView('empleados'));

  container.querySelectorAll('.tabs__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.tabs__tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      container.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
      document.getElementById(`tab-content-${tab.dataset.tab}`).style.display = 'block';
    });
  });

  container.querySelectorAll('[data-action="open-doc"]').forEach(btn => {
    btn.addEventListener('click', () => window.open(btn.dataset.url, '_blank'));
  });
}
