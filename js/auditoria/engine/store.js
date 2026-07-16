import { pubsub } from '../utils/pubsub.js';
import { MODULES } from '../data/index.js';
import { EVENT, STORE_KEY, AUDITORIA_ESTADO } from '../constants.js';
import { api } from '../utils/api-client.js';
import { auditEngine } from './audit-engine.js';

function createInitialState() {
  const requisitos = {};
  MODULES.forEach(mod => {
    mod.categoria.forEach(cat => {
      cat.items.forEach(item => {
        requisitos[item.codigo] = {
          status: item.status || null,
          evidencia: item.evidencia || null,
          evidenciaStatus: item.evidenciaStatus || null,
          observaciones: item.observaciones || '',
          fechaVencimiento: item.fechaVencimiento || null,
          fechaRevision: item.fechaRevision || null,
          auditorResponsable: item.auditorResponsable || '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null,
            recomendacion: '', responsableAccion: '', fechaCompromiso: null,
            costoEstimado: null, prioridad: null, estadoPlan: 'abierto',
            ...(item.hallazgo || {}) }
        };
      });
    });
  });
  return {
    authUser: null,
    infoEmpresa: {
      razonSocial: '', rif: '', actividadEconomica: '',
      tieneSucursales: null, numTrabajadores: null,
      trabajadoresExtranjeros: false, adolescentesAprendices: false,
      trabajadoresDiscapacidad: false, contratistas: false,
      tercerizados: false, sindicato: false
    },
    requisitos,
    ui: { currentView: 'dashboard', currentModule: null, currentCategoria: null },
    auditoria: {
      id: null, nombre: 'Auditoría Inicial',
      fechaCreacion: new Date().toISOString(), fechaCierre: null,
      auditor: '', estado: AUDITORIA_ESTADO.EN_PROGRESO
    }
  };
}

function saveToStorage(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) { console.warn('[Store] localStorage error:', e); }
}

let supabaseSyncTimer = null;
function debounceSyncToSupabase(state) {
  if (supabaseSyncTimer) clearTimeout(supabaseSyncTimer);
  supabaseSyncTimer = setTimeout(() => syncToSupabase(state), 2000);
}

async function syncToSupabase(state) {
  const aud = state.auditoria;
  if (!aud || !aud.id) return;
  try {
    for (const [codigo, req] of Object.entries(state.requisitos)) {
      if (req.status && req.status !== 'pendiente') {
        await api.upsertRespuesta({
          auditoria_id: aud.id,
          requisito_codigo: codigo,
          cumplimiento: req.status,
          observacion: req.observaciones || '',
          fecha_vencimiento: req.fechaVencimiento || null
        });
      }
    }
  } catch (e) {
    console.warn('[Store] Supabase sync error:', e);
  }
}

async function ensureAuditoria(state) {
  try {
    const auditorias = await api.getAuditorias();
    if (auditorias && auditorias.length > 0) {
      const aud = auditorias[0];
      state.auditoria.id = aud.id;
      state.auditoria.nombre = aud.nombre;
      state.auditoria.estado = aud.estado === 'finalizada' ? AUDITORIA_ESTADO.FINALIZADA : AUDITORIA_ESTADO.EN_PROGRESO;
      state.auditoria.fechaCreacion = aud.fecha_apertura;
      state.auditoria.fechaCierre = aud.fecha_cierre;
      state.auditoria.fechaEstimadaCierre = aud.fecha_estimada_cierre;
      state.auditoria.puntaje_lcs = aud.puntaje_lcs;
      state.auditoria.puntaje_isl = aud.puntaje_isl;
      state.auditoria.clase_lcs = aud.clase_lcs;

      const me = await api.me();
      if (aud.empresa_id === me.empresa_id && me.empresa_id) {
        const empresas = await api.getEmpresas();
        const emp = empresas.find(e => e.id === me.empresa_id);
        if (emp) {
          state.infoEmpresa.razonSocial = emp.nombre;
          state.infoEmpresa.rif = emp.rif || '';
        }
      }

      const respuestas = await api.getRespuestas(aud.id);
      for (const r of respuestas) {
        const codigo = r.requisito_codigo;
        if (state.requisitos[codigo]) {
          state.requisitos[codigo].status = r.cumplimiento === 'pendiente' ? null : r.cumplimiento;
          state.requisitos[codigo].observaciones = r.observacion || '';
          state.requisitos[codigo].fechaVencimiento = r.fecha_vencimiento || null;
        }
      }
    } else {
      const me = await api.me();
      const created = await api.createAuditoria({
        nombre: state.auditoria.nombre,
        empresa_id: me.empresa_id || undefined
      });
      state.auditoria.id = created.id;
    }
  } catch (e) {
    console.warn('[Store] Supabase init error:', e);
  }
}

