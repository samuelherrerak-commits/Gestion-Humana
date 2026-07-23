export function getDepartamentosFromStore(empleados) {
  return [...new Set(empleados.map(e => e.departamento).filter(Boolean))].sort();
}

export function getLocalidadesFromStore(empleados) {
  return [...new Set(empleados.map(e => e.localidad).filter(Boolean))].sort();
}

export const ESTATUS_EMPLEADO = { ACTIVO: 'activo', INACTIVO: 'inactivo' };

export const ESTATUS_EMPLEADO_LABELS = {
  [ESTATUS_EMPLEADO.ACTIVO]: 'Activo',
  [ESTATUS_EMPLEADO.INACTIVO]: 'Inactivo'
};

export const SECCIONES_EXPEDIENTE = {
  KIT_INGRESO: {
    key: 'kit_ingreso',
    label: 'Kit de Ingreso',
    tipos: [
      { key: 'cv', label: 'Currículum Vitae', icon: '\u{1F4C4}', multiple: false },
      { key: 'solicitud_empleo', label: 'Solicitud de Empleo', icon: '\u{1F4DD}', multiple: false },
      { key: 'contrato', label: 'Contrato Laboral', icon: '\u{1F4D1}', multiple: true },
      { key: 'hoja_ruta', label: 'Hoja de Ruta', icon: '\u{1F4CB}', multiple: false },
      { key: 'carta_riesgos', label: 'Carta de Notificación de Riesgos', icon: '\u{26A0}\uFE0F', multiple: false },
      { key: 'acuerdo_confidencialidad', label: 'Acuerdo de Confidencialidad', icon: '\u{1F512}', multiple: false },
      { key: 'constancia_ivss', label: 'Constancia de Inscripción IVSS', icon: '\u{1F3E5}', multiple: false }
    ]
  },
  DOCUMENTACION_PERSONAL: {
    key: 'documentacion_personal',
    label: 'Documentación Personal',
    tipos: [
      { key: 'cedula', label: 'Cédula de Identidad', icon: '\u{1FAAA}', multiple: false },
      { key: 'rif', label: 'RIF', icon: '\u{1F4CB}', multiple: false },
      { key: 'titulos', label: 'Títulos Académicos', icon: '\u{1F393}', multiple: true }
    ]
  },
  OTROS: {
    key: 'otros',
    label: 'Otros',
    tipos: [
      { key: 'otros', label: 'Otros Documentos', icon: '\u{1F4CE}', multiple: true }
    ]
  }
};

export function getTiposExpFlat() {
  return Object.values(SECCIONES_EXPEDIENTE).flatMap(s => s.tipos);
}

export function getTipoExpMeta(key) {
  return getTiposExpFlat().find(t => t.key === key) || null;
}

export function getTotalTiposEsperados() {
  return getTiposExpFlat().filter(t => !t.multiple).length;
}

export const ESTATUS_VACACION = {
  PENDIENTE: 'pendiente',
  PENDIENTE_JEFE: 'pendiente_jefe',
  APROBADO_JEFE: 'aprobado_jefe',
  APROBADO_RRHH: 'aprobado_rrhh',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado'
};

export const ESTATUS_VACACION_LABELS = {
  [ESTATUS_VACACION.PENDIENTE]: 'Pendiente',
  [ESTATUS_VACACION.PENDIENTE_JEFE]: 'Pendiente Jefe',
  [ESTATUS_VACACION.APROBADO_JEFE]: 'Aprobado Jefe',
  [ESTATUS_VACACION.APROBADO_RRHH]: 'Pendiente RRHH',
  [ESTATUS_VACACION.APROBADO]: 'Aprobado',
  [ESTATUS_VACACION.RECHAZADO]: 'Rechazado'
};

export const ESTATUS_VACACION_COLORS = {
  [ESTATUS_VACACION.PENDIENTE]: 'warning',
  [ESTATUS_VACACION.PENDIENTE_JEFE]: 'info',
  [ESTATUS_VACACION.APROBADO_JEFE]: 'active',
  [ESTATUS_VACACION.APROBADO_RRHH]: 'warning',
  [ESTATUS_VACACION.APROBADO]: 'success',
  [ESTATUS_VACACION.RECHAZADO]: 'danger'
};

