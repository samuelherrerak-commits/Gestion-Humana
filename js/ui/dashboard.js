import { store } from '../engine/store.js';
import { pubsub } from '../utils/pubsub.js';
import { EVENT, getDepartamentosFromStore, TIPOS_CONSTANCIA_LABELS, ESTATUS_VACACION_LABELS, ESTATUS_VACACION_COLORS } from '../constants.js';
import { showView } from './app.js';
import { formatDate } from '../utils/format.js';
import { aprobarVacacion } from './vacaciones.js';
import { generarConstanciaPDF } from './constancia-pdf.js';

export function renderDashboard() {
  const old = document.getElementById('dash-extra');
  if (old) old.remove();

  const isAdmin = store.hasRole('admin');
  const isGerente = store.hasRole('gerente');

  if (isAdmin) {
    renderAdminDashboard();
  } else if (isGerente) {
    renderGerenteDashboard();
  } else {
    renderEmployeeDashboard();
  }
}

function renderAdminDashboard() {
  const empleados = Array.isArray(store.state.empleados) ? store.state.empleados : [];
  const activos = empleados.filter(e => e.estatus === 'activo');
  const inactivos = empleados.filter(e => e.estatus === 'inactivo');
  const vacacionesPendientes = Array.isArray(store.state.vacaciones) ? store.state.vacaciones.filter(v => v.estatus === 'pendiente_jefe') : [];
  const constanciasEmitidas = Array.isArray(store.state.constancias) ? store.state.constancias : [];

  const totalDiasPendientes = activos.reduce((sum, e) => sum + (e.vacaciones_saldo || 0), 0);
  const empleadosConSaldo = activos.filter(e => (e.vacaciones_saldo || 0) > 0).length;

  const kpiGrid = document.getElementById('kpi-grid');
  if (kpiGrid) {
    kpiGrid.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Total Empleados</span>
          <span class="kpi-card__badge">\u{1F465}</span>
        </div>
        <div class="kpi-card__value">${empleados.length}</div>
        <div class="kpi-card__footer">${activos.length} activos \u00B7 ${inactivos.length} inactivos</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__header">
          <span class="kpi-card__label">D\u00EDas Vacaciones Pendientes</span>
          <span class="kpi-card__badge">\u{2600}</span>
        </div>
        <div class="kpi-card__value" style="color:var(--color-warning)">${totalDiasPendientes}</div>
        <div class="kpi-card__footer">${empleadosConSaldo} empleados con saldo \u00B7 ${vacacionesPendientes.length} solicitudes por resolver</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Empleados Activos</span>
          <span class="kpi-card__badge">\u{2705}</span>
        </div>
        <div class="kpi-card__value" style="color:var(--color-success)">${activos.length}</div>
        <div class="kpi-card__bar">
          <div class="kpi-card__bar-fill" style="width:${empleados.length ? Math.round(activos.length/empleados.length*100) : 0}%;background:var(--color-success)"></div>
        </div>
        <div class="kpi-card__footer">${empleados.length ? Math.round(activos.length/empleados.length*100) : 0}% del total</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Constancias Emitidas</span>
          <span class="kpi-card__badge">\u{1F4C4}</span>
        </div>
        <div class="kpi-card__value">${constanciasEmitidas.length}</div>
        <div class="kpi-card__footer">Documentos generados</div>
      </div>
    `;
  }

  renderQuickAccessAdmin();
  renderDepartamentoChart();
}

function renderGerenteDashboard() {
  const empId = store.state.authUser?.empleado_id;
  const emp = store.getEmpleadoById(empId);
  if (!emp) return;

  const equipo = store.getEmpleadosByGerente(empId);
  const equipoIds = equipo.map(e => e.id);
  const allVacaciones = Array.isArray(store.state.vacaciones) ? store.state.vacaciones : [];
  const equipoVacPendientes = allVacaciones.filter(v => equipoIds.includes(v.empleado_id) && v.estatus === 'pendiente_jefe');
  const constancias = Array.isArray(store.state.constancias) ? store.state.constancias : [];
  const misConstancias = constancias.filter(c => c.empleado_id === empId);
  const misVacaciones = allVacaciones.filter(v => v.empleado_id === empId);
  const saldo = emp.vacaciones_saldo || 0;

  const kpiGrid = document.getElementById('kpi-grid');
  if (kpiGrid) {
    kpiGrid.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Mi Saldo Vacaciones</span>
          <span class="kpi-card__badge">\u{2600}</span>
        </div>
        <div class="kpi-card__value" style="color:${saldo > 15 ? 'var(--color-warning)' : 'var(--color-success)'}">${saldo} d\u00EDas</div>
        <div class="kpi-card__footer">${emp.vacaciones_correspondientes || 0} correspondientes \u00B7 ${emp.vacaciones_disfrutadas || 0} disfrutados</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Solicitudes Equipo</span>
          <span class="kpi-card__badge">\u{1F4CB}</span>
        </div>
        <div class="kpi-card__value" style="color:var(--color-warning)">${equipoVacPendientes.length}</div>
        <div class="kpi-card__footer">${equipo.length} miembros \u00B7 pendientes por aprobar</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Mis Constancias</span>
          <span class="kpi-card__badge">\u{1F4C4}</span>
        </div>
        <div class="kpi-card__value">${misConstancias.length}</div>
        <div class="kpi-card__footer">Documentos emitidos</div>
      </div>
    `;
  }

  renderAccesoRapidoNoAdmin();

  let secciones = '';

  if (equipoVacPendientes.length > 0) {
    secciones += `
    <div class="panel" style="margin-top:var(--space-4)">
      <div class="panel__header"><h2 class="panel__title">Solicitudes Pendientes de Mi Equipo</h2></div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Empleado</th><th>D\u00EDas</th><th>Estatus</th><th>Acciones</th></tr></thead>
          <tbody>
            ${equipoVacPendientes.map(v => {
              const vEmp = store.getEmpleadoById(v.empleado_id);
              return `<tr data-vac-id="${v.id}">
                <td class="cell-primary">${vEmp ? vEmp.nombre + ' ' + vEmp.apellido : '—'}</td>
                <td>${v.dias_solicitados} d\u00EDas</td>
                <td><span class="badge badge--${ESTATUS_VACACION_COLORS[v.estatus] || 'info'}">${ESTATUS_VACACION_LABELS[v.estatus] || v.estatus}</span></td>
                <td>
                  <button class="btn btn--success btn--sm btn-ger-approve" data-id="${v.id}">Aprobar</button>
                  <button class="btn btn--danger btn--sm btn-ger-reject" data-id="${v.id}">Rechazar</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  if (misVacaciones.length > 0) {
    const ultimas = misVacaciones.slice(0, 5);
    secciones += `
    <div class="panel" style="margin-top:var(--space-4)">
      <div class="panel__header"><h2 class="panel__title">Mis \u00DAltimas Solicitudes</h2></div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Per\u00EDodo</th><th>D\u00EDas</th><th>Estatus</th><th>Fecha</th></tr></thead>
          <tbody>
            ${ultimas.map(v => `<tr>
              <td class="cell-primary">${v.periodo || formatDate(v.fecha_inicio)}</td>
              <td>${v.dias_solicitados} d\u00EDas</td>
              <td><span class="badge badge--${ESTATUS_VACACION_COLORS[v.estatus] || 'info'}">${ESTATUS_VACACION_LABELS[v.estatus] || v.estatus}</span></td>
              <td>${formatDate(v.fecha_solicitud)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  if (misConstancias.length > 0) {
    const ultimasConst = misConstancias.slice(0, 5);
    secciones += `
    <div class="panel" style="margin-top:var(--space-4)">
      <div class="panel__header"><h2 class="panel__title">Mis Constancias</h2></div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Tipo</th><th>Fecha</th><th>Acciones</th></tr></thead>
          <tbody>
            ${ultimasConst.map(c => `<tr>
              <td class="cell-primary">${TIPOS_CONSTANCIA_LABELS[c.tipo] || c.tipo}</td>
              <td>${formatDate(c.fecha_emision)}</td>
              <td><button class="btn btn--ghost btn--sm btn-dash-const-pdf" data-id="${c.id}">\u{1F4E5} PDF</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  const quickAccess = document.getElementById('quick-access');
  if (quickAccess) quickAccess.insertAdjacentHTML('afterend', `<div id="dash-extra">${secciones}</div>`);

  const dashExtra = document.getElementById('dash-extra');

  if (dashExtra) {
    dashExtra.querySelectorAll('.btn-ger-approve').forEach(btn => {
      btn.addEventListener('click', async () => {
        await aprobarVacacion(parseInt(btn.dataset.id));
        renderDashboard();
      });
    });
    dashExtra.querySelectorAll('.btn-ger-reject').forEach(btn => {
      btn.addEventListener('click', async () => {
        await store.updateVacacion(parseInt(btn.dataset.id), { estatus: 'rechazado' });
      });
    });
    dashExtra.querySelectorAll('.btn-dash-const-pdf').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = (Array.isArray(store.state.constancias) ? store.state.constancias : []).find(x => x.id === parseInt(btn.dataset.id));
        if (c) {
          const emp = store.getEmpleadoById(c.empleado_id);
          const opciones = {};
          if (c.tipo === 'vacaciones' && emp) {
            const historial = store.getHistorialByEmpleado(c.empleado_id);
            const periodosPendientes = historial.filter(h => h.pendientes > 0).map(h => ({ periodo: h.periodo, dias: h.pendientes }));
            opciones.fecha_inicio = c.fecha_inicio;
            opciones.fecha_fin = c.fecha_fin;
            opciones.dias_solicitados = c.dias_solicitados;
            opciones.condicion = c.condicion;
            opciones.periodosPendientes = periodosPendientes;
            opciones.totalPendientes = periodosPendientes.reduce((s, p) => s + p.dias, 0);
          }
          generarConstanciaPDF(c, emp, opciones);
        }
      });
    });
  }

  renderDepartamentoChart();
}

