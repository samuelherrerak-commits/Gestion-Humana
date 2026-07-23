import { store } from '../engine/store.js';
import { pubsub } from '../utils/pubsub.js';
import { EVENT, getDepartamentosFromStore, ESTATUS_EMPLEADO_LABELS } from '../constants.js';
import { formatDate, getInitials } from '../utils/format.js';
import { showView } from './app.js';
import { getLocalidadesFromStore } from '../constants.js';

let editingId = null;
let hijosList = [];

const NIVEL_ESTUDIOS_LABELS = {
  primaria: 'Primaria', secundaria: 'Secundaria', tecnico: 'Técnico',
  licenciatura: 'Licenciatura', maestria: 'Maestría', doctorado: 'Doctorado'
};

export function renderEmpleados() {
  const container = document.getElementById('empleados-table-body');
  const emptyState = document.getElementById('empleados-empty');
  if (!container) return;

  let empleados = [...(Array.isArray(store.state.empleados) ? store.state.empleados : [])];

  const search = (document.getElementById('emp-search')?.value || '').toLowerCase();
  const filterDept = document.getElementById('emp-filter-dept')?.value || '';
  const filterEstatus = document.getElementById('emp-filter-estatus')?.value || '';

  if (search) {
    empleados = empleados.filter(e =>
      (e.nombre + ' ' + e.apellido).toLowerCase().includes(search) ||
      (e.cedula || '').toLowerCase().includes(search)
    );
  }
  if (filterDept) empleados = empleados.filter(e => e.departamento === filterDept);
  if (filterEstatus) empleados = empleados.filter(e => e.estatus === filterEstatus);

  if (empleados.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = empleados.map(e => {
    const saldo = e.vacaciones_saldo || 0;
    const saldoColor = saldo > 30 ? 'var(--color-danger)' : saldo > 15 ? 'var(--color-warning)' : 'var(--color-success)';
    return `
    <tr data-id="${e.id}">
      <td>
        <div class="flex items-center gap-2">
          <div class="avatar">
            ${e.foto_url ? `<img src="${e.foto_url}" alt="">` : getInitials(e.nombre, e.apellido)}
          </div>
          <div>
            <div class="cell-primary">${e.nombre} ${e.apellido}</div>
            <div class="cell-secondary">C.I. ${e.cedula || '\u2014'}</div>
          </div>
        </div>
      </td>
      <td>${e.departamento || '\u2014'}</td>
      <td>${e.cargo || '\u2014'}</td>
      <td><span class="badge badge--${e.estatus === 'activo' ? 'active' : 'inactive'}">${ESTATUS_EMPLEADO_LABELS[e.estatus] || e.estatus}</span></td>
      <td>${formatDate(e.fecha_ingreso)}</td>
      <td style="color:${saldoColor};font-weight:var(--font-weight-semibold)">${saldo} d\u00EDas</td>
      <td>
        ${store.hasRole('admin') ? `<button class="btn btn--ghost btn--sm btn-empleado-edit" data-id="${e.id}" title="Editar">\u{270F}</button>` : ''}
        ${store.hasRole('admin') ? `<button class="btn btn--ghost btn--sm btn-empleado-delete" data-id="${e.id}" title="Eliminar">\u{1F5D1}</button>` : ''}
      </td>
    </tr>`;
  }).join('');

  container.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', (ev) => {
      if (ev.target.closest('button')) return;
      const id = parseInt(row.dataset.id);
      store.setCurrentEmpleado(id);
      showView('empleado-detalle');
    });
  });

  container.querySelectorAll('.btn-empleado-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(parseInt(btn.dataset.id));
    });
  });

  container.querySelectorAll('.btn-empleado-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('\u00BFEliminar este empleado y todos sus documentos?')) {
        await store.deleteEmpleado(parseInt(btn.dataset.id));
      }
    });
  });
}

