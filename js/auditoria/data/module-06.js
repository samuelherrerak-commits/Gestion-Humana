export default {
  id: 6,
  codigo: 'M06',
  title: 'Nómina',
  description: 'Cumplimiento de la normativa salarial, registro de pagos, jornada, horas extras y obligaciones formales de la nómina.',
  icon: '💰',
  activaModulos: false,
  categoria: [
    {
      id: '6.1',
      title: 'Salario y Conceptos',
      description: 'Cumplimiento del salario mínimo, igualdad salarial y conceptos obligatorios',
      items: [
        {
          codigo: 'NO-001', pregunta: '¿El salario base cumple con el salario mínimo nacional vigente?',
          descripcion: 'Verificar que ningún trabajador reciba un salario base inferior al salario mínimo nacional decretado por el Ejecutivo Nacional.',
          fundamentoLegal: { articulo: 'Arts. 129, 130', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH / Contabilidad', periodicidad: 'Mensual',
          evidenciaRequerida: ['Nómina', 'Tabla salarial', 'Gaceta Oficial del salario mínimo'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'NO-002', pregunta: '¿Se cumple con el principio de igualdad salarial sin discriminación de género?',
          descripcion: 'Verificar que no existan diferencias salariales injustificadas por razón de género, raza, edad o cualquier otra condición.',
          fundamentoLegal: { articulo: 'Arts. 134, 135', ley: 'LOTTT / CRBV Art. 91' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH', periodicidad: 'Semestral',
          evidenciaRequerida: ['Nómina', 'Política salarial', 'Estructura de cargos'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'NO-003', pregunta: '¿El salario se paga en moneda de curso legal dentro del plazo establecido?',
          descripcion: 'El salario debe pagarse en bolívares (o moneda extranjera si aplica con autorización), semanalmente para obreros y quincenalmente para empleados.',
          fundamentoLegal: { articulo: 'Arts. 136, 138, 139', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Departamento de Nómina', periodicidad: 'Mensual',
          evidenciaRequerida: ['Comprobantes de pago', 'Nómina', 'Política de pago'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'NO-004', pregunta: '¿Se entrega recibo de pago o constancia de pago a cada trabajador?',
          descripcion: 'Debe entregarse un recibo de pago detallado con todos los conceptos devengados y deducciones, firmado por el trabajador.',
          fundamentoLegal: { articulo: 'Art. 140', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Departamento de Nómina', periodicidad: 'Mensual',
          evidenciaRequerida: ['Recibos de pago firmados', 'Registro de entrega'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'NO-005', pregunta: '¿Las comisiones y bonificaciones se calculan y pagan correctamente?',
          descripcion: 'Verificar que las comisiones, bonos productivos y demás conceptos variables se calculen según lo pactado y la ley.',
          fundamentoLegal: { articulo: 'Arts. 141, 142', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'Mensual',
          evidenciaRequerida: ['Nómina', 'Contratos', 'Política de bonificaciones'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'NO-006', pregunta: '¿Se pagan los recargos por trabajo en horas extraordinarias?',
          descripcion: 'Las horas extras diurnas se pagan con 50% de recargo, las nocturnas con 100% sobre el salario base.',
          fundamentoLegal: { articulo: 'Arts. 176, 177, 178', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Departamento de Nómina', periodicidad: 'Mensual',
          evidenciaRequerida: ['Registro de horas extras', 'Nómina', 'Cálculo de recargos'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '6.2',
      title: 'Jornada y Horarios',
      description: 'Control de jornada, descansos y trabajo en días feriados',
      items: [
        {
          codigo: 'NO-007', pregunta: '¿La jornada diurna no supera las 40 horas semanales?',
          descripcion: 'Verificar que la jornada ordinaria diurna no exceda de 8 horas diarias ni 40 horas semanales.',
          fundamentoLegal: { articulo: 'Art. 173', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH', periodicidad: 'Mensual',
          evidenciaRequerida: ['Registros de asistencia', 'Horarios', 'Nómina'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'NO-008', pregunta: '¿Se concede el descanso intrajornada obligatorio?',
          descripcion: 'Todo trabajador tiene derecho a un descanso de 30 minutos dentro de la jornada, que no puede acumularse ni compensarse.',
          fundamentoLegal: { articulo: 'Art. 174', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Supervisor inmediato', periodicidad: 'Mensual',
          evidenciaRequerida: ['Horarios', 'Registro de asistencia', 'Política de descanso'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'NO-009', pregunta: '¿Se paga recargo del 150% por trabajo en día feriado o descanso semanal?',
          descripcion: 'El trabajo en día feriado o descanso semanal obligatorio debe pagarse con un recargo del 150% sobre el salario base.',
          fundamentoLegal: { articulo: 'Arts. 184, 185', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Departamento de Nómina', periodicidad: 'Mensual',
          evidenciaRequerida: ['Nómina', 'Registro de trabajo en feriados', 'Cálculo de recargos'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'NO-010', pregunta: '¿Se lleva un registro formal de la jornada y asistencia de los trabajadores?',
          descripcion: 'La empresa debe mantener un sistema de registro de la jornada trabajada, incluyendo horarios de entrada, salida y horas extras.',
          fundamentoLegal: { articulo: 'Arts. 181, 182', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'Mensual',
          evidenciaRequerida: ['Sistema de registro de asistencia', 'Reportes de asistencia'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '6.3',
      title: 'Obligaciones Formales',
      description: 'Registros y obligaciones formales de la nómina',
      items: [
        {
          codigo: 'NO-011', pregunta: '¿La empresa mantiene actualizado el Libro de Salarios?',
          descripcion: 'El Libro de Salarios debe estar sellado por el Juzgado de Primera Instancia del Trabajo y contener todos los pagos realizados.',
          fundamentoLegal: { articulo: 'Arts. 143, 144', ley: 'LOTTT / Reglamento' },
          nivelRiesgo: 'ALTO', responsable: 'Departamento de Nómina', periodicidad: 'Trimestral',
          evidenciaRequerida: ['Libro de Salarios', 'Sello judicial', 'Registro de pagos'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'NO-012', pregunta: '¿Se realizan las retenciones y aportes al IVSS, INCES y FAOV correctamente?',
          descripcion: 'Verificar que las retenciones de ley (IVSS, INCES, FAOV, PARO FORZOSO) se calculen sobre la base correcta y se enteren oportunamente.',
          fundamentoLegal: { articulo: 'LSS Arts. 67-70, LINCES Art. 14, LFAOV Art. 7', ley: 'LSS / LINCES / LFAOV' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Departamento de Nómina / Contabilidad', periodicidad: 'Mensual',
          evidenciaRequerida: ['Planilla de cotizaciones', 'Comprobantes de pago IVSS', 'Comprobantes INCES', 'Comprobantes FAOV'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'NO-013', pregunta: '¿Se entrega constancia de trabajo o certificación de servicios cuando el trabajador lo solicita?',
          descripcion: 'El trabajador tiene derecho a solicitar constancia de trabajo, certificación de servicios y carta de recomendación sin que la empresa pueda negarla.',
          fundamentoLegal: { articulo: 'Art. 148', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Solicitudes de constancia', 'Constancias emitidas', 'Política de constancias'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'NO-014', pregunta: '¿Se notifica al trabajador por escrito cualquier modificación salarial?',
          descripcion: 'Toda modificación del salario debe constar por escrito y ser firmada por el trabajador, con copia entregada al mismo.',
          fundamentoLegal: { articulo: 'Art. 133', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Comunicaciones de aumento salarial', 'Acuerdos firmados'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'NO-015', pregunta: '¿Los trabajadores reciben formación e información sobre sus derechos y obligaciones salariales?',
          descripcion: 'La empresa debe informar a los trabajadores sobre sus derechos laborales, incluyendo los conceptos salariales, deducciones y beneficios.',
          fundamentoLegal: { articulo: 'Arts. 146, 147', ley: 'LOTTT' },
          nivelRiesgo: 'BAJO', responsable: 'Gerencia de RRHH', periodicidad: 'Semestral',
          evidenciaRequerida: ['Registro de inducciones', 'Material formativo', 'Constancias de recepción'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 60,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    }
  ]
};
