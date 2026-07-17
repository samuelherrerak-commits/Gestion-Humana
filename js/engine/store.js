import { pubsub } from '../utils/pubsub.js';
import { EVENT, STORE_KEY } from '../constants.js';
import { api } from '../utils/api-client.js';

function createInitialState() {
  return {
    authUser: null,
    empleados: [],
    documentos: [],
    vacaciones: [],
    vacacionesHistorial: [],
    constancias: [],
    fideicomisoAportes: [],
    fideicomisoSolicitudes: [],
    ui: {
      currentView: 'dashboard',
      currentEmpleadoId: null
    }
  };
}

function saveToStorage(state) {
  try {
    const toSave = {
      empleados: state.empleados,
      documentos: state.documentos,
      vacaciones: state.vacaciones,
      vacacionesHistorial: state.vacacionesHistorial,
      constancias: state.constancias,
      fideicomisoAportes: state.fideicomisoAportes,
      fideicomisoSolicitudes: state.fideicomisoSolicitudes,
      ui: state.ui
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('[Store] localStorage error:', e);
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[Store] localStorage read error:', e);
  }
  return null;
}

let syncTimer = null;
function debounceSync(fn, delay = 2000) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(fn, delay);
}

class Store {
  constructor() {
    const saved = loadFromStorage();
    const initial = createInitialState();
    if (saved) {
      initial.empleados = saved.empleados || [];
      initial.documentos = saved.documentos || [];
      initial.vacaciones = saved.vacaciones || [];
      initial.vacacionesHistorial = saved.vacacionesHistorial || [];
      initial.constancias = saved.constancias || [];
      initial.fideicomisoAportes = saved.fideicomisoAportes || [];
      initial.fideicomisoSolicitudes = saved.fideicomisoSolicitudes || [];
      initial.ui = saved.ui || initial.ui;
    }
    this.state = this._createReactive(initial);
  }

  async init() {
    if (!api.isAuthenticated()) return;
    try {
      const user = await api.me();
      this.state.authUser = user;
    } catch (e) {
      console.warn('[Store] auth error:', e);
      api.setToken(null);
      return;
    }
    await this.syncFromSupabase();
    pubsub.emit(EVENT.STATE_CHANGED, { prop: 'init', value: true });
    pubsub.emit(EVENT.DASHBOARD_UPDATED, {});
  }

  async syncFromSupabase() {
    try {
      const results = await Promise.allSettled([
        api.getEmpleados(),
        api.getDocumentos(),
        api.getVacaciones(),
        api.getVacacionesHistorial(),
        api.getConstancias(),
        api.getFideicomisoAportes(),
        api.getFideicomisoSolicitudes()
      ]);
      const [emplR, docR, vacR, vacHistR, conR, fidAptR, fidSolR] = results;
      if (emplR.status === 'fulfilled' && Array.isArray(emplR.value)) this.state.empleados = emplR.value;
      else console.warn('[Store] sync empleados error:', emplR.reason?.message || emplR.reason);
      if (docR.status === 'fulfilled' && Array.isArray(docR.value)) this.state.documentos = docR.value;
      else console.warn('[Store] sync documentos error:', docR.reason?.message || docR.reason);
      if (vacR.status === 'fulfilled' && Array.isArray(vacR.value)) this.state.vacaciones = vacR.value;
      else console.warn('[Store] sync vacaciones error:', vacR.reason?.message || vacR.reason);
      if (vacHistR.status === 'fulfilled' && Array.isArray(vacHistR.value)) this.state.vacacionesHistorial = vacHistR.value;
      else console.warn('[Store] sync vacacionesHistorial error:', vacHistR.reason?.message || vacHistR.reason);
      if (conR.status === 'fulfilled' && Array.isArray(conR.value)) this.state.constancias = conR.value;
      else console.warn('[Store] sync constancias error:', conR.reason?.message || conR.reason);
      if (fidAptR.status === 'fulfilled' && Array.isArray(fidAptR.value)) this.state.fideicomisoAportes = fidAptR.value;
      else console.warn('[Store] sync fideicomisoAportes error:', fidAptR.reason?.message || fidAptR.reason);
      if (fidSolR.status === 'fulfilled' && Array.isArray(fidSolR.value)) this.state.fideicomisoSolicitudes = fidSolR.value;
      else console.warn('[Store] sync fideicomisoSolicitudes error:', fidSolR.reason?.message || fidSolR.reason);
      saveToStorage(this.state);
    } catch (e) {
      console.warn('[Store] sync error:', e);
    }
  }

