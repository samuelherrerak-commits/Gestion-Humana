import { store } from '../engine/store.js';
import { getDepartamentosFromStore } from '../constants.js';
import { showView } from './app.js';

let orgSubView = 'estructura';

/* ══════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════ */

function getEmpleadosActivos() {
  return (Array.isArray(store.state.empleados) ? store.state.empleados : [])
    .filter(e => e.estatus === 'activo');
}

function getJefeDeDepartamento(dept, empleados) {
  const deptEmpleados = empleados.filter(e => e.departamento === dept);
  if (deptEmpleados.length === 0) return null;
  const jefeId = deptEmpleados[0]?.jefe_id;
  if (!jefeId) return null;
  return empleados.find(e => e.id === jefeId) || null;
}

function getViceDeDepartamento(dept, jefe, empleados) {
  if (!jefe) return null;
  const deptEmpleados = empleados.filter(e => e.departamento === dept);
  return deptEmpleados.find(e => e.jefe_id === jefe.id && e.id !== jefe.id) || null;
}

function formatEmpOption(e) {
  const dept = e.departamento ? ` · ${e.departamento}` : '';
  return `${e.nombre} ${e.apellido}${dept} — ${e.cedula || 'S/C'}`;
}

/* ══════════════════════════════════════════════════════════════
   RENDER PRINCIPAL
   ══════════════════════════════════════════════════════════════ */

export function renderOrganizacion(section) {
  orgSubView = section || 'estructura';
  if (orgSubView === 'departamentos') renderDepartamentos();
  else renderEstructura();
}

/* ══════════════════════════════════════════════════════════════
   VISTA: ESTRUCTURA (Árbol Organizacional)
   ══════════════════════════════════════════════════════════════ */