class Store {
  constructor() {
    this.state = this._createReactive(createInitialState());
    this._ready = false;
  }

  async init() {
    if (!api.isAuthenticated()) return;
    this._ready = true;
    await ensureAuditoria(this.state);
    pubsub.emit(EVENT.STATE_CHANGED, { prop: 'init', value: true });
    pubsub.emit(EVENT.DASHBOARD_UPDATED, {});
  }

  _createReactive(initial) {
    const self = this;
    return new Proxy(initial, {
      set(target, prop, value) {
        const old = target[prop];
        target[prop] = value;
        if (prop === 'requisitos') {
          self._notify(EVENT.STATE_CHANGED, { prop, value });
          self._notify(EVENT.DASHBOARD_UPDATED, {});
          debounceSyncToSupabase(self.state);
        } else if (prop === 'infoEmpresa') {
          self._notify(EVENT.STATE_CHANGED, { prop, value });
        }
        saveToStorage(self.state);
        return true;
      },
      get(target, prop) { return target[prop]; }
    });
  }

  _notify(event, data) {
    setTimeout(() => pubsub.emit(event, data), 0);
  }

  getRequisitoState(codigo) {
    return this.state.requisitos[codigo] || null;
  }

  setRequisitoStatus(codigo, status) {
    if (!this.state.requisitos[codigo]) {
      this.state.requisitos[codigo] = {
        status: null, evidencia: null, evidenciaStatus: null,
        observaciones: '', fechaVencimiento: null, fechaRevision: null,
        auditorResponsable: '', hallazgo: { descripcion: '', nivelRiesgoHallazgo: null,
          recomendacion: '', responsableAccion: '', fechaCompromiso: null,
          costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
      };
    }
    this.state.requisitos[codigo].status = status;
    this._notify(EVENT.STATUS_CHANGED, { codigo, status });
    this._notify(EVENT.DASHBOARD_UPDATED, {});
    debounceSyncToSupabase(this.state);
    saveToStorage(this.state);
  }

  setRequisitoEvidencia(codigo, fileData) {
    const req = this.state.requisitos[codigo];
    if (req) {
      req.evidencia = fileData;
      req.evidenciaStatus = 'validado';
      this._notify(EVENT.EVIDENCE_CHANGED, { codigo, fileData });
      this._notify(EVENT.DASHBOARD_UPDATED, {});
      saveToStorage(this.state);
    }
  }

  setRequisitoObservaciones(codigo, obs) {
    const req = this.state.requisitos[codigo];
    if (req) {
      req.observaciones = obs;
      debounceSyncToSupabase(this.state);
      saveToStorage(this.state);
    }
  }

  setFechaVencimiento(codigo, fecha) {
    const req = this.state.requisitos[codigo];
    if (req) {
      req.fechaVencimiento = fecha;
      this._notify(EVENT.STATE_CHANGED, { codigo, fechaVencimiento: fecha });
      this._notify(EVENT.DASHBOARD_UPDATED, {});
      debounceSyncToSupabase(this.state);
      saveToStorage(this.state);
    }
  }

  setHallazgo(codigo, hallazgoData) {
    const req = this.state.requisitos[codigo];
    if (req) {
      req.hallazgo = { ...req.hallazgo, ...hallazgoData };
      this._notify(EVENT.STATE_CHANGED, { codigo, hallazgo: req.hallazgo });
      this._notify(EVENT.DASHBOARD_UPDATED, {});
      saveToStorage(this.state);
    }
  }

  setInfoEmpresa(data) {
    this.state.infoEmpresa = { ...this.state.infoEmpresa, ...data };
    this._notify(EVENT.STATE_CHANGED, { prop: 'infoEmpresa', value: this.state.infoEmpresa });
    saveToStorage(this.state);
  }

  setCurrentView(view) {
    this.state.ui.currentView = view;
    this._notify(EVENT.VIEW_CHANGED, { view });
    saveToStorage(this.state);
  }

  setCurrentModule(modId) {
    this.state.ui.currentModule = modId;
    this._notify(EVENT.MODULE_CHANGED, { modId });
    saveToStorage(this.state);
  }

  finalizarAuditoria() {
    const lcs = auditEngine.calcularLCS();
    const isl = auditEngine.calcularISL();
    this.state.auditoria.estado = AUDITORIA_ESTADO.FINALIZADA;
    this.state.auditoria.fechaCierre = new Date().toISOString();
    this.state.auditoria.puntaje_lcs = lcs.lcs;
    this.state.auditoria.puntaje_isl = isl.isl;
    this.state.auditoria.clase_lcs = lcs.clase;
    if (this.state.auditoria.id) {
      api.updateAuditoria(this.state.auditoria.id, {
        estado: 'finalizada',
        fecha_cierre: new Date().toISOString().split('T')[0],
        puntaje_lcs: lcs.lcs,
        puntaje_isl: isl.isl,
        clase_lcs: lcs.clase
      }).catch(e => console.warn('[Store] error finalizar:', e));
    }
    this._notify(EVENT.AUDIT_FINALIZED, {});
    this._notify(EVENT.DASHBOARD_UPDATED, {});
    saveToStorage(this.state);
  }

  estaFinalizada() {
    return this.state.auditoria.estado === AUDITORIA_ESTADO.FINALIZADA;
  }

  getNoCumplenRequisitos() {
    const result = [];
    MODULES.forEach(mod => {
      mod.categoria.forEach(cat => {
        cat.items.forEach(item => {
          const st = this.getRequisitoState(item.codigo);
          if (st?.status === 'no-cumple') {
            result.push({
              ...item,
              _moduloId: mod.id,
              _moduloCodigo: mod.codigo,
              _moduloTitle: mod.title,
              _categoriaId: cat.id,
              _categoriaTitle: cat.title,
              _state: st
            });
          }
        });
      });
    });
    return result;
  }

  resetAuditoria() {
    const fresh = createInitialState();
    Object.keys(fresh.requisitos).forEach(key => {
      this.state.requisitos[key] = fresh.requisitos[key];
    });
    this.state.infoEmpresa = fresh.infoEmpresa;
    this.state.auditoria = { ...fresh.auditoria, id: this.state.auditoria.id };
    this._notify(EVENT.STATE_CHANGED, { prop: 'reset', value: true });
    this._notify(EVENT.DASHBOARD_UPDATED, {});
    saveToStorage(this.state);
  }

  async nuevaAuditoria(nombre, fechaEstimadaCierre) {
    const me = await api.me();
    const created = await api.createAuditoria({
      nombre: nombre || 'Auditoría General',
      empresa_id: me.empresa_id || undefined,
      fecha_estimada_cierre: fechaEstimadaCierre || null
    });

    const fresh = createInitialState();
    Object.keys(fresh.requisitos).forEach(key => {
      this.state.requisitos[key] = fresh.requisitos[key];
    });
    this.state.infoEmpresa = fresh.infoEmpresa;
    this.state.auditoria = {
      ...fresh.auditoria,
      id: created.id,
      nombre: created.nombre,
      fechaCreacion: created.fecha_apertura || new Date().toISOString(),
      fechaEstimadaCierre: created.fecha_estimada_cierre || null
    };

    if (me.empresa_id) {
      const empresas = await api.getEmpresas();
      const emp = empresas.find(e => e.id === me.empresa_id);
      if (emp) {
        this.state.infoEmpresa.razonSocial = emp.nombre;
        this.state.infoEmpresa.rif = emp.rif || '';
      }
    }

    this._notify(EVENT.STATE_CHANGED, { prop: 'nueva-auditoria', value: true });
    this._notify(EVENT.DASHBOARD_UPDATED, {});
    saveToStorage(this.state);
  }

  exportState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  importState(json) {
    Object.assign(this.state, json);
    this._notify(EVENT.STATE_CHANGED, { prop: 'import', value: true });
    this._notify(EVENT.DASHBOARD_UPDATED, {});
    saveToStorage(this.state);
  }
}

export const store = new Store();
