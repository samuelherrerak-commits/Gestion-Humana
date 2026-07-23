const API_BASE = '';

function getToken() {
  return sessionStorage.getItem('auth_token');
}

function setToken(token) {
  if (token) sessionStorage.setItem('auth_token', token);
  else sessionStorage.removeItem('auth_token');
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
  register: (data) => request('POST', '/api/register', data),
  login: (data) => request('POST', '/api/login', data),
  loginCedula: (cedula) => request('POST', '/api/login-cedula', { cedula }),
  me: () => request('GET', '/api/me'),

  getEmpleados: () => request('GET', '/api/empleados'),
  getEmpleado: (id) => request('GET', `/api/empleados/${id}`),
  createEmpleado: (data) => request('POST', '/api/empleados', data),
  updateEmpleado: (id, data) => request('PATCH', `/api/empleados/${id}`, data),
  deleteEmpleado: (id) => request('DELETE', `/api/empleados/${id}`),

  getDocumentos: (empleadoId) => request('GET', `/api/documentos${empleadoId ? '?empleado_id=' + empleadoId : ''}`),
  createDocumento: (data) => request('POST', '/api/documentos', data),
  uploadDocumento: async (formData) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error subiendo archivo');
    return json;
  },
  deleteDocumento: (id) => request('DELETE', `/api/documentos/${id}`),

  getVacaciones: (empleadoId) => request('GET', `/api/vacaciones${empleadoId ? '?empleado_id=' + empleadoId : ''}`),
  createVacacion: (data) => request('POST', '/api/vacaciones', data),
  updateVacacion: (id, data) => request('PATCH', `/api/vacaciones/${id}`, data),

  getVacacionesHistorial: (empleadoId) => request('GET', `/api/vacaciones-historial${empleadoId ? '?empleado_id=' + empleadoId : ''}`),
  updateVacacionesHistorial: (id, data) => request('PATCH', `/api/vacaciones-historial/${id}`, data),
  batchUpdateVacacionesHistorial: (updates) => request('POST', '/api/vacaciones-historial/batch', { updates }),

  getConstancias: (empleadoId) => request('GET', `/api/constancias${empleadoId ? '?empleado_id=' + empleadoId : ''}`),
  createConstancia: (data) => request('POST', '/api/constancias', data),

  getFideicomisoAportes: (empleadoId) => request('GET', `/api/fideicomiso/aportes${empleadoId ? '?empleado_id=' + empleadoId : ''}`),
  createAporteFideicomiso: (data) => request('POST', '/api/fideicomiso/aportes', data),
  batchUpsertAportesFideicomiso: (aportes) => request('POST', '/api/fideicomiso/aportes/batch', { aportes }),
  getFideicomisoSolicitudes: (empleadoId) => request('GET', `/api/fideicomiso/solicitudes${empleadoId ? '?empleado_id=' + empleadoId : ''}`),
  createSolicitudFideicomiso: (data) => request('POST', '/api/fideicomiso/solicitudes', data),
  updateSolicitudFideicomiso: (id, data) => request('PATCH', `/api/fideicomiso/solicitudes/${id}`, data),

  setToken,
  getToken,
  isAuthenticated: () => !!getToken()
};
