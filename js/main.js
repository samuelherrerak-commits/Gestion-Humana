import { initApp, showView } from './ui/app.js';
import { renderDashboard } from './ui/dashboard.js';
import { store } from './engine/store.js';
import { checkAuth, onAuthenticated, logout } from './ui/auth.js';

const overlay = document.getElementById('auth-overlay');

async function startApp() {
  console.log('[Sistema RRHH] Iniciando...');
  await store.init();

  if (!store.state.authUser) {
    console.warn('[Sistema RRHH] Sin sesi\u00F3n v\u00E1lida, mostrando login.');
    overlay.style.display = 'flex';
    return;
  }

  overlay.style.display = 'none';
  initApp();

  const savedView = store.state.ui.currentView || 'dashboard';
  console.log('[Sistema RRHH] Vista guardada:', savedView, '| raw currentView:', store.state.ui.currentView);
  showView(savedView);

  console.log('[Sistema RRHH] Listo. Vista:', savedView);
}

document.addEventListener('DOMContentLoaded', () => {
  window.__doLogout = logout;

  if (checkAuth()) {
    startApp();
  } else {
    overlay.style.display = 'flex';
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