  _createReactive(initial) {
    const self = this;
    return new Proxy(initial, {
      set(target, prop, value) {
        target[prop] = value;
        self._notify(prop);
        saveToStorage(target);
        return true;
      },
      get(target, prop) { return target[prop]; }
    });
  }

  _notify(prop) {
    setTimeout(() => {
      if (prop === 'empleados') pubsub.emit(EVENT.EMPLOYEES_UPDATED, {});
      else if (prop === 'documentos') pubsub.emit(EVENT.DOCUMENTS_UPDATED, {});
      else if (prop === 'vacaciones' || prop === 'vacacionesHistorial') pubsub.emit(EVENT.VACATIONS_UPDATED, {});
      else if (prop === 'constancias') pubsub.emit(EVENT.CERTIFICATES_UPDATED, {});
      else if (prop === 'fideicomisoAportes' || prop === 'fideicomisoSolicitudes') pubsub.emit(EVENT.FIDEICOMISO_UPDATED, {});
      pubsub.emit(EVENT.DASHBOARD_UPDATED, {});
      pubsub.emit(EVENT.STATE_CHANGED, { prop });
    }, 0);
  }

  setCurrentView(view) {
    this.state.ui.currentView = view;
    pubsub.emit(EVENT.VIEW_CHANGED, { view });
    saveToStorage(this.state);
  }

  setCurrentEmpleado(id) {
    this.state.ui.currentEmpleadoId = id;
    saveToStorage(this.state);
  }

  getEmpleadoById(id) {
    return (Array.isArray(this.state.empleados) ? this.state.empleados : []).find(e => e.id === id) || null;
  }

  hasRole(...roles) {
    return roles.includes(this.state.authUser?.rol);
  }

  getEmpleadosByGerente(gerenteId) {
    return (Array.isArray(this.state.empleados) ? this.state.empleados : [])
      .filter(e => e.jefe_id === gerenteId && e.estatus === 'activo');
  }

  getDocumentosByEmpleado(empleadoId) {
    return (Array.isArray(this.state.documentos) ? this.state.documentos : []).filter(d => d.empleado_id === empleadoId);
  }

  getVacacionesByEmpleado(empleadoId) {
    return (Array.isArray(this.state.vacaciones) ? this.state.vacaciones : []).filter(v => v.empleado_id === empleadoId);
  }

  getHistorialByEmpleado(empleadoId) {
    return (Array.isArray(this.state.vacacionesHistorial) ? this.state.vacacionesHistorial : []).filter(h => h.empleado_id === empleadoId);
  }

  getConstanciasByEmpleado(empleadoId) {
    return (Array.isArray(this.state.constancias) ? this.state.constancias : []).filter(c => c.empleado_id === empleadoId);
  }

  getDiasUsadosVacaciones(empleadoId) {
    return (Array.isArray(this.state.vacaciones) ? this.state.vacaciones : [])
      .filter(v => v.empleado_id === empleadoId && v.estatus === 'aprobado')
      .reduce((sum, v) => sum + (v.dias_solicitados || 0), 0);
  }

  async addEmpleado(data) {
    const created = await api.createEmpleado(data);
    this.state.empleados = [...this.state.empleados, created];
    return created;
  }

  async updateEmpleado(id, data) {
    const updated = await api.updateEmpleado(id, data);
    this.state.empleados = this.state.empleados.map(e => e.id === id ? updated : e);
    return updated;
  }

  async deleteEmpleado(id) {
    await api.deleteEmpleado(id);
    this.state.empleados = this.state.empleados.filter(e => e.id !== id);
    this.state.documentos = this.state.documentos.filter(d => d.empleado_id !== id);
    this.state.vacaciones = this.state.vacaciones.filter(v => v.empleado_id !== id);
    this.state.constancias = this.state.constancias.filter(c => c.empleado_id !== id);
  }

  async addDocumento(data) {
    const created = await api.createDocumento(data);
    this.state.documentos = [...this.state.documentos, created];
    return created;
  }

  async uploadDocumento(formData) {
    const created = await api.uploadDocumento(formData);
    this.state.documentos = [...this.state.documentos, created];
    return created;
  }

  async deleteDocumento(id) {
    await api.deleteDocumento(id);
    this.state.documentos = this.state.documentos.filter(d => d.id !== id);
  }

