import { store } from '../engine/store.js';

export function initSidebar() {
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    window.__doLogout();
  });
}

export function initSidebarCollapse() {
  const btn = document.getElementById('sidebar-collapse');
  const sidebar = document.getElementById('sidebar');
  if (!btn || !sidebar) return;

  const collapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  if (collapsed) sidebar.classList.add('sidebar--collapsed');
  updateCollapseBtn();

  btn.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar--collapsed');
    localStorage.setItem('sidebar_collapsed', sidebar.classList.contains('sidebar--collapsed'));
    updateCollapseBtn();
  });
}

function updateCollapseBtn() {
  const sidebar = document.getElementById('sidebar');
  const btn = document.getElementById('sidebar-collapse');
  if (!sidebar || !btn) return;
  const collapsed = sidebar.classList.contains('sidebar--collapsed');
  btn.innerHTML = collapsed
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M13 5l7 7-7 7"/><path d="M6 5l7 7-7 7"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 19l-7-7 7-7"/><path d="M18 19l-7-7 7-7"/></svg>';
}

export function updateSidebarActive(view) {
  document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector(`.sidebar__link[data-view="${view}"]`);
  if (activeLink) activeLink.classList.add('active');
}
