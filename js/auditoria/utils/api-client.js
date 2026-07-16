const API_BASE = '';

function getToken() {
  return localStorage.getItem('auth_token');
}

function setToken(token) {
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body && method !== 'GET') opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

export const api = {
  // Auth
  register: (data) => request('POST', '/api/register', data),
  login: (data) => request('POST', '/api/login', data),
  me: () => request('GET', '/api/me'),

  // Empresas
  getEmpresas: () => request('GET', '/api/empresas'),

  // Requisitos
  getRequisitos: () => request('GET', '/api/requisitos'),

  // Auditorías
  getAuditorias: () => request('GET', '/api/auditorias'),
  getAuditoria: (id) => request('GET', `/api/auditorias/${id}`),
  createAuditoria: (data) => request('POST', '/api/auditorias', data),
  updateAuditoria: (id, data) => request('PATCH', `/api/auditorias/${id}`, data),
  deleteAuditoria: (id) => request('DELETE', `/api/auditorias/${id}`),

  // Respuestas
  getRespuestas: (auditoria_id) => request('GET', `/api/respuestas?auditoria_id=${auditoria_id}`),
  createRespuesta: (data) => request('POST', '/api/respuestas', data),
  updateRespuesta: (id, data) => request('PATCH', `/api/respuestas/${id}`, data),
  upsertRespuesta: (data) => request('PUT', '/api/respuestas/upsert', data),

  // Evidencias
  createEvidencia: (data) => request('POST', '/api/evidencias', data),

  // Plan de Acción
  getPlanAccion: (auditoria_id) => request('GET', `/api/plan-accion?auditoria_id=${auditoria_id}`),
  createPlanAccion: (data) => request('POST', '/api/plan-accion', data),
  updatePlanAccion: (id, data) => request('PATCH', `/api/plan-accion/${id}`, data),

  // Informes
  createInforme: (data) => request('POST', '/api/informes', data),
  getInformes: (auditoria_id) => request('GET', `/api/informes?auditoria_id=${auditoria_id}`),

  // Token helpers
  setToken,
  getToken,
  isAuthenticated: () => !!getToken()
};
