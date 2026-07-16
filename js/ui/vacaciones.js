import { store } from '../engine/store.js';
import { pubsub } from '../utils/pubsub.js';
import { EVENT, ESTATUS_VACACION, ESTATUS_VACACION_LABELS, ESTATUS_VACACION_COLORS } from '../constants.js';
import { formatDate, calcularAntiguedad } from '../utils/format.js';
import { calcularDiasHabiles, calcularAniosServicio } from '../engine/vacaciones-calc.js';

let activeTab = 'saldo';
let selectedEmpleadoId = null;
let solicitudEmpleadoId = null;
let vacFilterEstatus = '';

export function renderVacaciones() {
  if (activeTab === 'saldo') renderSaldosTab();
  else renderSolicitudesTab();
}

/* ══════════════════════════════════════════════════════════════
   TAB: DÍAS PENDIENTES (Estado de Cuenta)
   ══════════════════════════════════════════════════════════════ */

function renderSaldosTab() {
  const emptyState = document.getElementById('vac-saldo-empty');
  const estadoCuenta = document.getElementById('vac-estado-cuenta');
  const searchResults = document.getElementById('vac-search-results');

  if (!selectedEmpleadoId) {
    if (emptyState) emptyState.style.display = 'block';
    if (estadoCuenta) estadoCuenta.style.display = 'none';
    if (searchResults) searchResults.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (searchResults) searchResults.style.display = 'none';
  renderEstadoCuenta(selectedEmpleadoId);
}

function renderEstadoCuenta(empleadoId) {
  const container = document.getElementById('vac-estado-cuenta');
  if (!container) return;

  const emp = store.getEmpleadoById(empleadoId);
  if (!emp) { container.style.display = 'none'; return; }

  const historial = store.getHistorialByEmpleado(empleadoId);
  const saldo = emp.vacaciones_saldo || 0;
  const saldoColor = saldo > 30 ? 'var(--color-danger)' : saldo > 15 ? 'var(--color-warning)' : 'var(--color-success)';

  container.style.display = 'block';
  container.innerHTML = `
    <div class="panel">
      <div class="panel__header">
        <h2 class="panel__title">Estado de Cuenta de Vacaciones</h2>
        <div style="display:flex;gap:var(--space-2)">
          ${store.hasRole('admin') ? '<button class="btn btn--warning btn--sm" id="vac-registrar-uso">Registrar Uso</button>' : ''}
          <button class="btn btn--ghost btn--sm" id="vac-clear-search">Cambiar empleado</button>
        </div>
      </div>
      <div class="panel__body">
        <div class="vac-ec-header">
          <div class="avatar avatar--lg">
            ${emp.foto_url ? `<img src="${emp.foto_url}" alt="">` : (emp.nombre?.[0] || '') + (emp.apellido?.[0] || '')}
          </div>
          <div class="vac-ec-info">
            <div class="vac-ec-name">${emp.nombre} ${emp.apellido}</div>
            <div class="vac-ec-meta">
              <span>C.I. ${emp.cedula || '\u2014'}</span>
              <span>${emp.empresa_id === 1 ? 'Prosein C.A.' : emp.empresa_id === 2 ? 'Austral Import' : '\u2014'}</span>
              <span>Ingreso: ${formatDate(emp.fecha_ingreso)}</span>
              <span>${calcularAntiguedad(emp.fecha_ingreso)}</span>
            </div>
          </div>
        </div>

        <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-top:var(--space-5)">
          <div class="kpi-card">
            <div class="kpi-card__header">
              <span class="kpi-card__label">Saldo Actual</span>
              <span class="kpi-card__badge">\u2600</span>
            </div>
            <div class="kpi-card__value" style="color:${saldoColor}">${saldo}</div>
            <div class="kpi-card__footer">d\u00EDas pendientes</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-card__header">
              <span class="kpi-card__label">Correspondientes</span>
              <span class="kpi-card__badge">\u{1F4CB}</span>
            </div>
            <div class="kpi-card__value">${emp.vacaciones_correspondientes || 0}</div>
            <div class="kpi-card__footer">d\u00EDas del per\u00EDodo</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-card__header">
              <span class="kpi-card__label">Disfrutados</span>
              <span class="kpi-card__badge">\u{2705}</span>
            </div>
            <div class="kpi-card__value">${emp.vacaciones_disfrutadas || 0}</div>
            <div class="kpi-card__footer">d\u00EDas tomados</div>
          </div>
        </div>

        ${historial.length > 0 ? `
        <div style="margin-top:var(--space-5)">
          <h3 style="font-size:var(--font-size-base);font-weight:var(--font-weight-semibold);margin-bottom:var(--space-3);color:var(--color-text)">Hist\u00F3rico por Per\u00EDodo</h3>
          <div class="data-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Per\u00EDodo</th>
                  <th>Correspondiente</th>
                  <th>Disfrutados</th>
                  <th>Pendientes</th>
                  <th>% Uso</th>
                </tr>
              </thead>
              <tbody>
                ${historial.map(h => {
                  const pct = h.correspondiente > 0 ? Math.round(h.disfrutados / h.correspondiente * 100) : 0;
                  return `<tr>
                    <td class="cell-primary">${h.periodo}</td>
                    <td>${h.correspondiente} d\u00EDas</td>
                    <td>${h.disfrutados} d\u00EDas</td>
                    <td style="color:${h.pendientes > 0 ? 'var(--color-warning)' : 'var(--color-success)'};font-weight:var(--font-weight-semibold)">${h.pendientes} d\u00EDas</td>
                    <td>
                      <div class="kpi-card__bar" style="width:100px;display:inline-block;vertical-align:middle">
                        <div class="kpi-card__bar-fill" style="width:${pct}%;background:${pct > 80 ? 'var(--color-success)' : pct > 50 ? 'var(--color-warning)' : 'var(--color-danger)'}"></div>
                      </div>
                      <span style="margin-left:var(--space-2);font-size:var(--font-size-sm);color:var(--color-text-secondary)">${pct}%</span>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>` : '<p style="margin-top:var(--space-4);color:var(--color-text-muted);font-size:var(--font-size-sm)">No hay hist\u00F3rico de vacaciones para este empleado</p>'}
      </div>
    </div>`;

  document.getElementById('vac-clear-search')?.addEventListener('click', () => {
    selectedEmpleadoId = null;
    document.getElementById('vac-search-empleado').value = '';
    renderSaldosTab();
  });

  document.getElementById('vac-registrar-uso')?.addEventListener('click', () => {
    if (store.hasRole('admin')) openUsoModal(empleadoId);
  });
}

/* ══════════════════════════════════════════════════════════════
   TAB: SOLICITUDES (Con cadena de aprobación)
   ══════════════════════════════════════════════════════════════ */

function renderSolicitudesTab() {
  const container = document.getElementById('vacaciones-table-body');
  const emptyState = document.getElementById('vacaciones-empty');
  if (!container) return;

  let vacaciones = [...(Array.isArray(store.state.vacaciones) ? store.state.vacaciones : [])];

  if (!store.hasRole('admin')) {
    const authEmpId = store.state.authUser?.empleado_id;
    if (store.hasRole('gerente')) {
      const equipoIds = store.getEmpleadosByGerente(authEmpId).map(e => e.id);
      vacaciones = vacaciones.filter(v => v.empleado_id === authEmpId || equipoIds.includes(v.empleado_id));
    } else {
      vacaciones = vacaciones.filter(v => v.empleado_id === authEmpId);
    }
  }

  if (vacFilterEstatus) {
    vacaciones = vacaciones.filter(v => v.estatus === vacFilterEstatus);
  }

  vacaciones.sort((a, b) => b.id - a.id);

  if (vacaciones.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = vacaciones.map(v => {
    const emp = store.getEmpleadoById(v.empleado_id);
    const diasPago = v.dias_correspondientes || v.dias_solicitados || 0;
    const acciones = getVacacionesAcciones(v);
    return `
    <tr data-id="${v.id}">
      <td class="cell-primary">${emp ? emp.nombre + ' ' + emp.apellido : '\u2014'}</td>
      <td>${v.periodo || formatDate(v.fecha_inicio) + ' \u2014 ' + formatDate(v.fecha_fin)}</td>
      <td>${v.dias_solicitados} d\u00EDas</td>
      <td>${diasPago} d\u00EDas</td>
      <td><span class="badge badge--${ESTATUS_VACACION_COLORS[v.estatus] || 'info'}">${ESTATUS_VACACION_LABELS[v.estatus] || v.estatus}</span></td>
      <td>${formatDate(v.fecha_solicitud)}</td>
      <td>${acciones}</td>
    </tr>`;
  }).join('');

  container.querySelectorAll('.btn-vac-approve-jefe').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await store.updateVacacion(parseInt(btn.dataset.id), { estatus: 'aprobado_jefe' });
    });
  });

  container.querySelectorAll('.btn-vac-confirmar-pago').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await confirmarPago(parseInt(btn.dataset.id));
    });
  });

  container.querySelectorAll('.btn-vac-reject').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await store.updateVacacion(parseInt(btn.dataset.id), { estatus: 'rechazado' });
    });
  });

  renderCalendar();
  renderHistorial();
}

function getVacacionesAcciones(v) {
  const isAdmin = store.hasRole('admin');
  const isGerente = store.hasRole('gerente');
  const authEmpId = store.state.authUser?.empleado_id;
  const esMio = v.empleado_id === authEmpId;
  const equipoIds = isGerente ? store.getEmpleadosByGerente(authEmpId).map(e => e.id) : [];
  const esDelEquipo = equipoIds.includes(v.empleado_id);

  switch (v.estatus) {
    case 'pendiente_jefe':
      if (isAdmin) return `
        <button class="btn btn--success btn--sm btn-vac-approve-jefe" data-id="${v.id}">Aprobar Jefe</button>
        <button class="btn btn--danger btn--sm btn-vac-reject" data-id="${v.id}">Rechazar</button>`;
      if (isGerente && esDelEquipo && !esMio) return `
        <button class="btn btn--success btn--sm btn-vac-approve-jefe" data-id="${v.id}">Aprobar Jefe</button>
        <button class="btn btn--danger btn--sm btn-vac-reject" data-id="${v.id}">Rechazar</button>`;
      return '<span style="font-size:var(--font-size-xs);color:var(--color-text-muted)">Pendiente</span>';
    case 'aprobado_jefe':
      return isAdmin ? `
        <button class="btn btn--primary btn--sm btn-vac-confirmar-pago" data-id="${v.id}">Confirmar Pago</button>
        <button class="btn btn--danger btn--sm btn-vac-reject" data-id="${v.id}">Rechazar</button>` : '<span style="font-size:var(--font-size-xs);color:var(--color-text-muted)">Aprobado jefe</span>';
    case 'aprobado_rrhh':
      return `<span style="font-size:var(--font-size-xs);color:var(--color-text-muted)">Esperando confirmaci\u00F3n RRHH</span>`;
    case 'aprobado':
      return `<span style="font-size:var(--font-size-xs);color:var(--color-success)">Completado</span>`;
    case 'rechazado':
      return `<span style="font-size:var(--font-size-xs);color:var(--color-danger)">Rechazado</span>`;
    default:
      return '';
  }
}

async function confirmarPago(vacacionId) {
  const vac = (Array.isArray(store.state.vacaciones) ? store.state.vacaciones : []).find(v => v.id === vacacionId);
  if (!vac) return;

  try {
    await store.updateVacacion(vacacionId, { estatus: 'aprobado' });

    const historial = store.getHistorialByEmpleado(vac.empleado_id)
      .find(h => h.periodo === vac.periodo);
    if (historial) {
      const nuevosDisfrutados = (historial.disfrutados || 0) + (vac.dias_solicitados || 0);
      const nuevosPendientes = (historial.correspondiente || 0) - nuevosDisfrutados;
      await store.updateHistorialRecord(historial.id, {
        disfrutados: nuevosDisfrutados,
        pendientes: Math.max(0, nuevosPendientes)
      });
    }

    const emp = store.getEmpleadoById(vac.empleado_id);
    if (emp) {
      const nuevoSaldo = (emp.vacaciones_saldo || 0) - (vac.dias_solicitados || 0);
      const nuevoDisfrutadas = (emp.vacaciones_disfrutadas || 0) + (vac.dias_solicitados || 0);
      await store.updateEmpleadoSaldo(emp.id, Math.max(0, nuevoSaldo), emp.vacaciones_correspondientes, nuevoDisfrutadas);
    }
  } catch (err) {
    console.error('[Vacaciones] Error confirmando pago:', err);
  }
}

function renderHistorial() {
  const container = document.getElementById('vac-historial-content');
  if (!container) return;

  const historial = Array.isArray(store.state.vacacionesHistorial) ? store.state.vacacionesHistorial : [];
  if (historial.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding:var(--space-4)"><p class="text-muted">No hay datos hist\u00F3ricos de vacaciones</p></div>';
    return;
  }

  const periodos = [...new Set(historial.map(h => h.periodo))].sort();
  const byPeriodo = {};
  historial.forEach(h => {
    if (!byPeriodo[h.periodo]) byPeriodo[h.periodo] = { correspondiente: 0, disfrutados: 0, pendientes: 0, count: 0 };
    byPeriodo[h.periodo].correspondiente += h.correspondiente || 0;
    byPeriodo[h.periodo].disfrutados += h.disfrutados || 0;
    byPeriodo[h.periodo].pendientes += h.pendientes || 0;
    byPeriodo[h.periodo].count++;
  });

  container.innerHTML = `
    <div class="data-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Per\u00EDodo</th>
            <th>Empleados</th>
            <th>Correspondientes</th>
            <th>Disfrutados</th>
            <th>Pendientes</th>
            <th>% Uso</th>
          </tr>
        </thead>
        <tbody>
          ${periodos.map(p => {
            const d = byPeriodo[p];
            const pct = d.correspondiente > 0 ? Math.round(d.disfrutados / d.correspondiente * 100) : 0;
            return `<tr>
              <td class="cell-primary">${p}</td>
              <td>${d.count}</td>
              <td>${d.correspondiente} d\u00EDas</td>
              <td>${d.disfrutados} d\u00EDas</td>
              <td style="color:${d.pendientes > 0 ? 'var(--color-warning)' : 'var(--color-success)'};font-weight:var(--font-weight-semibold)">${d.pendientes} d\u00EDas</td>
              <td>
                <div class="kpi-card__bar" style="width:120px;display:inline-block;vertical-align:middle">
                  <div class="kpi-card__bar-fill" style="width:${pct}%;background:${pct > 80 ? 'var(--color-success)' : pct > 50 ? 'var(--color-warning)' : 'var(--color-danger)'}"></div>
                </div>
                <span style="margin-left:var(--space-2);font-size:var(--font-size-sm);color:var(--color-text-secondary)">${pct}%</span>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderCalendar() {
  const calContainer = document.getElementById('vac-calendar');
  if (!calContainer) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  const firstDay = new Date(year, month, 1);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const ausencias = new Set();
  (Array.isArray(store.state.vacaciones) ? store.state.vacaciones : []).filter(v => v.estatus === 'aprobado').forEach(v => {
    const inicio = new Date(v.fecha_inicio);
    const fin = new Date(v.fecha_fin);
    const current = new Date(Math.max(inicio.getTime(), new Date(year, month, 1).getTime()));
    const end = new Date(Math.min(fin.getTime(), new Date(year, month + 1, 0).getTime()));
    while (current <= end) {
      if (current.getMonth() === month) ausencias.add(current.getDate());
      current.setDate(current.getDate() + 1);
    }
  });

  let html = `<div class="calendar-mini">
    <div class="calendar-mini__header">
      <button class="btn btn--ghost btn--sm" data-cal="prev">\u25C0</button>
      <span class="calendar-mini__title">${monthNames[month]} ${year}</span>
      <button class="btn btn--ghost btn--sm" data-cal="next">\u25B6</button>
    </div>
    <div class="calendar-mini__grid">
      ${dayNames.map(d => `<div class="calendar-mini__day-name">${d}</div>`).join('')}
      ${Array(startDay).fill('').map(() => '<div class="calendar-mini__day calendar-mini__day--empty"></div>').join('')}
      ${Array.from({length: daysInMonth}, (_, i) => i + 1).map(d => {
        const isToday = d === today.getDate();
        const isAbsent = ausencias.has(d);
        return `<div class="calendar-mini__day${isToday ? ' calendar-mini__day--today' : ''}${isAbsent ? ' calendar-mini__day--absent' : ''}">${d}</div>`;
      }).join('')}
    </div>
  </div>`;

  calContainer.innerHTML = html;
}

/* ══════════════════════════════════════════════════════════════
   TABS + BÚSQUEDA (Días Pendientes)
   ══════════════════════════════════════════════════════════════ */

export function initVacacionesTabs() {
  document.querySelectorAll('.vac-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.vac-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.vtab;

      document.getElementById('vac-tab-saldo').style.display = activeTab === 'saldo' ? 'block' : 'none';
      document.getElementById('vac-tab-solicitudes').style.display = activeTab === 'solicitudes' ? 'block' : 'none';

      renderVacaciones();
    });
  });

  document.getElementById('vac-filter-estatus')?.addEventListener('change', (e) => {
    vacFilterEstatus = e.target.value;
    renderSolicitudesTab();
  });

  if (!store.hasRole('admin')) {
    const emp = store.getEmpleadoById(store.state.authUser?.empleado_id);
    if (emp) {
      selectedEmpleadoId = emp.id;
      document.getElementById('vac-search-empleado').value = `${emp.nombre} ${emp.apellido}`;
      document.getElementById('vac-saldo-empty').style.display = 'none';
      renderEstadoCuenta(emp.id);
    }
  }
}

export function initVacSearch() {
  const isAdmin = store.hasRole('admin');
  const isGerente = store.hasRole('gerente');
  if (!isAdmin && !isGerente) return;

  const input = document.getElementById('vac-search-empleado');
  const resultsPanel = document.getElementById('vac-search-results');
  const resultsList = document.getElementById('vac-search-list');
  if (!input || !resultsPanel || !resultsList) return;

  const authEmpId = store.state.authUser?.empleado_id;
  const equipoIds = isGerente ? store.getEmpleadosByGerente(authEmpId).map(e => e.id) : [];

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      resultsPanel.style.display = 'none';
      return;
    }

    let empleados = (Array.isArray(store.state.empleados) ? store.state.empleados : [])
      .filter(e => e.estatus === 'activo');

    if (isGerente) {
      empleados = empleados.filter(e => e.id === authEmpId || equipoIds.includes(e.id));
    }

    empleados = empleados.filter(e => {
      const fullName = (e.nombre + ' ' + e.apellido).toLowerCase();
      const cedula = (e.cedula || '').toLowerCase();
      return fullName.includes(q) || cedula.includes(q);
    }).slice(0, 10);

    if (empleados.length === 0) {
      resultsList.innerHTML = '<div style="padding:var(--space-4);color:var(--color-text-muted);font-size:var(--font-size-sm);text-align:center">No se encontraron empleados</div>';
      resultsPanel.style.display = 'block';
      return;
    }

    resultsList.innerHTML = empleados.map(e => {
      const saldo = e.vacaciones_saldo || 0;
      const saldoColor = saldo > 30 ? 'var(--color-danger)' : saldo > 15 ? 'var(--color-warning)' : 'var(--color-success)';
      return `<div class="vac-search-item" data-id="${e.id}" style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);cursor:pointer;border-bottom:1px solid var(--color-border-light);transition:background var(--transition-fast)">
        <div class="avatar" style="width:36px;height:36px;font-size:var(--font-size-xs)">
          ${e.foto_url ? `<img src="${e.foto_url}" alt="">` : (e.nombre?.[0] || '') + (e.apellido?.[0] || '')}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:var(--font-weight-medium);color:var(--color-text);font-size:var(--font-size-sm)">${e.nombre} ${e.apellido}</div>
          <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">C.I. ${e.cedula || '\u2014'}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-weight:var(--font-weight-bold);color:${saldoColor};font-size:var(--font-size-sm)">${saldo} d\u00EDas</div>
          <div style="font-size:var(--font-size-xs);color:var(--color-text-muted)">saldo</div>
        </div>
      </div>`;
    }).join('');

    resultsPanel.style.display = 'block';

    resultsList.querySelectorAll('.vac-search-item').forEach(item => {
      item.addEventListener('mouseenter', () => { item.style.background = 'var(--color-gray-50)'; });
      item.addEventListener('mouseleave', () => { item.style.background = ''; });
      item.addEventListener('click', () => {
        selectedEmpleadoId = parseInt(item.dataset.id);
        resultsPanel.style.display = 'none';
        input.value = '';
        renderEstadoCuenta(selectedEmpleadoId);
        document.getElementById('vac-saldo-empty').style.display = 'none';
        document.getElementById('vac-estado-cuenta').style.display = 'block';
      });
    });
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 2) input.dispatchEvent(new Event('input'));
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.toolbar__search') && !e.target.closest('#vac-search-results')) {
      resultsPanel.style.display = 'none';
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   MODAL: SOLICITAR VACACIÓN (Rediseñado con búsqueda)
   ══════════════════════════════════════════════════════════════ */

export function initVacacionesModal() {
  document.getElementById('btn-nueva-vacacion')?.addEventListener('click', () => openVacacionModal());
  document.getElementById('vac-modal-close')?.addEventListener('click', closeVacacionModal);
  document.getElementById('vac-modal-cancel')?.addEventListener('click', closeVacacionModal);
  document.getElementById('vac-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeVacacionModal();
  });
  document.getElementById('vac-modal-save')?.addEventListener('click', saveVacacion);

  initSolicitudSearch();

  pubsub.on(EVENT.VACATIONS_UPDATED, () => {
    if (store.state.ui.currentView === 'vacaciones') renderVacaciones();
  });
}

function initSolicitudSearch() {
  const input = document.getElementById('vac-solicitud-empleado');
  const resultsPanel = document.getElementById('vac-solicitud-results');
  const searchContainer = document.getElementById('vac-solicitud-search');
  if (!input || !resultsPanel) return;

  const isAdmin = store.hasRole('admin');
  const isGerente = store.hasRole('gerente');
  const authEmpId = store.state.authUser?.empleado_id;

  if (!isAdmin && !isGerente) {
    const emp = store.getEmpleadoById(authEmpId);
    if (emp && searchContainer) searchContainer.style.display = 'none';
    if (emp) selectSolicitudEmpleado(emp.id);
    return;
  }

  const equipoIds = isGerente ? store.getEmpleadosByGerente(authEmpId).map(e => e.id) : [];

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      resultsPanel.style.display = 'none';
      return;
    }

    let empleados = (Array.isArray(store.state.empleados) ? store.state.empleados : [])
      .filter(e => e.estatus === 'activo');

    if (isGerente) {
      empleados = empleados.filter(e => equipoIds.includes(e.id));
    }

    empleados = empleados.filter(e => {
      const fullName = (e.nombre + ' ' + e.apellido).toLowerCase();
      const cedula = (e.cedula || '').toLowerCase();
      return fullName.includes(q) || cedula.includes(q);
    }).slice(0, 8);

    if (empleados.length === 0) {
      resultsPanel.innerHTML = '<div style="padding:var(--space-3);color:var(--color-text-muted);font-size:var(--font-size-sm);text-align:center">No se encontraron empleados</div>';
      resultsPanel.style.display = 'block';
      return;
    }

    resultsPanel.innerHTML = empleados.map(e => {
      const saldo = e.vacaciones_saldo || 0;
      return `<div class="vac-sol-item" data-id="${e.id}" style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3);cursor:pointer;border-bottom:1px solid var(--color-border-light);font-size:var(--font-size-sm)">
        <div style="flex:1">${e.nombre} ${e.apellido}</div>
        <div style="color:var(--color-blue-600);font-weight:var(--font-weight-semibold)">${saldo} d\u00EDas</div>
      </div>`;
    }).join('');

    resultsPanel.style.display = 'block';

    resultsPanel.querySelectorAll('.vac-sol-item').forEach(item => {
      item.addEventListener('mouseenter', () => { item.style.background = 'var(--color-gray-50)'; });
      item.addEventListener('mouseleave', () => { item.style.background = ''; });
      item.addEventListener('click', () => {
        const empId = parseInt(item.dataset.id);
        selectSolicitudEmpleado(empId);
        resultsPanel.style.display = 'none';
        input.value = '';
      });
    });
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 2) input.dispatchEvent(new Event('input'));
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#vac-solicitud-search') && !e.target.closest('#vac-solicitud-results')) {
      resultsPanel.style.display = 'none';
    }
  });
}

function selectSolicitudEmpleado(empId) {
  solicitudEmpleadoId = empId;
  const emp = store.getEmpleadoById(empId);
  if (!emp) return;

  const card = document.getElementById('vac-solicitud-empleado-card');
  const saldo = emp.vacaciones_saldo || 0;
  const anios = calcularAniosServicio(emp.fecha_ingreso);
  const diasCorrespondientes = Math.min(15 + Math.max(0, anios - 1), 30);

  document.getElementById('vac-sol-nombre').textContent = `${emp.nombre} ${emp.apellido}`;
  document.getElementById('vac-sol-meta').textContent = `C.I. ${emp.cedula || '\u2014'} | ${calcularAntiguedad(emp.fecha_ingreso)}`;
  document.getElementById('vac-sol-saldo').textContent = `${saldo} días`;
  document.getElementById('vac-sol-saldo').style.color = saldo > 0 ? 'var(--color-blue-600)' : 'var(--color-danger)';

  card.style.display = 'block';

  document.getElementById('vac-sol-dias-info').style.display = 'none';
  document.getElementById('vac-fecha-inicio').value = '';
  document.getElementById('vac-fecha-fin').value = '';
  document.getElementById('vac-sol-dias-disfrutar').value = '';
  document.getElementById('vac-modal-save').disabled = true;

  document.getElementById('vac-fecha-inicio').addEventListener('change', updateSolicitudPreview);
  document.getElementById('vac-fecha-fin').addEventListener('change', updateSolicitudPreview);
  document.getElementById('vac-sol-dias-disfrutar').addEventListener('input', updateSaldoDespues);
}

function updateSolicitudPreview() {
  if (!solicitudEmpleadoId) return;
  const emp = store.getEmpleadoById(solicitudEmpleadoId);
  if (!emp) return;

  const fechaInicio = document.getElementById('vac-fecha-inicio')?.value;
  const fechaFin = document.getElementById('vac-fecha-fin')?.value;
  const infoDiv = document.getElementById('vac-sol-dias-info');

  if (!fechaInicio || !fechaFin) {
    infoDiv.style.display = 'none';
    document.getElementById('vac-modal-save').disabled = true;
    return;
  }

  if (new Date(fechaFin) < new Date(fechaInicio)) {
    infoDiv.style.display = 'none';
    document.getElementById('vac-modal-error').textContent = 'La fecha fin debe ser posterior a la fecha inicio';
    document.getElementById('vac-modal-save').disabled = true;
    return;
  }

  document.getElementById('vac-modal-error').textContent = '';
  const diasHabiles = calcularDiasHabiles(fechaInicio, fechaFin);
  const saldo = emp.vacaciones_saldo || 0;

  document.getElementById('vac-sol-dias-habiles').textContent = `${diasHabiles} días`;
  document.getElementById('vac-sol-dias-disfrutar').value = diasHabiles;
  document.getElementById('vac-sol-dias-disfrutar').max = saldo;

  const saldoDespues = Math.max(0, saldo - diasHabiles);
  document.getElementById('vac-sol-saldo-despues').textContent = `${saldoDespues} días`;
  document.getElementById('vac-sol-saldo-despues').style.color = saldo >= diasHabiles ? 'var(--color-success)' : 'var(--color-danger)';

  infoDiv.style.display = 'block';
  document.getElementById('vac-modal-save').disabled = saldo <= 0;
}

function updateSaldoDespues() {
  if (!solicitudEmpleadoId) return;
  const emp = store.getEmpleadoById(solicitudEmpleadoId);
  if (!emp) return;

  const diasDisfrutar = parseInt(document.getElementById('vac-sol-dias-disfrutar')?.value) || 0;
  const saldo = emp.vacaciones_saldo || 0;
  const saldoDespues = Math.max(0, saldo - diasDisfrutar);

  const el = document.getElementById('vac-sol-saldo-despues');
  if (el) {
    el.textContent = `${saldoDespues} días`;
    el.style.color = saldo >= diasDisfrutar ? 'var(--color-success)' : 'var(--color-danger)';
  }
}

function openVacacionModal() {
  const modal = document.getElementById('vac-modal');
  if (!modal) return;

  solicitudEmpleadoId = null;
  document.getElementById('vac-solicitud-empleado').value = '';
  document.getElementById('vac-solicitud-empleado-card').style.display = 'none';
  document.getElementById('vac-sol-dias-info').style.display = 'none';
  document.getElementById('vac-fecha-inicio').value = '';
  document.getElementById('vac-fecha-fin').value = '';
  document.getElementById('vac-modal-error').textContent = '';
  document.getElementById('vac-modal-save').disabled = true;
  document.getElementById('vac-solicitud-results').style.display = 'none';
  modal.style.display = 'flex';
}

function closeVacacionModal() {
  document.getElementById('vac-modal').style.display = 'none';
  solicitudEmpleadoId = null;
}

async function saveVacacion() {
  if (!solicitudEmpleadoId) return;

  const fechaInicio = document.getElementById('vac-fecha-inicio').value;
  const fechaFin = document.getElementById('vac-fecha-fin').value;
  const diasDisfrutar = parseInt(document.getElementById('vac-sol-dias-disfrutar').value) || 0;
  const errorEl = document.getElementById('vac-modal-error');

  if (!fechaInicio || !fechaFin || diasDisfrutar <= 0) {
    errorEl.textContent = 'Complete todos los campos';
    return;
  }

  const emp = store.getEmpleadoById(solicitudEmpleadoId);
  if (!emp || emp.vacaciones_saldo <= 0) {
    errorEl.textContent = 'El empleado no tiene días disponibles';
    return;
  }

  if (diasDisfrutar > emp.vacaciones_saldo) {
    errorEl.textContent = `No puede solicitar más de ${emp.vacaciones_saldo} días`;
    return;
  }

  const diasHabiles = calcularDiasHabiles(fechaInicio, fechaFin);
  const anios = calcularAniosServicio(emp.fecha_ingreso);
  const diasCorrespondientes = Math.min(15 + Math.max(0, anios - 1), 30);
  const periodo = `${new Date().getFullYear() - 1}-${new Date().getFullYear().toString().slice(-2)}`;

  const btn = document.getElementById('vac-modal-save');
  btn.disabled = true;
  try {
    await store.addVacacion({
      empleado_id: solicitudEmpleadoId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      dias_solicitados: diasDisfrutar,
      dias_correspondientes: diasCorrespondientes,
      periodo: periodo,
      estatus: 'pendiente_jefe'
    });
    closeVacacionModal();
  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
}

/* ══════════════════════════════════════════════════════════════
   MODAL: REGISTRAR USO DE VACACIONES (FIFO)
   ══════════════════════════════════════════════════════════════ */

let usoModalEmpleadoId = null;

function openUsoModal(empleadoId) {
  const emp = store.getEmpleadoById(empleadoId);
  if (!emp) return;

  usoModalEmpleadoId = empleadoId;
  const saldo = emp.vacaciones_saldo || 0;

  document.getElementById('vac-uso-empleado-name').textContent = `${emp.nombre} ${emp.apellido}`;
  document.getElementById('vac-uso-saldo-actual').textContent = `Saldo disponible: ${saldo} días`;
  document.getElementById('vac-uso-dias').value = '';
  document.getElementById('vac-uso-dias').max = saldo;
  document.getElementById('vac-uso-preview').style.display = 'none';
  document.getElementById('vac-uso-error').textContent = '';
  document.getElementById('vac-uso-modal').style.display = 'flex';

  document.getElementById('vac-uso-dias').addEventListener('input', updateUsoPreview);
}

function closeUsoModal() {
  document.getElementById('vac-uso-modal').style.display = 'none';
  usoModalEmpleadoId = null;
}

function updateUsoPreview() {
  const diasInput = document.getElementById('vac-uso-dias');
  const previewDiv = document.getElementById('vac-uso-preview');
  const distDiv = document.getElementById('vac-uso-distribucion');
  const errorEl = document.getElementById('vac-uso-error');

  const diasUso = parseInt(diasInput.value) || 0;
  const emp = store.getEmpleadoById(usoModalEmpleadoId);
  if (!emp) return;

  const saldo = emp.vacaciones_saldo || 0;
  if (diasUso <= 0) {
    previewDiv.style.display = 'none';
    errorEl.textContent = '';
    return;
  }
  if (diasUso > saldo) {
    errorEl.textContent = `No puede descontar más de ${saldo} días`;
    previewDiv.style.display = 'none';
    return;
  }
  errorEl.textContent = '';

  const historial = store.getHistorialByEmpleado(usoModalEmpleadoId)
    .filter(h => h.pendientes > 0)
    .sort((a, b) => a.periodo.localeCompare(b.periodo));

  let restante = diasUso;
  const distribucion = [];
  for (const h of historial) {
    if (restante <= 0) break;
    const descuento = Math.min(restante, h.pendientes);
    distribucion.push({ periodo: h.periodo, descuento, pendientes: h.pendientes });
    restante -= descuento;
  }

  if (distribucion.length === 0) {
    previewDiv.style.display = 'none';
    return;
  }

  distDiv.innerHTML = distribucion.map(d =>
    `<div style="display:flex;justify-content:space-between;padding:var(--space-2) var(--space-3);background:var(--color-gray-50);border-radius:var(--radius-sm);margin-bottom:var(--space-2);font-size:var(--font-size-sm)">
      <span>Per\u00EDodo <strong>${d.periodo}</strong></span>
      <span><strong>-${d.descuento}</strong> d\u00EDas <span style="color:var(--color-text-muted)">(quedan ${d.pendientes - d.descuento})</span></span>
    </div>`
  ).join('');
  previewDiv.style.display = 'block';
}

async function applyUsoFIFO() {
  const diasUso = parseInt(document.getElementById('vac-uso-dias').value) || 0;
  const emp = store.getEmpleadoById(usoModalEmpleadoId);
  if (!emp || diasUso <= 0) return;

  const saldo = emp.vacaciones_saldo || 0;
  const errorEl = document.getElementById('vac-uso-error');
  if (diasUso > saldo) {
    errorEl.textContent = `No puede descontar más de ${saldo} días`;
    return;
  }

  const historial = store.getHistorialByEmpleado(usoModalEmpleadoId)
    .filter(h => h.pendientes > 0)
    .sort((a, b) => a.periodo.localeCompare(b.periodo));

  let restante = diasUso;
  const updates = [];
  for (const h of historial) {
    if (restante <= 0) break;
    const descuento = Math.min(restante, h.pendientes);
    const nuevosDisfrutados = h.disfrutados + descuento;
    const nuevosPendientes = h.correspondiente - nuevosDisfrutados;
    updates.push({ id: h.id, disfrutados: nuevosDisfrutados, pendientes: nuevosPendientes });
    restante -= descuento;
  }

  if (updates.length === 0) return;

  const btn = document.getElementById('vac-uso-save');
  btn.disabled = true;
  try {
    await store.batchUpdateHistorial(updates);

    const nuevoSaldo = saldo - diasUso;
    const historialActualizado = store.getHistorialByEmpleado(usoModalEmpleadoId);
    const totalCorr = historialActualizado.reduce((s, h) => s + (h.correspondiente || 0), 0);
    const totalDisf = historialActualizado.reduce((s, h) => s + (h.disfrutados || 0), 0);
    await store.updateEmpleadoSaldo(usoModalEmpleadoId, nuevoSaldo, totalCorr, totalDisf);

    closeUsoModal();
    renderEstadoCuenta(usoModalEmpleadoId);
  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
}

export function initUsoModal() {
  document.getElementById('vac-uso-close')?.addEventListener('click', closeUsoModal);
  document.getElementById('vac-uso-cancel')?.addEventListener('click', closeUsoModal);
  document.getElementById('vac-uso-save')?.addEventListener('click', applyUsoFIFO);
  document.getElementById('vac-uso-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeUsoModal();
  });
}