  async addVacacion(data) {
    const created = await api.createVacacion(data);
    this.state.vacaciones = [...this.state.vacaciones, created];
    return created;
  }

  async updateVacacion(id, data) {
    const updated = await api.updateVacacion(id, data);
    this.state.vacaciones = this.state.vacaciones.map(v => v.id === id ? updated : v);
    return updated;
  }

  async addConstancia(data) {
    const created = await api.createConstancia(data);
    this.state.constancias = [...this.state.constancias, created];
    return created;
  }

  async updateHistorialRecord(id, fields) {
    const updated = await api.updateVacacionesHistorial(id, fields);
    this.state.vacacionesHistorial = this.state.vacacionesHistorial.map(h => h.id === id ? updated : h);
    return updated;
  }

  async batchUpdateHistorial(updates) {
    const results = await api.batchUpdateVacacionesHistorial(updates);
    const updatedMap = new Map(results.map(r => [r.id, r]));
    this.state.vacacionesHistorial = this.state.vacacionesHistorial.map(h => updatedMap.get(h.id) || h);
    return results;
  }

  async updateEmpleadoSaldo(empleadoId, saldo, correspondientes, disfrutados) {
    const payload = { vacaciones_saldo: saldo };
    if (correspondientes !== undefined) payload.vacaciones_correspondientes = correspondientes;
    if (disfrutados !== undefined) payload.vacaciones_disfrutadas = disfrutados;
    const updated = await api.updateEmpleado(empleadoId, payload);
    this.state.empleados = this.state.empleados.map(e => e.id === empleadoId ? updated : e);
    return updated;
  }

  /* ──── FIDEICOMISO ──── */

  getAportesByEmpleado(empleadoId) {
    return (Array.isArray(this.state.fideicomisoAportes) ? this.state.fideicomisoAportes : [])
      .filter(a => a.empleado_id === empleadoId);
  }

  getSolicitudesByEmpleado(empleadoId) {
    return (Array.isArray(this.state.fideicomisoSolicitudes) ? this.state.fideicomisoSolicitudes : [])
      .filter(s => s.empleado_id === empleadoId);
  }

  getSaldoFideicomiso(empleadoId) {
    return this.getAportesByEmpleado(empleadoId).reduce((sum, a) => sum + Number(a.monto || 0), 0);
  }

  async addAporteFideicomiso(data) {
    const created = await api.createAporteFideicomiso(data);
    const existing = this.state.fideicomisoAportes.find(a => a.empleado_id === created.empleado_id && a.trimestre === created.trimestre && a.anio === created.anio);
    if (existing) {
      this.state.fideicomisoAportes = this.state.fideicomisoAportes.map(a => a.id === existing.id ? created : a);
    } else {
      this.state.fideicomisoAportes = [...this.state.fideicomisoAportes, created];
    }
    return created;
  }

  async batchUpsertAportes(aportes) {
    const results = await api.batchUpsertAportesFideicomiso(aportes);
    let current = [...this.state.fideicomisoAportes];
    for (const created of results) {
      const idx = current.findIndex(a => a.empleado_id === created.empleado_id && a.trimestre === created.trimestre && a.anio === created.anio);
      if (idx >= 0) current[idx] = created;
      else current.push(created);
    }
    this.state.fideicomisoAportes = current;
    return results;
  }

  async addSolicitudFideicomiso(data) {
    const created = await api.createSolicitudFideicomiso(data);
    this.state.fideicomisoSolicitudes = [...this.state.fideicomisoSolicitudes, created];
    return created;
  }

  async updateSolicitudFideicomiso(id, data) {
    const updated = await api.updateSolicitudFideicomiso(id, data);
    this.state.fideicomisoSolicitudes = this.state.fideicomisoSolicitudes.map(s => s.id === id ? updated : s);
    return updated;
  }

  determineVacacionCondition(empleadoId, periodo) {
    const vacs = (Array.isArray(this.state.vacaciones) ? this.state.vacaciones : []);
    const yaPagado = vacs.some(v =>
      v.empleado_id === empleadoId &&
      v.periodo === periodo &&
      v.estatus === 'aprobado' &&
      v.condicion === 'pago'
    );
    return yaPagado ? 'disfrute' : 'pago';
  }

  exportState() {
    return JSON.parse(JSON.stringify(this.state));
  }
}

export const store = new Store();
