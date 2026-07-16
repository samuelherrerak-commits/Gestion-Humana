import { store } from '../engine/store.js';
import { pubsub } from '../utils/pubsub.js';
import { EVENT, TIPOS_CONSTANCIA, TIPOS_CONSTANCIA_LABELS, getEmpresaByLocalidad, EMPRESA_LABELS } from '../constants.js';
import { formatDate } from '../utils/format.js';
import { generarConstanciaPDF } from './constancia-pdf.js';

let constanciaSelectedEmpId = null;

export function renderConstancias() {
  const container = document.getElementById('constancias-table-body');
  const emptyState = document.getElementById('constancias-empty');
  if (!container) return;

  let constancias = [...(Array.isArray(store.state.constancias) ? store.state.constancias : [])].sort((a, b) => b.id - a.id);

  if (!store.hasRole('admin')) {
    constancias = constancias.filter(c => c.empleado_id === store.state.authUser?.empleado_id);
  }

  if (constancias.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = constancias.map(c => {
    const emp = store.getEmpleadoById(c.empleado_id);
    return `
    <tr data-id="${c.id}">
      <td class="cell-primary">${emp ? emp.nombre + ' ' + emp.apellido : '—'}</td>
      <td><span class="badge badge--info">${TIPOS_CONSTANCIA_LABELS[c.tipo] || c.tipo}</span></td>
      <td>${formatDate(c.fecha_emision)}</td>
      <td>
        <button class="btn btn--ghost btn--sm btn-const-pdf" data-id="${c.id}" title="Descargar PDF">\u{1F4E5} PDF</button>
      </td>
    </tr>`;
  }).join('');

  container.querySelectorAll('.btn-const-pdf').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const c = (Array.isArray(store.state.constancias) ? store.state.constancias : []).find(x => x.id === parseInt(btn.dataset.id));
      if (c) {
        const emp = store.getEmpleadoById(c.empleado_id);
        generarConstanciaPDF(c, emp);
      }
    });
  });
}

export function initConstanciasModal() {
  if (!store.hasRole('admin')) {
    const btn = document.getElementById('btn-nueva-constancia');
    if (btn) btn.style.display = 'none';
  }
  document.getElementById('btn-nueva-constancia')?.addEventListener('click', () => openConstanciaModal());
  document.getElementById('const-modal-close')?.addEventListener('click', closeConstanciaModal);
  document.getElementById('const-modal-cancel')?.addEventListener('click', closeConstanciaModal);
  document.getElementById('const-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeConstanciaModal();
  });
  document.getElementById('const-modal-save')?.addEventListener('click', saveConstancia);

  initConstanciaAutocomplete();

  document.getElementById('const-solicitar-close')?.addEventListener('click', closeSolicitarModal);
  document.getElementById('const-solicitar-cancel')?.addEventListener('click', closeSolicitarModal);
  document.getElementById('const-solicitar-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeSolicitarModal();
  });
  document.getElementById('const-solicitar-save')?.addEventListener('click', saveSolicitarConstancia);

  pubsub.on(EVENT.CERTIFICATES_UPDATED, () => {
    if (store.state.ui.currentView === 'constancias') renderConstancias();
  });
}

function initConstanciaAutocomplete() {
  const searchInput = document.getElementById('const-empleado-search');
  const resultsDiv = document.getElementById('const-empleado-results');
  const selectedDiv = document.getElementById('const-empleado-selected');
  const hiddenId = document.getElementById('const-empleado-id');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) {
      resultsDiv.style.display = 'none';
      return;
    }

    const empleados = (Array.isArray(store.state.empleados) ? store.state.empleados : []).filter(e => e.estatus === 'activo');
    const matches = empleados.filter(e => {
      const fullName = `${e.nombre} ${e.apellido}`.toLowerCase();
      const cedula = (e.cedula || '').toLowerCase();
      return fullName.includes(query) || cedula.includes(query);
    }).slice(0, 10);

    if (matches.length === 0) {
      resultsDiv.innerHTML = '<div class="autocomplete-item" style="color:var(--color-text-muted)">Sin resultados</div>';
      resultsDiv.style.display = 'block';
      return;
    }

    resultsDiv.innerHTML = matches.map(e => `
      <div class="autocomplete-item" data-id="${e.id}">
        <strong>${e.nombre} ${e.apellido}</strong>
        <span style="color:var(--color-text-muted);margin-left:6px">${e.cedula || ''}</span>
      </div>
    `).join('');
    resultsDiv.style.display = 'block';

    resultsDiv.querySelectorAll('.autocomplete-item[data-id]').forEach(item => {
      item.addEventListener('click', () => {
        const empId = parseInt(item.dataset.id);
        selectConstanciaEmpleado(empId);
      });
    });
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length >= 2) {
      searchInput.dispatchEvent(new Event('input'));
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target) && !selectedDiv.contains(e.target)) {
      resultsDiv.style.display = 'none';
    }
  });
}