export const TIPOS_CONSTANCIA = {
  TRABAJO: 'trabajo',
  SUELDO: 'sueldo',
  RECOMENDACION: 'recomendacion',
  VACACIONES: 'vacaciones'
};

export const TIPOS_CONSTANCIA_LABELS = {
  [TIPOS_CONSTANCIA.TRABAJO]: 'Constancia de Trabajo',
  [TIPOS_CONSTANCIA.SUELDO]: 'Constancia de Sueldo',
  [TIPOS_CONSTANCIA.RECOMENDACION]: 'Carta de Recomendación',
  [TIPOS_CONSTANCIA.VACACIONES]: 'Constancia de Aprobación de Vacaciones'
};

export const CONSTANCIA_TYPES_BY_ROLE = {
  admin: [TIPOS_CONSTANCIA.TRABAJO, TIPOS_CONSTANCIA.SUELDO, TIPOS_CONSTANCIA.RECOMENDACION],
  gerente: [TIPOS_CONSTANCIA.TRABAJO],
  empleado: [TIPOS_CONSTANCIA.TRABAJO]
};

export const QUINCENAS = {
  PRIMERA: '1ra',
  SEGUNDA: '2da'
};

export const QUINCENA_LABELS = {
  [QUINCENAS.PRIMERA]: '1ra quincena (1-15)',
  [QUINCENAS.SEGUNDA]: '2da quincena (16-fin)'
};

export const DIAS_VACACIONES_BASE = 15;
export const DIAS_POR_ANIO_EXTRA = 1;

export const EVENT = {
  STATE_CHANGED: 'state-changed',
  EMPLOYEES_UPDATED: 'employees-updated',
  DOCUMENTS_UPDATED: 'documents-updated',
  VACATIONS_UPDATED: 'vacations-updated',
  CERTIFICATES_UPDATED: 'certificates-updated',
  FIDEICOMISO_UPDATED: 'fideicomiso-updated',
  VIEW_CHANGED: 'view-changed',
  DASHBOARD_UPDATED: 'dashboard-updated'
};

export const ESTATUS_FIDEICOMISO = {
  PENDIENTE: 'pendiente',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada'
};

export const ESTATUS_FIDEICOMISO_LABELS = {
  [ESTATUS_FIDEICOMISO.PENDIENTE]: 'Pendiente',
  [ESTATUS_FIDEICOMISO.APROBADA]: 'Aprobada',
  [ESTATUS_FIDEICOMISO.RECHAZADA]: 'Rechazada'
};

export const ESTATUS_FIDEICOMISO_COLORS = {
  [ESTATUS_FIDEICOMISO.PENDIENTE]: 'warning',
  [ESTATUS_FIDEICOMISO.APROBADA]: 'success',
  [ESTATUS_FIDEICOMISO.RECHAZADA]: 'danger'
};

export const TRIMESTRES = ['Q1', 'Q2', 'Q3', 'Q4'];
export const TRIMESTRE_LABELS = { Q1: 'Q1 (Ene-Mar)', Q2: 'Q2 (Abr-Jun)', Q3: 'Q3 (Jul-Sep)', Q4: 'Q4 (Oct-Dic)' };

export const STORE_KEY = 'sistema-rrhh-state';

export const EMPRESAS = {
  PROSEIN: 'prosein',
  AUSTRAL: 'austral'
};

export const EMPRESA_LABELS = {
  [EMPRESAS.PROSEIN]: 'PROSEIN',
  [EMPRESAS.AUSTRAL]: 'AUSTRAL IMPORT DE VENEZUELA C.A'
};

export function getEmpresaByLocalidad(localidad) {
  const loc = String(localidad || '');
  if (!loc) return EMPRESAS.PROSEIN;
  return loc.toUpperCase().includes('AUSTRAL') ? EMPRESAS.AUSTRAL : EMPRESAS.PROSEIN;
}

export const EMPRESA_COLORS = {
  [EMPRESAS.PROSEIN]: '#1A2D4A',
  [EMPRESAS.AUSTRAL]: '#B91C1C'
};

export const ROLES = {
  ADMIN: 'admin',
  GERENTE: 'gerente',
  EMPLEADO: 'empleado'
};

export const ROLES_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.GERENTE]: 'Gerente / Encargado',
  [ROLES.EMPLEADO]: 'Empleado'
};
