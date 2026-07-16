/* ════════════════════════════════════════════════════════════
   CONSTANTS & ENUMS
   ════════════════════════════════════════════════════════════ */

export const STATUS = {
  CUMPLE: 'cumple',
  PARCIAL: 'parcial',
  NO_CUMPLE: 'no-cumple',
  NO_APLICA: 'no-aplica',
  NULL: null
};

export const STATUS_LABELS = {
  [STATUS.CUMPLE]: 'Cumple',
  [STATUS.PARCIAL]: 'Cumple Parcial',
  [STATUS.NO_CUMPLE]: 'No Cumple',
  [STATUS.NO_APLICA]: 'No Aplica'
};

export const STATUS_ICONS = {
  [STATUS.CUMPLE]: '✅',
  [STATUS.PARCIAL]: '◐',
  [STATUS.NO_CUMPLE]: '❌',
  [STATUS.NO_APLICA]: '—'
};

export const RIESGO = {
  CRITICO: 'CRÍTICO',
  ALTO: 'ALTO',
  MEDIO: 'MEDIO',
  BAJO: 'BAJO'
};

export const RIESGO_PONDERACION = {
  [RIESGO.CRITICO]: 4,
  [RIESGO.ALTO]: 3,
  [RIESGO.MEDIO]: 2,
  [RIESGO.BAJO]: 1
};

export const RIESGO_COLOR = {
  [RIESGO.CRITICO]: 'var(--color-riesgo-critico)',
  [RIESGO.ALTO]: 'var(--color-riesgo-alto)',
  [RIESGO.MEDIO]: 'var(--color-riesgo-medio)',
  [RIESGO.BAJO]: 'var(--color-riesgo-bajo)'
};

export const RIESGO_BG = {
  [RIESGO.CRITICO]: 'var(--bg-riesgo-critico)',
  [RIESGO.ALTO]: 'var(--bg-riesgo-alto)',
  [RIESGO.MEDIO]: 'var(--bg-riesgo-medio)',
  [RIESGO.BAJO]: 'var(--bg-riesgo-bajo)'
};

export const EVIDENCIA_STATUS = {
  PENDIENTE: 'pendiente',
  VALIDADO: 'validado',
  RECHAZADO: 'rechazado'
};

export const HALLAZGO_PRIORIDAD = {
  CRITICO: 'crítico',
  ALTO: 'alto',
  MEDIO: 'medio',
  BAJO: 'bajo'
};

export const HALLAZGO_ESTADO = {
  ABIERTO: 'abierto',
  CERRADO: 'cerrado',
  VENCIDO: 'vencido'
};

export const FORMATOS_PERMITIDOS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx',
  'jpg', 'jpeg', 'png',
  'msg', 'eml',
  'zip', 'mp4', 'avi'
];

export const TIPOS_EVIDENCIA = [
  'PDF', 'Word', 'Excel', 'Imagen', 'Correo', 'ZIP', 'Video'
];

export const FORMATOS_EVIDENCIA_LABEL = 'PDF, Word, Excel, Imagen, Correo, ZIP, Video';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALERTA_DIAS = 15;

export const LCS_CLASES = [
  { min: 900, max: 1000, clase: 'A', label: 'Excelencia en Cumplimiento', color: '#059669' },
  { min: 800, max: 899, clase: 'B', label: 'Cumplimiento Alto', color: '#2563EB' },
  { min: 700, max: 799, clase: 'C', label: 'Cumplimiento Aceptable', color: '#D97706' },
  { min: 600, max: 699, clase: 'D', label: 'Riesgo Elevado', color: '#DC2626' },
  { min: 0, max: 599, clase: 'E', label: 'Riesgo Crítico', color: '#7C1D1D' }
];

export const ISL_SEMAFORO = [
  { min: 90, max: 100, color: '#059669', icon: '🟢', label: 'Salud Óptima' },
  { min: 70, max: 89, color: '#D97706', icon: '🟡', label: 'Riesgo Moderado' },
  { min: 0, max: 69, color: '#DC2626', icon: '🔴', label: 'Alerta Crítica' }
];

export const AUDITORIA_ESTADO = {
  EN_PROGRESO: 'en-progreso',
  FINALIZADA: 'finalizada'
};

export const AUDITORIA_ESTADO_LABELS = {
  [AUDITORIA_ESTADO.EN_PROGRESO]: 'En Progreso',
  [AUDITORIA_ESTADO.FINALIZADA]: 'Finalizada'
};

export const ESTADO_PLAN = {
  ABIERTO: 'abierto',
  EN_PROCESO: 'en-proceso',
  CERRADO: 'cerrado',
  VENCIDO: 'vencido'
};

export const STORE_KEY = 'auditoria-rrhh-state';

export const STATUS_FACTOR = {
  [STATUS.CUMPLE]: 1.0,
  [STATUS.PARCIAL]: 0.5,
  [STATUS.NO_CUMPLE]: 0.0
};

export const EVENT = {
  STATE_CHANGED: 'state-changed',
  STATUS_CHANGED: 'status-changed',
  EVIDENCE_CHANGED: 'evidence-changed',
  MODULE_CHANGED: 'module-changed',
  VIEW_CHANGED: 'view-changed',
  DASHBOARD_UPDATED: 'dashboard-updated',
  AUDIT_FINALIZED: 'audit-finalized',
  PLAN_UPDATED: 'plan-updated'
};
