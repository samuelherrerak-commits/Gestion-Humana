export default {
  id: 9,
  codigo: 'M09',
  title: 'Utilidades',
  description: 'Cumplimiento del pago de utilidades o participación en los beneficios de la empresa.',
  icon: '📊',
  activaModulos: false,
  categoria: [
    {
      id: '9.1',
      title: 'Cálculo de Utilidades',
      description: 'Determinación del monto de utilidades',
      items: [
        {
          codigo: 'UT-001', pregunta: '¿Se paga el mínimo de 15 días de utilidades anuales?',
          descripcion: 'La empresa debe distribuir el 15% de sus beneficios líquidos entre los trabajadores, con un mínimo de 15 días de salario por año.',
          fundamentoLegal: { articulo: 'Art. 131', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Contabilidad / Gerencia Financiera', periodicidad: 'Anual',
          evidenciaRequerida: ['Estados financieros', 'Cálculo de utilidades', 'Nómina de utilidades'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'UT-002', pregunta: '¿Las utilidades no exceden el máximo de 30 días de salario?',
          descripcion: 'El límite máximo de utilidades por trabajador es de 30 días de salario base. El excedente se destina al Fondo de Desarrollo Nacional.',
          fundamentoLegal: { articulo: 'Art. 131', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Contabilidad', periodicidad: 'Anual',
          evidenciaRequerida: ['Cálculo de utilidades', 'Estados financieros', 'Planilla de distribución'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'UT-003', pregunta: '¿Se calcula la fracción de utilidades para trabajadores con menos de un año?',
          descripcion: 'Los trabajadores que no hayan laborado todo el año tienen derecho a utilidades fraccionadas proporcionales a los meses trabajados.',
          fundamentoLegal: { articulo: 'Arts. 131, 132', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Departamento de Nómina', periodicidad: 'Anual',
          evidenciaRequerida: ['Cálculo de fracción de utilidades', 'Nómina'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'UT-004', pregunta: '¿La base de cálculo de utilidades incluye todos los conceptos salariales?',
          descripcion: 'Las utilidades se calculan sobre el salario base del trabajador, incluyendo todos los conceptos salariales ordinarios.',
          fundamentoLegal: { articulo: 'Arts. 131, 132', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Departamento de Nómina', periodicidad: 'Anual',
          evidenciaRequerida: ['Cálculo de utilidades', 'Nómina', 'Estructura salarial'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '9.2',
      title: 'Pago y Plazos',
      description: 'Oportunidad y forma del pago de utilidades',
      items: [
        {
          codigo: 'UT-005', pregunta: '¿El pago de utilidades se realiza dentro del plazo de 30 días después del cierre fiscal?',
          descripcion: 'Las utilidades deben pagarse dentro de los 30 días siguientes al cierre del ejercicio fiscal de la empresa.',
          fundamentoLegal: { articulo: 'Art. 131', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia Financiera', periodicidad: 'Anual',
          evidenciaRequerida: ['Comprobante de pago', 'Fecha de cierre fiscal', 'Recibos firmados'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'UT-006', pregunta: '¿Se paga el anticipo de 15 días de utilidades en diciembre?',
          descripcion: 'La empresa debe pagar un anticipo de 15 días de utilidades durante la primera quincena de diciembre, salvo pacto en contrario.',
          fundamentoLegal: { articulo: 'Art. 131', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Departamento de Nómina', periodicidad: 'Anual',
          evidenciaRequerida: ['Comprobante de anticipo', 'Nómina de diciembre', 'Recibos'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'UT-007', pregunta: '¿Se entrega recibo detallado de pago de utilidades al trabajador?',
          descripcion: 'Debe entregarse un recibo detallado con el cálculo, los días pagados, las deducciones y el monto neto recibido por concepto de utilidades.',
          fundamentoLegal: { articulo: 'Art. 140', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Departamento de Nómina', periodicidad: 'Anual',
          evidenciaRequerida: ['Recibos de utilidades firmados', 'Registro de entrega'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '9.3',
      title: 'Exenciones y Exoneraciones',
      description: 'Casos especiales de exención en el pago de utilidades',
      items: [
        {
          codigo: 'UT-008', pregunta: '¿Si la empresa no genera beneficios, se justifica documentalmente la falta de pago?',
          descripcion: 'Si la empresa no obtiene beneficios líquidos, debe demostrarlo mediante estados financieros auditados para no pagar utilidades.',
          fundamentoLegal: { articulo: 'Arts. 131, 133', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Contabilidad / Auditoría', periodicidad: 'Anual',
          evidenciaRequerida: ['Estados financieros auditados', 'Declaración de impuestos', 'Acta de asamblea'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'UT-009', pregunta: '¿Se ha pactado el diferimiento del pago de utilidades mediante convenio colectivo?',
          descripcion: 'El pago de utilidades puede diferirse mediante pacto en convención colectiva o acuerdo de mayoría absoluta de trabajadores.',
          fundamentoLegal: { articulo: 'Art. 131 parágrafo II', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Gerencia de RRHH / Asesoría Legal', periodicidad: 'Anual',
          evidenciaRequerida: ['Convención colectiva', 'Acuerdo de trabajadores', 'Registro del pacto'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'UT-010', pregunta: '¿Las empresas exentas del pago de utilidades cumplen con los requisitos legales?',
          descripcion: 'Las empresas nuevas (primer año), las sin fines de lucro y las que realizan actividades benéficas pueden estar exentas total o parcialmente.',
          fundamentoLegal: { articulo: 'Arts. 132, 133', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Asesoría Legal', periodicidad: 'Anual',
          evidenciaRequerida: ['Documento de exención', 'Clasificación legal', 'Estados financieros'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    }
  ]
};