function selectConstanciaEmpleado(empId) {
  const emp = store.getEmpleadoById(empId);
  if (!emp) return;

  constanciaSelectedEmpId = empId;
  const searchInput = document.getElementById('const-empleado-search');
  const resultsDiv = document.getElementById('const-empleado-results');
  const selectedDiv = document.getElementById('const-empleado-selected');
  const hiddenId = document.getElementById('const-empleado-id');
  const empresaBadge = document.getElementById('const-empresa-badge');
  const empresaText = document.getElementById('const-empresa-text');
  const localidadText = document.getElementById('const-localidad-text');
  const datosFaltantes = document.getElementById('const-datos-faltantes');

  searchInput.value = '';
  resultsDiv.style.display = 'none';
  hiddenId.value = empId;

  selectedDiv.innerHTML = `
    <span>${emp.nombre} ${emp.apellido} — ${emp.cedula || ''}</span>
    <button class="autocomplete-clear" type="button" id="const-clear-emp">&times;</button>
  `;
  selectedDiv.style.display = 'flex';

  document.getElementById('const-clear-emp')?.addEventListener('click', () => {
    constanciaSelectedEmpId = null;
    hiddenId.value = '';
    selectedDiv.style.display = 'none';
    empresaBadge.style.display = 'none';
    datosFaltantes.style.display = 'none';
  });

  const empresa = getEmpresaByLocalidad(emp.localidad);
  const empresaLabel = EMPRESA_LABELS[empresa] || empresa;
  empresaText.textContent = empresaLabel;
  empresaText.className = empresa === 'austral' ? 'badge badge--danger' : 'badge badge--info';
  localidadText.textContent = emp.localidad || 'Sin localidad';
  empresaBadge.style.display = 'block';

  const faltaCargo = !emp.cargo || emp.cargo.trim() === '';
  const faltaSalario = emp.salario == null || emp.salario === 0;
  if (faltaCargo || faltaSalario) {
    datosFaltantes.style.display = 'block';
    document.getElementById('const-cargo-edit').value = emp.cargo || '';
    document.getElementById('const-salario-edit').value = (emp.salario && emp.salario > 0) ? emp.salario : '';
  } else {
    datosFaltantes.style.display = 'none';
  }
}

function openConstanciaModal() {
  const modal = document.getElementById('const-modal');
  if (!modal) return;

  constanciaSelectedEmpId = null;
  document.getElementById('const-empleado-search').value = '';
  document.getElementById('const-empleado-id').value = '';
  document.getElementById('const-empleado-selected').style.display = 'none';
  document.getElementById('const-empleado-results').style.display = 'none';
  document.getElementById('const-empresa-badge').style.display = 'none';
  document.getElementById('const-datos-faltantes').style.display = 'none';
  document.getElementById('const-tipo').value = 'trabajo';
  document.getElementById('const-modal-error').textContent = '';
  modal.style.display = 'flex';
}

function closeConstanciaModal() {
  document.getElementById('const-modal').style.display = 'none';
}

