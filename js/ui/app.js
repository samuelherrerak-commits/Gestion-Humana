import { store } from '../engine/store.js';
import { pubsub } from '../utils/pubsub.js';
import { EVENT } from '../constants.js';
import { initSidebar, initSidebarCollapse, updateSidebarActive } from './sidebar.js';
import { renderDashboard } from './dashboard.js';
import { renderEmpleados, initEmpleadosModal } from './empleados.js';
import { renderEmpleadoDetalle } from './empleado-detalle.js';
import { renderExpedientes, initExpedientes } from './expedientes.js';
import { renderVacaciones, initVacacionesModal, initVacacionesTabs, initVacSearch, initUsoModal } from './vacaciones.js';
import { renderConstancias, initConstanciasModal } from './constancias.js';
import { renderOrganizacion, initOrganizacion } from './organizacion.js';
import { renderFideicomiso, initFideicomiso } from './fideicomiso.js';

export function initApp() {
  initSidebar();
  initSidebarCollapse();
  setupNavigation();
  setupTopbar();
  initEmpleadosModal();
  initExpedientes();
  initVacacionesModal();
  initVacacionesTabs();
  initVacSearch();
  initUsoModal();
  initConstanciasModal();
  initOrganizacion();
  initFideicomiso();
  applyRoleVisibility();
  attachGlobalEvents();
}

function applyRoleVisibility() {
  const isAdmin = store.hasRole('admin');
  const isGerente = store.hasRole('gerente');

  const hideIf = (selector, condition) => {
    document.querySelectorAll(selector).forEach(el => {
      if (condition) el.style.display = 'none';
    });
  };

  hideIf('[data-view="empleados"]', !isAdmin);
  hideIf('[data-view="expedientes"]', !isAdmin);

  const orgLinks = document.querySelector('.sidebar__group-label[data-group="organizacion"]')?.closest('.sidebar__group')?.querySelectorAll('.sidebar__link');
  if (orgLinks) orgLinks.forEach(l => { if (!isAdmin) l.style.display = 'none'; });

  const fideLinks = document.querySelector('.sidebar__group-label[data-group="fideicomiso"]')?.closest('.sidebar__group')?.querySelectorAll('.sidebar__link');
  if (fideLinks) fideLinks.forEach(l => { if (!isAdmin) l.style.display = 'none'; });
}

function setupNavigation() {
  document.querySelectorAll('.sidebar__link[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.currentTarget.dataset.view;
      showView(view);
      updateSidebarActive(view);
      document.getElementById('sidebar').classList.remove('open');
    });
  });

  const auditoriaLinks = document.querySelectorAll('.sidebar__submenu .sidebar__link[data-view]');
  auditoriaLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.currentTarget.dataset.view;
      showView(view);
      updateSidebarActive(view);
      document.getElementById('sidebar').classList.remove('open');
    });
  });
}

function setupTopbar() {
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.getElementById('btn-print')?.addEventListener('click', () => {
    window.print();
  });
}

function attachGlobalEvents() {
  pubsub.on(EVENT.DASHBOARD_UPDATED, () => {
    if (store.state.ui.currentView === 'dashboard') {
      renderDashboard();
    }
  });
}

const VIEW_TITLES = {
  'dashboard': ['Dashboard', 'Panel de control general'],
  'empleados': ['Empleados', 'Gestión de personal'],
  'empleado-detalle': ['Detalle del Empleado', 'Información completa'],
  'expedientes': ['Expedientes Digitales', 'Documentos de empleados'],
  'vacaciones': ['Vacaciones', 'Solicitudes y calendario'],
  'constancias': ['Constancias', 'Generación de documentos'],
  'organizacion-estructura': ['Organización', 'Estructura organizacional'],
  'organizacion-departamentos': ['Organización', 'Departamentos y encargados'],
  'fideicomiso': ['Fideicomiso', 'Prestaciones sociales'],
  'auditoria-modulos': ['Auditoría Legal', 'Módulos de cumplimiento'],
  'auditoria-plan': ['Plan de Acción', 'Acciones correctivas'],
  'auditoria-historial': ['Historial', 'Auditorías anteriores']
};

export function showView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));

  const viewMap = {
    'dashboard': 'view-dashboard',
    'empleados': 'view-empleados',
    'empleado-detalle': 'view-empleado-detalle',
    'expedientes': 'view-expedientes',
    'vacaciones': 'view-vacaciones',
    'constancias': 'view-constancias',
    'organizacion-estructura': 'view-organizacion',
    'organizacion-departamentos': 'view-organizacion',
    'fideicomiso': 'view-fideicomiso',
    'auditoria-modulos': 'view-auditoria',
    'auditoria-plan': 'view-auditoria',
    'auditoria-historial': 'view-auditoria'
  };

  const targetId = viewMap[view];
  if (targetId) {
    const target = document.getElementById(targetId);
    if (target) target.classList.add('view--active');
  }

  const [title, subtitle] = VIEW_TITLES[view] || ['', ''];
  document.getElementById('view-title').textContent = title;
  document.getElementById('view-subtitle').textContent = subtitle;

  store.setCurrentView(view);

  if (view === 'dashboard') renderDashboard();
  else if (view === 'empleados') renderEmpleados();
  else if (view === 'empleado-detalle') renderEmpleadoDetalle(store.state.ui.currentEmpleadoId);
  else if (view === 'expedientes') renderExpedientes();
  else if (view === 'vacaciones') renderVacaciones();
  else if (view === 'constancias') renderConstancias();
  else if (view.startsWith('organizacion-')) {
    const section = view === 'organizacion-departamentos' ? 'departamentos' : 'estructura';
    renderOrganizacion(section);
  }
  else if (view === 'fideicomiso') renderFideicomiso();
  else if (view.startsWith('auditoria-')) renderAuditoria(view);
}

let auditoriaLoaded = false;
async function renderAuditoria(view) {
  const container = document.getElementById('view-auditoria');
  if (!container) return;

  if (!auditoriaLoaded) {
    try {
      const { initAuditoriaModule } = await import('./auditoria-view.js');
      await initAuditoriaModule(container);
      auditoriaLoaded = true;
    } catch (e) {
      container.innerHTML = `<div class="empty-state">
        <h3>Módulo de Auditoría</h3>
        <p>El módulo de auditoría legal se está cargando...</p>
        <p class="text-muted mt-4">${e.message}</p>
      </div>`;
      return;
    }
  }

  const section = view === 'auditoria-modulos' ? 'modulos'
    : view === 'auditoria-plan' ? 'plan'
    : 'historial';

  try {
    const { showAuditoriaSection } = await import('./auditoria-view.js');
    showAuditoriaSection(section);
  } catch (e) {
    console.error('[Auditoria] render error:', e);
  }
}
