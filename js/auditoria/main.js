import { initApp, showView } from './ui/app.js';
import { initEvidenceModal } from './ui/evidence-modal.js';
import { renderDashboard } from './ui/dashboard.js';
import { pubsub } from './utils/pubsub.js';
import { EVENT } from './constants.js';
import { checkAuth, onAuthenticated } from './ui/auth.js';
import { store } from './engine/store.js';

async function startApp() {
  console.log('[Auditoría RRHH] Iniciando sistema...');
  await store.init();
  initApp();
  initEvidenceModal();
  renderDashboard();
  console.log('[Auditoría RRHH] Sistema listo.');
}

document.addEventListener('DOMContentLoaded', () => {
  onAuthenticated(startApp);
  checkAuth();
});

import { auditEngine } from './engine/audit-engine.js';
import { getAllRequisitos } from './data/index.js';

window.__audit = {
  store,
  auditEngine,
  getAllRequisitos,
  showView
};
