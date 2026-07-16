export default {
  id: 7,
  codigo: 'M07',
  title: 'Prestaciones Sociales',
  description: 'Gestión y pago de las prestaciones sociales, intereses, anticipos y liquidación final de la relación laboral.',
  icon: '🏦',
  activaModulos: false,
  categoria: [
    {
      id: '7.1',
      title: 'Garantía de Prestaciones Sociales',
      description: 'Cálculo y depósito de la prestación de antigüedad',
      items: [
        {
          codigo: 'PS-001', pregunta: '¿Se deposita el 15+1 días por año de la prestación de antigüedad trimestralmente?',
          descripcion: 'Verificar que se realice el depósito trimestral de la prestación de antigüedad equivalente a 15 días de salario integral por trimestre, más 2 días adicionales por año.',
          fundamentoLegal: { articulo: 'Arts. 142, 143', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Departamento de Nómina / RRHH', periodicidad: 'Trimestral',
          evidenciaRequerida: ['Cálculo de prestaciones', 'Registro de depósitos', 'Estados de cuenta'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PS-002', pregunta: '¿El salario base para el cálculo de prestaciones incluye todos los conceptos?',
          descripcion: 'El salario integral para el cálculo de prestaciones incluye el salario base más las alícuotas de utilidades y bono vacacional.',
          fundamentoLegal: { articulo: 'Arts. 121, 122', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Departamento de Nómina', periodicidad: 'Trimestral',
          evidenciaRequerida: ['Cálculo de salario integral', 'Nómina', 'Alícuotas calculadas'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PS-003', pregunta: '¿Se lleva un registro individualizado por trabajador de las prestaciones sociales?',
          descripcion: 'Cada trabajador debe tener un registro individual donde consten los depósitos trimestrales, intereses y saldos acumulados.',
          fundamentoLegal: { articulo: 'Art. 143', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Departamento de Nómina', periodicidad: 'Trimestral',
          evidenciaRequerida: ['Registro individual de prestaciones', 'Sistema de gestión', 'Planillas'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PS-004', pregunta: '¿Se depositan las prestaciones en un fideicomiso o cuenta de ahorro individual?',
          descripcion: 'Las prestaciones sociales pueden depositarse en un fideicomiso individual, cuenta de ahorro o mantenerse en la contabilidad de la empresa con garantía.',
          fundamentoLegal: { articulo: 'Art. 143', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia Financiera', periodicidad: 'Trimestral',
          evidenciaRequerida: ['Contrato de fideicomiso', 'Estados de cuenta', 'Registro contable'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '7.2',
      title: 'Intereses y Anticipos',
      description: 'Cálculo y pago de intereses sobre prestaciones sociales',
      items: [
        {
          codigo: 'PS-005', pregunta: '¿Se pagan los intereses anuales sobre las prestaciones sociales?',
          descripcion: 'Las prestaciones sociales generan intereses calculados a la tasa activa bancaria, que deben pagarse al trabajador al cierre de cada año.',
          fundamentoLegal: { articulo: 'Arts. 143, 144', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Departamento de Nómina', periodicidad: 'Anual',
          evidenciaRequerida: ['Cálculo de intereses', 'Comprobante de pago', 'Recibo firmado'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PS-006', pregunta: '¿Se entrega al trabajador el estado de cuenta anual de sus prestaciones?',
          descripcion: 'La empresa debe entregar al trabajador un estado de cuenta detallado con los movimientos, depósitos e intereses de sus prestaciones sociales.',
          fundamentoLegal: { articulo: 'Art. 145', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Departamento de Nómina', periodicidad: 'Anual',
          evidenciaRequerida: ['Estado de cuenta del trabajador', 'Acuse de recibo firmado'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PS-007', pregunta: '¿Se pagan los anticipos de prestaciones sociales dentro del plazo legal?',
          descripcion: 'El trabajador puede solicitar anticipos de hasta el 75% de las prestaciones acumuladas, y la empresa debe pagarlos dentro de los 15 días siguientes.',
          fundamentoLegal: { articulo: 'Art. 147', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH / Finanzas', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Solicitud de anticipo', 'Comprobante de pago', 'Registro de anticipos'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '7.3',
      title: 'Terminación de la Relación Laboral',
      description: 'Liquidación final y finiquito',
      items: [
        {
          codigo: 'PS-008', pregunta: '¿Al término de la relación laboral se calcula y paga correctamente la liquidación?',
          descripcion: 'Al finalizar la relación laboral, debe calcularse el pago de prestaciones sociales, intereses, vacaciones fraccionadas, utilidades fraccionadas y demás conceptos adeudados.',
          fundamentoLegal: { articulo: 'Arts. 142, 191, 196', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Departamento de Nómina', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Cálculo de liquidación', 'Recibo de pago', 'Acta de finiquito'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PS-009', pregunta: '¿Se entrega carta de liberación o finiquito firmado por el trabajador?',
          descripcion: 'Al momento del pago final, debe firmarse un finiquito o carta de liberación donde conste que el trabajador recibe todos sus conceptos y declara a paz y salvo.',
          fundamentoLegal: { articulo: 'Art. 148', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Carta de liberación firmada', 'Acta de liquidación'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PS-010', pregunta: '¿Se notifica al IVSS el retiro del trabajador dentro del plazo legal?',
          descripcion: 'El retiro del trabajador debe ser notificado al IVSS dentro de los 3 días hábiles siguientes a la terminación de la relación laboral.',
          fundamentoLegal: { articulo: 'Art. 71', ley: 'Ley del Seguro Social / Reglamento' },
          nivelRiesgo: 'ALTO', responsable: 'Departamento de Nómina', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Registro de notificación IVSS', 'Planilla de retiro'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 5,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PS-011', pregunta: '¿Se entrega la certificación de servicios y constancia de trabajo al trabajador que egresa?',
          descripcion: 'Al egresar, el trabajador tiene derecho a que la empresa le entregue una certificación de servicios y constancia de trabajo.',
          fundamentoLegal: { articulo: 'Arts. 148, 149', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Certificación de servicios', 'Constancia de trabajo entregada'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PS-012', pregunta: '¿Se conservan los registros y recibos de liquidación por el plazo legal de prescripción?',
          descripcion: 'Los registros de relaciones laborales, nóminas y liquidaciones deben conservarse por el plazo de prescripción de 10 años.',
          fundamentoLegal: { articulo: 'Art. 151', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Departamento de Nómina / Archivo', periodicidad: 'Anual',
          evidenciaRequerida: ['Política de archivo', 'Registros históricos', 'Sistema de gestión documental'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 60,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    }
  ]
};