function renderEstructura() {
  const container = document.getElementById('view-organizacion');
  if (!container) return;

  const empleados = getEmpleadosActivos();
  const gerentes = empleados.filter(e => e.nivel_jerarquico === 'gerente_general');
  const departamentos = getDepartamentosFromStore(empleados);

  let html = `
    <div class="panel">
      <div class="panel__header">
        <h2 class="panel__title">Estructura Organizacional</h2>
      </div>
      <div class="panel__body" style="overflow-x:auto;padding:var(--space-8) var(--space-6);background:linear-gradient(180deg, var(--color-gray-50) 0%, var(--color-surface) 100%)">
        <div class="org-tree">
          <!-- JUNTA DIRECTIVA -->
          <div class="org-tree__level org-tree__level--root">
            <div class="org-node org-node--junta">
              <div class="org-node__avatar org-node__avatar--junta" style="width:48px;height:48px">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div class="org-node__info">
                <div class="org-node__name">Junta Directiva</div>
                <div class="org-node__role">Máxima autoridad</div>
              </div>
            </div>
            <div class="org-tree__line org-tree__line--down"></div>
          </div>

          <!-- GERENTE GENERAL -->
          <div class="org-tree__level">
            ${gerentes.length > 0 ? gerentes.map(g => `
              <div class="org-node org-node--gerente org-node--clickable" data-empleado-id="${g.id}">
                <div class="org-node__avatar" style="width:48px;height:48px;font-size:var(--font-size-base)">
                  ${g.foto_url ? `<img src="${g.foto_url}" alt="">` : (g.nombre?.[0] || '') + (g.apellido?.[0] || '')}
                </div>
                <div class="org-node__info">
                  <div class="org-node__name">${g.nombre} ${g.apellido}</div>
                  <div class="org-node__role">${g.cargo || 'Gerente General'}</div>
                </div>
              </div>
            `).join('') : `
              <div class="org-node org-node--gerente org-node--empty">
                <div class="org-node__avatar org-node__avatar--empty">?</div>
                <div class="org-node__info">
                  <div class="org-node__name" style="color:var(--color-text-muted)">Sin Gerente General</div>
                  <div class="org-node__role">Asignar nivel_jerarquico='gerente_general'</div>
                </div>
              </div>
            `}
            <div class="org-tree__line org-tree__line--down"></div>
          </div>

          <!-- DEPARTAMENTOS -->
          <div class="org-tree__level org-tree__level--departamentos">
            ${departamentos.map(dept => {
              const deptEmpleados = empleados.filter(e => e.departamento === dept);
              if (deptEmpleados.length === 0) return '';
              const jefe = getJefeDeDepartamento(dept, empleados);
              const vice = getViceDeDepartamento(dept, jefe, empleados);

              return `
              <div class="org-dept-card" data-dept="${dept}">
                <div class="org-dept-card__header org-dept-card__header--toggle" data-dept-toggle="${dept}">
                  <div>
                    <div class="org-dept-card__name">${dept}</div>
                    <div class="org-dept-card__count">${deptEmpleados.length} empleado${deptEmpleados.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div class="org-dept-card__toggle-icon">▸</div>
                </div>
                ${jefe ? `
                <div class="org-dept-card__jefe org-node--clickable" data-empleado-id="${jefe.id}">
                  <div class="org-node__avatar org-node__avatar--sm" style="width:36px;height:36px">
                    ${jefe.foto_url ? `<img src="${jefe.foto_url}" alt="">` : (jefe.nombre?.[0] || '') + (jefe.apellido?.[0] || '')}
                  </div>
                  <div>
                    <div style="font-weight:var(--font-weight-semibold);font-size:var(--font-size-sm);color:var(--color-text)">${jefe.nombre} ${jefe.apellido}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">${jefe.cargo || 'Encargado'}${jefe.departamento !== dept ? ` · ${jefe.departamento}` : ''}</div>
                  </div>
                </div>` : `
                <div class="org-dept-card__jefe org-dept-card__jefe--empty">
                  <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);font-style:italic">Sin encargado asignado</span>
                </div>`}
                <div class="org-dept-card__members" data-dept-list="${dept}">
                  ${deptEmpleados.map(em => `
                    <div class="org-dept-card__member org-node--clickable" data-empleado-id="${em.id}">
                      <div class="org-node__avatar org-node__avatar--xs" style="width:28px;height:28px">
                        ${em.foto_url ? `<img src="${em.foto_url}" alt="">` : (em.nombre?.[0] || '') + (em.apellido?.[0] || '')}
                      </div>
                      <span style="flex:1">${em.nombre} ${em.apellido}</span>
                      ${jefe && em.id === jefe.id ? '<span class="badge badge--active" style="font-size:9px;margin-left:auto">Encargado</span>' : ''}
                      ${vice && em.id === vice.id ? '<span class="badge badge--info" style="font-size:9px;margin-left:auto">Vice</span>' : ''}
                    </div>
                  `).join('')}
                </div>
              </div>`;
            }).filter(Boolean).join('')}
          </div>
        </div>
      </div>
    </div>`;

  container.innerHTML = html;
  attachEstructuraEvents(container);
}

function attachEstructuraEvents(container) {
  container.querySelectorAll('[data-empleado-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(el.dataset.empleadoId);
      if (id) {
        store.setCurrentEmpleado(id);
        showView('empleado-detalle');
      }
    });
  });

  container.querySelectorAll('[data-dept-toggle]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const dept = el.dataset.deptToggle;
      const card = el.closest('.org-dept-card');
      const members = card?.querySelector(`[data-dept-list="${dept}"]`);
      const icon = el.querySelector('.org-dept-card__toggle-icon');
      if (members) {
        const isOpen = card.classList.contains('org-dept-card--expanded');
        if (isOpen) {
          card.classList.remove('org-dept-card--expanded');
          members.style.maxHeight = '0';
          if (icon) icon.textContent = '▸';
        } else {
          card.classList.add('org-dept-card--expanded');
          members.style.maxHeight = members.scrollHeight + 'px';
          if (icon) icon.textContent = '▾';
        }
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   VISTA: DEPARTAMENTOS (Lista + Encargados)
   ══════════════════════════════════════════════════════════════ */

function renderDepartamentos() {
  const container = document.getElementById('view-organizacion');
  if (!container) return;

  const empleados = getEmpleadosActivos();
  const departamentos = getDepartamentosFromStore(empleados);

  let html = `
    <div class="panel">
      <div class="panel__header">
        <h2 class="panel__title">Departamentos</h2>
      </div>
      <div class="panel__body" style="background:linear-gradient(180deg, var(--color-gray-50) 0%, var(--color-surface) 100%)">
        ${departamentos.map(dept => {
          const members = empleados.filter(e => e.departamento === dept);
          if (members.length === 0) return '';

          const jefe = getJefeDeDepartamento(dept, empleados);
          const vice = getViceDeDepartamento(dept, jefe, empleados);

          return `
          <div class="dept-card" data-dept="${dept}">
            <div class="dept-card__header" style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-4) var(--space-5);background:linear-gradient(135deg, var(--color-navy-900) 0%, var(--color-navy-700) 100%);cursor:pointer;border-bottom:none;position:relative;overflow:hidden" data-dept-toggle="${dept}">
              <div style="position:relative;z-index:1">
                <div style="font-weight:var(--font-weight-bold);color:#fff;font-size:var(--font-size-lg);letter-spacing:0.01em">${dept}</div>
                <div style="font-size:var(--font-size-sm);color:var(--color-navy-300);margin-top:2px">
                  ${jefe ? `Encargado: ${jefe.nombre} ${jefe.apellido}${jefe.departamento !== dept ? ` · ${jefe.departamento}` : ''}` : '<span style="color:var(--color-warning)">Sin encargado</span>'}
                  ${vice ? ` · Vice: ${vice.nombre} ${vice.apellido}` : ''}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:var(--space-3);position:relative;z-index:1">
                <span style="font-size:var(--font-size-xs);color:var(--color-navy-300);display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:var(--color-blue-400)"></span>${members.length} empleado${members.length !== 1 ? 's' : ''}</span>
                ${store.hasRole('admin') ? '<button class="btn btn--sm btn-asignar-jefe" data-dept="' + dept + '" style="background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.2);backdrop-filter:blur(4px)">Asignar</button>' : ''}
                <span class="dept-toggle-icon" style="transition:transform var(--transition-base);font-size:var(--font-size-sm);color:rgba(255,255,255,0.5)">▼</span>
              </div>
              <div style="position:absolute;top:-20px;right:-20px;width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.04)"></div>
            </div>
            <div class="dept-card__members" style="display:none;padding:0" data-dept-list="${dept}">
              ${members.map(em => `
              <div class="dept-card__row org-node--clickable" data-empleado-id="${em.id}">
                <div class="org-node__avatar org-node__avatar--sm" style="width:34px;height:34px">
                  ${em.foto_url ? `<img src="${em.foto_url}" alt="">` : (em.nombre?.[0] || '') + (em.apellido?.[0] || '')}
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font-weight:var(--font-weight-medium);font-size:var(--font-size-sm);color:var(--color-text)">${em.nombre} ${em.apellido}</div>
                  <div style="font-size:var(--font-size-xs);color:var(--color-text-secondary)">${em.cargo || 'Sin cargo'}</div>
                </div>
                <div style="display:flex;gap:var(--space-2)">
                  ${jefe && em.id === jefe.id ? '<span class="badge badge--active" style="font-size:var(--font-size-xs)">Encargado</span>' : ''}
                  ${vice && em.id === vice.id ? '<span class="badge badge--info" style="font-size:var(--font-size-xs)">Vice</span>' : ''}
                </div>
              </div>`).join('')}
            </div>
          </div>`;
        }).filter(Boolean).join('')}
      </div>
    </div>`;

  container.innerHTML = html;

  container.querySelectorAll('[data-dept-toggle]').forEach(el => {
    el.addEventListener('click', () => {
      const dept = el.dataset.deptToggle;
      const list = container.querySelector(`[data-dept-list="${dept}"]`);
      const icon = el.querySelector('.dept-toggle-icon');
      if (list) {
        const isOpen = list.style.display !== 'none';
        list.style.display = isOpen ? 'none' : 'block';
        if (icon) icon.style.transform = isOpen ? '' : 'rotate(180deg)';
      }
    });
  });

  container.querySelectorAll('.btn-asignar-jefe').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openAsignarModal(btn.dataset.dept);
    });
  });

  container.querySelectorAll('[data-empleado-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(el.dataset.empleadoId);
      if (id) {
        store.setCurrentEmpleado(id);
        showView('empleado-detalle');
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   MODAL: ASIGNAR ENCARGADO / VICE (buscador global)
   ══════════════════════════════════════════════════════════════ */

let currentAsignarDept = null;

function openAsignarModal(dept) {
  currentAsignarDept = dept;
  const modal = document.getElementById('org-modal');
  if (!modal) return;

  document.getElementById('org-modal-title').textContent = `Asignar Encargado - ${dept}`;

  const empleados = getEmpleadosActivos();
  const jefe = getJefeDeDepartamento(dept, empleados);
  const vice = getViceDeDepartamento(dept, jefe, empleados);

  const jefeSearch = document.getElementById('org-jefe-search');
  const jefeId = document.getElementById('org-jefe-id');
  const jefeSelected = document.getElementById('org-jefe-selected');
  const jefeResults = document.getElementById('org-jefe-results');

  const viceSearch = document.getElementById('org-vice-search');
  const viceId = document.getElementById('org-vice-id');
  const viceSelected = document.getElementById('org-vice-selected');
  const viceResults = document.getElementById('org-vice-results');

  if (jefe) {
    jefeSearch.value = '';
    jefeId.value = jefe.id;
    jefeSelected.style.display = 'flex';
    jefeSelected.innerHTML = `<span>${formatEmpOption(jefe)}</span><button type="button" class="autocomplete-clear" data-clear="jefe">&times;</button>`;
    jefeSearch.placeholder = 'Cambiar encargado...';
  } else {
    jefeSearch.value = '';
    jefeId.value = '';
    jefeSelected.style.display = 'none';
    jefeSelected.innerHTML = '';
    jefeSearch.placeholder = 'Buscar por nombre o cédula...';
  }

  if (vice) {
    viceSearch.value = '';
    viceId.value = vice.id;
    viceSelected.style.display = 'flex';
    viceSelected.innerHTML = `<span>${formatEmpOption(vice)}</span><button type="button" class="autocomplete-clear" data-clear="vice">&times;</button>`;
    viceSearch.placeholder = 'Cambiar vice...';
  } else {
    viceSearch.value = '';
    viceId.value = '';
    viceSelected.style.display = 'none';
    viceSelected.innerHTML = '';
    viceSearch.placeholder = 'Buscar por nombre o cédula...';
  }

  jefeResults.style.display = 'none';
  jefeResults.innerHTML = '';
  viceResults.style.display = 'none';
  viceResults.innerHTML = '';

  document.getElementById('org-modal-error').textContent = '';
  modal.style.display = 'flex';

  jefeSearch.focus();
}

function closeOrgModal() {
  document.getElementById('org-modal').style.display = 'none';
  currentAsignarDept = null;
}

function setupAutocomplete(searchId, resultsId, selectedId, hiddenId) {
  const search = document.getElementById(searchId);
  const results = document.getElementById(resultsId);
  const selected = document.getElementById(selectedId);
  const hidden = document.getElementById(hiddenId);
  if (!search || !results) return;

  const allEmpleados = getEmpleadosActivos();

  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    if (query.length < 2) {
      results.style.display = 'none';
      results.innerHTML = '';
      return;
    }

    const matches = allEmpleados.filter(e => {
      const text = `${e.nombre} ${e.apellido} ${e.cedula || ''}`.toLowerCase();
      return text.includes(query);
    }).slice(0, 10);

    if (matches.length === 0) {
      results.style.display = 'none';
      results.innerHTML = '';
      return;
    }

    results.innerHTML = matches.map(e => `
      <div class="autocomplete-item" data-id="${e.id}">
        <div class="org-node__avatar org-node__avatar--xs">
          ${e.foto_url ? `<img src="${e.foto_url}" alt="">` : (e.nombre?.[0] || '') + (e.apellido?.[0] || '')}
        </div>
        <div>
          <div style="font-weight:var(--font-weight-medium);font-size:var(--font-size-sm)">${e.nombre} ${e.apellido}</div>
          <div style="font-size:var(--font-size-xs);color:var(--color-text-muted)">${e.cedula || 'S/C'} · ${e.departamento || 'S/D'}</div>
        </div>
      </div>
    `).join('');

    results.style.display = 'block';

    results.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', () => {
        const emp = allEmpleados.find(e => e.id === parseInt(item.dataset.id));
        if (!emp) return;
        hidden.value = emp.id;
        search.value = '';
        results.style.display = 'none';
        results.innerHTML = '';
        selected.style.display = 'flex';
        selected.innerHTML = `<span>${formatEmpOption(emp)}</span><button type="button" class="autocomplete-clear" data-clear="${searchId === 'org-jefe-search' ? 'jefe' : 'vice'}">&times;</button>`;
        search.placeholder = 'Cambiar...';
        selected.querySelector('.autocomplete-clear').addEventListener('click', (ev) => {
          ev.stopPropagation();
          hidden.value = '';
          selected.style.display = 'none';
          selected.innerHTML = '';
          search.value = '';
          search.placeholder = searchId === 'org-jefe-search'
            ? 'Buscar por nombre o cédula...'
            : 'Buscar por nombre o cédula...';
        });
      });
    });
  });

  search.addEventListener('focus', () => {
    if (search.value.trim().length >= 2) {
      search.dispatchEvent(new Event('input'));
    }
  });

  document.addEventListener('click', (e) => {
    if (!search.contains(e.target) && !results.contains(e.target) && !selected.contains(e.target)) {
      results.style.display = 'none';
    }
  });

  selected.querySelector('.autocomplete-clear')?.addEventListener('click', (ev) => {
    ev.stopPropagation();
    hidden.value = '';
    selected.style.display = 'none';
    selected.innerHTML = '';
    search.value = '';
    search.placeholder = searchId === 'org-jefe-search'
      ? 'Buscar por nombre o cédula...'
      : 'Buscar por nombre o cédula...';
  });
}