export function initEmpleadosModal() {
  const toolbar = document.getElementById('empleados-toolbar');
  if (toolbar) {
    const deptSelect = document.getElementById('emp-filter-dept');
    if (deptSelect) {
      const empleados = Array.isArray(store.state.empleados) ? store.state.empleados : [];
      const departamentos = getDepartamentosFromStore(empleados);
      deptSelect.innerHTML = '<option value="">Todos los departamentos</option>' +
        departamentos.map(d => `<option value="${d}">${d}</option>`).join('');
    }

    toolbar.querySelector('[data-action="search"]')?.addEventListener('input', () => renderEmpleados());
    deptSelect?.addEventListener('change', () => renderEmpleados());
    document.getElementById('emp-filter-estatus')?.addEventListener('change', () => renderEmpleados());
  }

  if (!store.hasRole('admin')) {
    const btnNuevo = document.getElementById('btn-nuevo-empleado');
    if (btnNuevo) btnNuevo.style.display = 'none';
  }
  document.getElementById('btn-nuevo-empleado')?.addEventListener('click', () => openModal());
  document.getElementById('empleado-modal-close')?.addEventListener('click', closeModal);
  document.getElementById('empleado-modal-cancel')?.addEventListener('click', closeModal);
  document.getElementById('empleado-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById('empleado-modal-save')?.addEventListener('click', saveEmpleado);
  document.getElementById('btn-add-hijo')?.addEventListener('click', addHijoRow);

  pubsub.on(EVENT.EMPLOYEES_UPDATED, () => {
    if (store.state.ui.currentView === 'empleados') renderEmpleados();
  });
}

function openModal(id) {
  editingId = id || null;
  hijosList = [];
  const modal = document.getElementById('empleado-modal');
  const title = document.getElementById('empleado-modal-title');
  if (!modal) return;

  const localidadSelect = document.getElementById('emp-localidad');
  if (localidadSelect) {
    const localidades = getLocalidadesFromStore(Array.isArray(store.state.empleados) ? store.state.empleados : []);
    localidadSelect.innerHTML = '<option value="">Seleccionar...</option>' +
      localidades.map(l => `<option value="${l}">${l}</option>`).join('');
  }

  if (editingId) {
    const emp = store.getEmpleadoById(editingId);
    if (!emp) return;
    title.textContent = 'Editar Ficha';
    document.getElementById('emp-nombre').value = emp.nombre || '';
    document.getElementById('emp-apellido').value = emp.apellido || '';
    document.getElementById('emp-cedula').value = emp.cedula || '';
    document.getElementById('emp-fecha-nac').value = emp.fecha_nacimiento || '';
    document.getElementById('emp-genero').value = emp.genero || '';
    document.getElementById('emp-estado-civil').value = emp.estado_civil || '';
    document.getElementById('emp-fecha-ingreso').value = emp.fecha_ingreso || '';
    document.getElementById('emp-cargo').value = emp.cargo || '';
    document.getElementById('emp-departamento').value = emp.departamento || '';
    document.getElementById('emp-salario').value = emp.salario || '';
    document.getElementById('emp-estatus').value = emp.estatus || 'activo';
    document.getElementById('emp-localidad').value = emp.localidad || '';
    document.getElementById('emp-telefono').value = emp.telefono || '';
    document.getElementById('emp-telefono-alt').value = emp.telefono_alt || '';
    document.getElementById('emp-correo-personal').value = emp.correo_personal || '';
    document.getElementById('emp-direccion').value = emp.direccion || '';
    document.getElementById('emp-estado-ciudad').value = emp.estado_ciudad || '';
    document.getElementById('emp-nivel-estudios').value = emp.nivel_estudios || '';
    document.getElementById('emp-titulo-obtenido').value = emp.titulo_obtenido || '';
    document.getElementById('emp-universidad').value = emp.universidad || '';
    document.getElementById('emp-anio-graduacion').value = emp.anio_graduacion || '';
    document.getElementById('emp-foto-url').value = emp.foto_url || '';
    hijosList = Array.isArray(emp.hijos) ? [...emp.hijos] : [];
  } else {
    title.textContent = 'Nueva Ficha';
    modal.querySelectorAll('input, select').forEach(el => {
      if (el.tagName === 'SELECT') el.selectedIndex = 0;
      else el.value = '';
    });
    document.getElementById('emp-estatus').value = 'activo';
  }

  document.getElementById('empleado-modal-error').textContent = '';

  const deptSelect = document.getElementById('emp-departamento');
  const departamentos = getDepartamentosFromStore(Array.isArray(store.state.empleados) ? store.state.empleados : []);
  const currentDept = editingId ? (store.getEmpleadoById(editingId)?.departamento || '') : '';
  deptSelect.innerHTML = '<option value="">Seleccionar...</option>' +
    departamentos.map(d => `<option value="${d}" ${d === currentDept ? 'selected' : ''}>${d}</option>`).join('');

  renderHijos();
  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('empleado-modal').style.display = 'none';
  editingId = null;
  hijosList = [];
}

function renderHijos() {
  const container = document.getElementById('emp-hijos-container');
  if (!container) return;

  if (hijosList.length === 0) {
    container.innerHTML = '<div class="emp-hijos-empty" style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin-bottom:var(--space-3)">No hay hijos registrados</div>';
    return;
  }

  container.innerHTML = hijosList.map((h, i) => {
    const edad = h.fecha_nacimiento ? Math.floor((Date.now() - new Date(h.fecha_nacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : '';
    return `
    <div class="hijo-row" style="display:grid;grid-template-columns:2fr 1fr auto auto;gap:var(--space-2);margin-bottom:var(--space-2);align-items:end">
      <div class="form-group" style="margin:0">
        <label class="form-label" style="font-size:var(--font-size-xs)">Nombre</label>
        <input type="text" class="form-input form-input--sm" data-hijo-field="nombre" data-hijo-idx="${i}" value="${h.nombre || ''}">
      </div>
      <div class="form-group" style="margin:0">
        <label class="form-label" style="font-size:var(--font-size-xs)">F. Nacimiento</label>
        <input type="date" class="form-input form-input--sm" data-hijo-field="fecha_nacimiento" data-hijo-idx="${i}" value="${h.fecha_nacimiento || ''}">
      </div>
      <div class="form-group" style="margin:0">
        <label class="form-label" style="font-size:var(--font-size-xs)">Estudia</label>
        <select class="form-select form-input--sm" data-hijo-field="estudia" data-hijo-idx="${i}">
          <option value="false" ${!h.estudia ? 'selected' : ''}>No</option>
          <option value="true" ${h.estudia ? 'selected' : ''}>Sí</option>
        </select>
      </div>
      <button type="button" class="btn btn--ghost btn--sm" data-hijo-remove="${i}" title="Eliminar" style="color:var(--color-danger)">✕</button>
    </div>
    ${h.estudia ? `
    <div class="hijo-row" style="display:grid;grid-template-columns:1fr;gap:var(--space-2);margin-bottom:var(--space-3);margin-top:calc(-1 * var(--space-2))">
      <div class="form-group" style="margin:0">
        <label class="form-label" style="font-size:var(--font-size-xs)">Nivel de Estudio</label>
        <select class="form-select form-input--sm" data-hijo-field="nivel" data-hijo-idx="${i}">
          <option value="">Seleccionar...</option>
          <option value="primaria" ${h.nivel === 'primaria' ? 'selected' : ''}>Primaria</option>
          <option value="secundaria" ${h.nivel === 'secundaria' ? 'selected' : ''}>Secundaria</option>
          <option value="universidad" ${h.nivel === 'universidad' ? 'selected' : ''}>Universidad</option>
        </select>
      </div>
    </div>
    ` : '<div style="margin-bottom:var(--space-3)"></div>'}`;
  }).join('');

  container.querySelectorAll('[data-hijo-field]').forEach(el => {
    el.addEventListener('change', (e) => {
      const idx = parseInt(el.dataset.hijoIdx);
      const field = el.dataset.hijoField;
      if (field === 'estudia') {
        hijosList[idx].estudia = el.value === 'true';
      } else {
        hijosList[idx][field] = el.value;
      }
      renderHijos();
    });
    el.addEventListener('input', (e) => {
      const idx = parseInt(el.dataset.hijoIdx);
      const field = el.dataset.hijoField;
      if (field === 'nombre') {
        hijosList[idx].nombre = el.value;
      }
    });
  });

  container.querySelectorAll('[data-hijo-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      hijosList.splice(parseInt(btn.dataset.hijoRemove), 1);
      renderHijos();
    });
  });
}

function addHijoRow() {
  hijosList.push({ nombre: '', fecha_nacimiento: '', estudia: false, nivel: '' });
  renderHijos();
}

async function saveEmpleado() {
  const data = {
    nombre: document.getElementById('emp-nombre').value.trim(),
    apellido: document.getElementById('emp-apellido').value.trim(),
    cedula: document.getElementById('emp-cedula').value.trim(),
    fecha_nacimiento: document.getElementById('emp-fecha-nac').value || null,
    genero: document.getElementById('emp-genero').value || null,
    estado_civil: document.getElementById('emp-estado-civil').value || null,
    fecha_ingreso: document.getElementById('emp-fecha-ingreso').value || null,
    cargo: document.getElementById('emp-cargo').value.trim() || null,
    departamento: document.getElementById('emp-departamento').value || null,
    salario: document.getElementById('emp-salario').value ? parseFloat(document.getElementById('emp-salario').value) : null,
    estatus: document.getElementById('emp-estatus').value,
    localidad: document.getElementById('emp-localidad').value || null,
    telefono: document.getElementById('emp-telefono').value.trim() || null,
    telefono_alt: document.getElementById('emp-telefono-alt').value.trim() || null,
    correo_personal: document.getElementById('emp-correo-personal').value.trim() || null,
    direccion: document.getElementById('emp-direccion').value.trim() || null,
    estado_ciudad: document.getElementById('emp-estado-ciudad').value.trim() || null,
    nivel_estudios: document.getElementById('emp-nivel-estudios').value || null,
    titulo_obtenido: document.getElementById('emp-titulo-obtenido').value.trim() || null,
    universidad: document.getElementById('emp-universidad').value.trim() || null,
    anio_graduacion: document.getElementById('emp-anio-graduacion').value ? parseInt(document.getElementById('emp-anio-graduacion').value) : null,
    hijos: hijosList.length > 0 ? hijosList : [],
    foto_url: document.getElementById('emp-foto-url').value.trim() || null
  };

  const errorEl = document.getElementById('empleado-modal-error');
  if (!data.nombre || !data.apellido || !data.cedula) {
    errorEl.textContent = 'Nombre, apellido y c\u00E9dula son requeridos';
    return;
  }

  const btn = document.getElementById('empleado-modal-save');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    if (editingId) {
      await store.updateEmpleado(editingId, data);
    } else {
      await store.addEmpleado(data);
    }
    closeModal();
  } catch (err) {
    errorEl.textContent = err.message || 'Error al guardar';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar';
  }
}
