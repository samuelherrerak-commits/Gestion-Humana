let auditoriaInitialized = false;

export async function initAuditoriaModule(container) {
  if (auditoriaInitialized) return;

  try {
    const { initApp, showView } = await import('../auditoria/ui/app.js');
    const { store } = await import('../auditoria/engine/store.js');
    const { checkAuth, onAuthenticated } = await import('../auditoria/ui/auth.js');

    initApp();
    auditoriaInitialized = true;
  } catch (e) {
    console.error('[Auditoria] init error:', e);
    container.innerHTML = `<div class="empty-state">
      <h3>Error al cargar módulo de Auditoría</h3>
      <p class="text-danger">${e.message}</p>
    </div>`;
  }
}

export async function showAuditoriaSection(section) {
  try {
    const { showView } = await import('../auditoria/ui/app.js');
    const viewMap = {
      'modulos': 'dashboard',
      'plan': 'plan-accion',
      'historial': 'historial'
    };
    showView(viewMap[section] || 'dashboard');
  } catch (e) {
    console.error('[Auditoria] showSection error:', e);
  }
}