async function saveAsignarJefe() {
  if (!currentAsignarDept) return;

  const jefeId = parseInt(document.getElementById('org-jefe-id').value) || null;
  const viceId = parseInt(document.getElementById('org-vice-id').value) || null;
  const errorEl = document.getElementById('org-modal-error');

  const empleados = getEmpleadosActivos().filter(e => e.departamento === currentAsignarDept);

  try {
    for (const em of empleados) {
      let updates = {};

      if (em.id === jefeId) {
        updates.nivel_jerarquico = 'encargado_departamento';
        updates.jefe_id = null;
      } else if (em.id === viceId) {
        updates.nivel_jerarquico = 'empleado';
        updates.jefe_id = jefeId;
      } else {
        updates.nivel_jerarquico = 'empleado';
        updates.jefe_id = jefeId;
      }

      if (Object.keys(updates).length > 0) {
        await store.updateEmpleado(em.id, updates);
      }
    }

    closeOrgModal();
    if (orgSubView === 'departamentos') renderDepartamentos();
    else renderEstructura();
  } catch (err) {
    errorEl.textContent = err.message;
  }
}

export function initOrganizacion() {
  document.getElementById('org-modal-close')?.addEventListener('click', closeOrgModal);
  document.getElementById('org-modal-cancel')?.addEventListener('click', closeOrgModal);
  document.getElementById('org-modal-save')?.addEventListener('click', saveAsignarJefe);
  document.getElementById('org-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeOrgModal();
  });

  setupAutocomplete('org-jefe-search', 'org-jefe-results', 'org-jefe-selected', 'org-jefe-id');
  setupAutocomplete('org-vice-search', 'org-vice-results', 'org-vice-selected', 'org-vice-id');
}