async function saveConstancia() {
  const empId = parseInt(document.getElementById('const-empleado-id').value);
  const tipo = document.getElementById('const-tipo').value;
  const errorEl = document.getElementById('const-modal-error');

  if (!empId) {
    errorEl.textContent = 'Seleccione un empleado';
    return;
  }

  const emp = store.getEmpleadoById(empId);
  if (!emp) {
    errorEl.textContent = 'Empleado no encontrado';
    return;
  }

  const opciones = {};
  const datosFaltantes = document.getElementById('const-datos-faltantes');
  if (datosFaltantes.style.display !== 'none') {
    const cargoEdit = document.getElementById('const-cargo-edit').value.trim();
    const salarioEdit = parseFloat(document.getElementById('const-salario-edit').value);
    if (!cargoEdit) {
      errorEl.textContent = 'El cargo es obligatorio';
      return;
    }
    if (isNaN(salarioEdit) || salarioEdit <= 0) {
      errorEl.textContent = 'El salario es obligatorio y debe ser mayor a 0';
      return;
    }
    opciones.cargo = cargoEdit;
    opciones.salario = salarioEdit;
  }

  const contenido = generarContenidoConstancia(tipo, emp, opciones);

  const btn = document.getElementById('const-modal-save');
  btn.disabled = true;
  try {
    const created = await store.addConstancia({
      empleado_id: empId,
      tipo,
      contenido
    });

    if (created) {
      generarConstanciaPDF(created, emp, opciones);
    }
    closeConstanciaModal();
  } catch (err) {
    console.error('[Constancia] Error:', err);
    errorEl.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
}

function generarContenidoConstancia(tipo, emp, opciones = {}) {
  const cargo = opciones.cargo || emp.cargo || '_______________';
  const salario = opciones.salario || emp.salario;
  const nombre = `${emp.nombre} ${emp.apellido}`;
  const cedula = emp.cedula || '________';

  if (tipo === 'trabajo') {
    return `CONSTANCIA DE TRABAJO — ${nombre}`;
  }

  if (tipo === 'sueldo') {
    return `CONSTANCIA DE SUELDO — ${nombre}`;
  }

  return `CARTA DE RECOMENDACIÓN — ${nombre}`;
}

function checkConstanciaMensualLimit(empleadoId) {
  const constancias = Array.isArray(store.state.constancias) ? store.state.constancias : [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const yaTiene = constancias.some(c => {
    if (c.empleado_id !== empleadoId) return false;
    const fecha = new Date(c.fecha_emision);
    return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
  });
  return { allowed: !yaTiene, message: yaTiene ? 'Ya ha solicitado una constancia este mes. Espere al próximo mes.' : '' };
}

export function openSolicitarConstanciaModal() {
  const modal = document.getElementById('const-solicitar-modal');
  if (!modal) return;

  const empId = store.state.authUser?.empleado_id;
  const emp = store.getEmpleadoById(empId);
  if (!emp) return;

  const limitCheck = checkConstanciaMensualLimit(empId);
  const errorEl = document.getElementById('const-solicitar-error');
  const saveBtn = document.getElementById('const-solicitar-save');

  document.getElementById('const-solicitar-nombre').textContent = `${emp.nombre} ${emp.apellido}`;
  document.getElementById('const-solicitar-meta').textContent = `C.I. ${emp.cedula || '—'} — Constancia de Trabajo`;
  errorEl.textContent = limitCheck.message;
  saveBtn.disabled = !limitCheck.allowed;

  modal.style.display = 'flex';
}

function closeSolicitarModal() {
  document.getElementById('const-solicitar-modal').style.display = 'none';
}

async function saveSolicitarConstancia() {
  const empId = store.state.authUser?.empleado_id;
  if (!empId) return;

  const emp = store.getEmpleadoById(empId);
  if (!emp) return;

  const limitCheck = checkConstanciaMensualLimit(empId);
  if (!limitCheck.allowed) {
    document.getElementById('const-solicitar-error').textContent = limitCheck.message;
    return;
  }

  const contenido = generarContenidoConstancia('trabajo', emp);
  const btn = document.getElementById('const-solicitar-save');
  const errorEl = document.getElementById('const-solicitar-error');
  btn.disabled = true;
  errorEl.textContent = '';

  try {
    const created = await store.addConstancia({
      empleado_id: empId,
      tipo: 'trabajo',
      contenido,
      fecha_emision: new Date().toISOString().split('T')[0]
    });

    if (created) {
      generarConstanciaPDF(created, emp);
    }
    closeSolicitarModal();
  } catch (err) {
    console.error('[Constancia] Error:', err);
    errorEl.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
}
