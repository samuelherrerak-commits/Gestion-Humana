export default {
  id: 8,
  codigo: 'M08',
  title: 'Vacaciones',
  description: 'Cumplimiento del derecho al disfrute de vacaciones anuales, bono vacacional y registro de pagos.',
  icon: '🏖️',
  activaModulos: false,
  categoria: [
    {
      id: '8.1',
      title: 'Disfrute de Vacaciones',
      description: 'Período de descanso anual obligatorio',
      items: [
        {
          codigo: 'VA-001', pregunta: '¿Se otorgan 15 días hábiles de vacaciones por año de servicio?',
          descripcion: 'Todo trabajador tiene derecho a 15 días hábiles de vacaciones remuneradas por cada año de servicio ininterrumpido.',
          fundamentoLegal: { articulo: 'Art. 190', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH', periodicidad: 'Anual',
          evidenciaRequerida: ['Plan de vacaciones', 'Registro de disfrute', 'Nómina de vacaciones'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'VA-002', pregunta: '¿Se añade un día adicional de vacaciones por cada año de servicio?',
          descripcion: 'Después del primer año, se añade un día hábil adicional por cada año de servicio, hasta un máximo de 20 días hábiles.',
          fundamentoLegal: { articulo: 'Art. 190', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'Anual',
          evidenciaRequerida: ['Cálculo de días de vacaciones', 'Registro de antigüedad'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'VA-003', pregunta: '¿Las vacaciones son efectivamente disfrutadas (no compensadas en dinero)?',
          descripcion: 'Las vacaciones son un derecho irrenunciable y deben ser disfrutadas efectivamente, no pueden compensarse en dinero salvo en caso de terminación de la relación.',
          fundamentoLegal: { articulo: 'Arts. 190, 193', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH', periodicidad: 'Anual',
          evidenciaRequerida: ['Registro de disfrute', 'Recibos de vacaciones', 'Planificación anual'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'VA-004', pregunta: '¿Las vacaciones se otorgan dentro del año siguiente al período de acumulación?',
          descripcion: 'El trabajador debe disfrutar las vacaciones dentro de los 12 meses siguientes a la fecha en que adquiera el derecho.',
          fundamentoLegal: { articulo: 'Art. 191', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'Anual',
          evidenciaRequerida: ['Plan de vacaciones', 'Cronograma de disfrute'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '8.2',
      title: 'Bono Vacacional',
      description: 'Pago del bono vacacional obligatorio',
      items: [
        {
          codigo: 'VA-005', pregunta: '¿Se paga el bono vacacional de 15 días de salario base?',
          descripcion: 'La empresa debe pagar al trabajador un bono vacacional equivalente a 15 días de salario base, más un día adicional por año de servicio.',
          fundamentoLegal: { articulo: 'Art. 192', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Departamento de Nómina', periodicidad: 'Anual',
          evidenciaRequerida: ['Nómina de vacaciones', 'Cálculo de bono vacacional', 'Recibo de pago'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'VA-006', pregunta: '¿El bono vacacional se paga antes del inicio del disfrute?',
          descripcion: 'El bono vacacional debe pagarse antes de que el trabajador inicie el período de disfrute de sus vacaciones.',
          fundamentoLegal: { articulo: 'Art. 192', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Departamento de Nómina', periodicidad: 'Anual',
          evidenciaRequerida: ['Comprobante de pago', 'Fechas de pago vs disfrute'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'VA-007', pregunta: '¿Se calcula la fracción de vacaciones para trabajadores con menos de un año?',
          descripcion: 'Los trabajadores que no hayan cumplido un año de servicio tienen derecho a vacaciones fraccionadas proporcionales al tiempo trabajado.',
          fundamentoLegal: { articulo: 'Arts. 190, 196', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Departamento de Nómina', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Cálculo de fracción de vacaciones', 'Nómina'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '8.3',
      title: 'Registro y Planificación',
      description: 'Control y registro de las vacaciones',
      items: [
        {
          codigo: 'VA-008', pregunta: '¿Existe un plan anual de vacaciones y se notifica con anticipación a los trabajadores?',
          descripcion: 'La empresa debe elaborar un plan anual de vacaciones y notificar al trabajador la fecha de disfrute con al menos 30 días de anticipación.',
          fundamentoLegal: { articulo: 'Art. 194', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Gerencia de RRHH', periodicidad: 'Anual',
          evidenciaRequerida: ['Plan anual de vacaciones', 'Comunicaciones a trabajadores'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'VA-009', pregunta: '¿Se mantiene un registro actualizado de las vacaciones tomadas y pendientes?',
          descripcion: 'Debe existir un registro detallado de las vacaciones de cada trabajador, incluyendo días tomados, pendientes y saldo de días adicionales.',
          fundamentoLegal: { articulo: 'Arts. 190, 191', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Gerencia de RRHH', periodicidad: 'Mensual',
          evidenciaRequerida: ['Registro de vacaciones', 'Sistema de RRHH', 'Reportes'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'VA-010', pregunta: '¿Las vacaciones colectivas se pagan y registran adecuadamente?',
          descripcion: 'Si la empresa adopta vacaciones colectivas, deben pagarse con el salario normal y registrarse en el plan anual.',
          fundamentoLegal: { articulo: 'Arts. 181, 195', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Gerencia de RRHH', periodicidad: 'Anual',
          evidenciaRequerida: ['Comunicación de vacaciones colectivas', 'Nómina', 'Registro'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    }
  ]
};