function renderEmployeeDashboard() {
  const empId = store.state.authUser?.empleado_id;
  const emp = store.getEmpleadoById(empId);
  if (!emp) return;

  const allVacaciones = Array.isArray(store.state.vacaciones) ? store.state.vacaciones : [];
  const misVacaciones = allVacaciones.filter(v => v.empleado_id === empId);
  const constancias = Array.isArray(store.state.constancias) ? store.state.constancias : [];
  const misConstancias = constancias.filter(c => c.empleado_id === empId);
  const saldo = emp.vacaciones_saldo || 0;

  const kpiGrid = document.getElementById('kpi-grid');
  if (kpiGrid) {
    kpiGrid.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Mi Saldo Vacaciones</span>
          <span class="kpi-card__badge">\u{2600}</span>
        </div>
        <div class="kpi-card__value" style="color:${saldo > 15 ? 'var(--color-warning)' : 'var(--color-success)'}">${saldo} d\u00EDas</div>
        <div class="kpi-card__footer">${emp.vacaciones_correspondientes || 0} correspondientes \u00B7 ${emp.vacaciones_disfrutadas || 0} disfrutados</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Mis Solicitudes</span>
          <span class="kpi-card__badge">\u{1F4CB}</span>
        </div>
        <div class="kpi-card__value">${misVacaciones.length}</div>
        <div class="kpi-card__footer">${misVacaciones.filter(v => v.estatus === 'pendiente_jefe').length} pendientes</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__header">
          <span class="kpi-card__label">Mis Constancias</span>
          <span class="kpi-card__badge">\u{1F4C4}</span>
        </div>
        <div class="kpi-card__value">${misConstancias.length}</div>
        <div class="kpi-card__footer">Documentos emitidos</div>
      </div>
    `;
  }

  renderAccesoRapidoNoAdmin();

  let secciones = '';

  if (misVacaciones.length > 0) {
    const ultimas = misVacaciones.slice(0, 5);
    secciones += `
    <div class="panel" style="margin-top:var(--space-4)">
      <div class="panel__header"><h2 class="panel__title">Mis \u00DAltimas Solicitudes</h2></div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Per\u00EDodo</th><th>D\u00EDas</th><th>Estatus</th><th>Fecha</th></tr></thead>
          <tbody>
            ${ultimas.map(v => `<tr>
              <td class="cell-primary">${v.periodo || formatDate(v.fecha_inicio)}</td>
              <td>${v.dias_solicitados} d\u00EDas</td>
              <td><span class="badge badge--${ESTATUS_VACACION_COLORS[v.estatus] || 'info'}">${ESTATUS_VACACION_LABELS[v.estatus] || v.estatus}</span></td>
              <td>${formatDate(v.fecha_solicitud)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  if (misConstancias.length > 0) {
    const ultimasConst = misConstancias.slice(0, 5);
    secciones += `
    <div class="panel" style="margin-top:var(--space-4)">
      <div class="panel__header"><h2 class="panel__title">Mis Constancias</h2></div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Tipo</th><th>Fecha</th><th>Acciones</th></tr></thead>
          <tbody>
            ${ultimasConst.map(c => `<tr>
              <td class="cell-primary">${TIPOS_CONSTANCIA_LABELS[c.tipo] || c.tipo}</td>
              <td>${formatDate(c.fecha_emision)}</td>
              <td><button class="btn btn--ghost btn--sm btn-dash-const-pdf" data-id="${c.id}">\u{1F4E5} PDF</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  const quickAccess = document.getElementById('quick-access');
  if (quickAccess) quickAccess.insertAdjacentHTML('afterend', `<div id="dash-extra">${secciones}</div>`);

  const dashExtra = document.getElementById('dash-extra');
  if (dashExtra) {
    dashExtra.querySelectorAll('.btn-dash-const-pdf').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = (Array.isArray(store.state.constancias) ? store.state.constancias : []).find(x => x.id === parseInt(btn.dataset.id));
        if (c) {
          const emp = store.getEmpleadoById(c.empleado_id);
          const opciones = {};
          if (c.tipo === 'vacaciones' && emp) {
            const historial = store.getHistorialByEmpleado(c.empleado_id);
            const periodosPendientes = historial.filter(h => h.pendientes > 0).map(h => ({ periodo: h.periodo, dias: h.pendientes }));
            opciones.fecha_inicio = c.fecha_inicio;
            opciones.fecha_fin = c.fecha_fin;
            opciones.dias_solicitados = c.dias_solicitados;
            opciones.condicion = c.condicion;
            opciones.periodosPendientes = periodosPendientes;
            opciones.totalPendientes = periodosPendientes.reduce((s, p) => s + p.dias, 0);
          }
          generarConstanciaPDF(c, emp, opciones);
        }
      });
    });
  }
}

function renderAccesoRapidoNoAdmin() {
  const container = document.getElementById('quick-access');
  if (!container) return;

  const modulos = [
    { id: 'vacaciones', icon: '\u{2600}', title: 'Vacaciones', desc: 'Mi saldo y solicitudes', bg: '#FEF3C7', color: '#D97706' },
    { id: 'fideicomiso', icon: '\u{1F4B0}', title: 'Fideicomiso', desc: 'Mis aportes', bg: '#EDE9FE', color: '#7C3AED' },
    { id: 'solicitar-constancia', icon: '\u{1F4DD}', title: 'Solicitar Constancia', desc: 'Constancia de trabajo', bg: '#E0F2FE', color: '#0284C7', action: 'solicitar-constancia' }
  ];

  container.innerHTML = `<h3 style="font-size:var(--font-size-base);font-weight:var(--font-weight-semibold);margin-bottom:var(--space-4);color:var(--color-text)">Acceso R\u00E1pido</h3>
    <div class="quick-grid">${modulos.map(m => `
      <div class="quick-card" data-navigate="${m.id}" ${m.action ? `data-action="${m.action}"` : ''}>
        <div class="quick-card__icon" style="background:${m.bg};color:${m.color}">${m.icon}</div>
        <div class="quick-card__title">${m.title}</div>
        <div class="quick-card__desc">${m.desc}</div>
      </div>
    `).join('')}</div>`;

  container.querySelectorAll('[data-navigate]').forEach(card => {
    card.addEventListener('click', () => {
      if (card.dataset.action === 'solicitar-constancia') {
        import('./constancias.js').then(m => m.openSolicitarConstanciaModal());
        return;
      }
      showView(card.dataset.navigate);
    });
  });
}

function renderQuickAccessAdmin() {
  const container = document.getElementById('quick-access');
  if (!container) return;

  const modulos = [
    { id: 'empleados', icon: '\u{1F465}', title: 'Empleados', desc: 'Gestionar personal', bg: '#DBEAFE', color: '#1D4ED8' },
    { id: 'expedientes', icon: '\u{1F4C1}', title: 'Expedientes', desc: 'Documentos digitales', bg: '#D1FAE5', color: '#059669' },
    { id: 'vacaciones', icon: '\u{2600}', title: 'Vacaciones', desc: 'Solicitudes y saldos', bg: '#FEF3C7', color: '#D97706' },
    { id: 'constancias', icon: '\u{1F4DD}', title: 'Constancias', desc: 'Generar documentos', bg: '#E0F2FE', color: '#0284C7' },
    { id: 'auditoria-modulos', icon: '\u{1F50D}', title: 'Auditor\u00EDa', desc: 'Cumplimiento legal', bg: '#FEE2E2', color: '#DC2626' }
  ];

  container.innerHTML = `<h3 style="font-size:var(--font-size-base);font-weight:var(--font-weight-semibold);margin-bottom:var(--space-4);color:var(--color-text)">Acceso R\u00E1pido</h3>
    <div class="quick-grid">${modulos.map(m => `
      <div class="quick-card" data-navigate="${m.id}">
        <div class="quick-card__icon" style="background:${m.bg};color:${m.color}">${m.icon}</div>
        <div class="quick-card__title">${m.title}</div>
        <div class="quick-card__desc">${m.desc}</div>
      </div>
    `).join('')}</div>`;

  container.querySelectorAll('[data-navigate]').forEach(card => {
    card.addEventListener('click', () => {
      showView(card.dataset.navigate);
    });
  });
}

function renderDepartamentoChart() {
  const container = document.getElementById('dept-chart');
  if (!container) return;

  const empleados = Array.isArray(store.state.empleados) ? store.state.empleados : [];
  const departamentos = getDepartamentosFromStore(empleados);
  const counts = {};
  departamentos.forEach(d => { counts[d] = 0; });
  empleados.forEach(e => {
    if (e.departamento && counts[e.departamento] !== undefined) {
      counts[e.departamento]++;
    }
  });

  const entries = Object.entries(counts).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const max = entries.length > 0 ? entries[0][1] : 1;

  if (entries.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:var(--space-6)">
      <p class="text-muted">No hay empleados registrados para mostrar distribuci\u00F3n por departamento</p>
    </div>`;
    return;
  }

  container.innerHTML = `<h3 style="font-size:var(--font-size-base);font-weight:var(--font-weight-semibold);margin-bottom:var(--space-4);color:var(--color-text)">Distribuci\u00F3n por Departamento</h3>
    <div class="panel__body" style="padding-top:0">
      ${entries.map(([dept, count]) => `
        <div class="modulo-bar-item">
          <span class="modulo-bar-item__label">${dept}</span>
          <div class="modulo-bar-item__track">
            <div class="modulo-bar-item__fill" style="width:${Math.round(count/max*100)}%;background:var(--color-blue-600)"></div>
          </div>
          <span class="modulo-bar-item__pct" style="color:var(--color-blue-600)">${count}</span>
        </div>
      `).join('')}
    </div>`;
}
