export default {
  id: 11,
  codigo: 'M11',
  title: 'Seguros Laborales',
  description: 'Cumplimiento de las obligaciones en materia de seguros obligatorios para los trabajadores, incluyendo seguro de vida, HCM y pólizas colectivas.',
  icon: '🛡️',
  activaModulos: false,
  categoria: [
    {
      id: '11.1',
      title: 'Seguro de Vida',
      description: 'Seguro de vida obligatorio para los trabajadores',
      items: [
        {
          codigo: 'SR-001', pregunta: '¿La empresa ha contratado el seguro de vida obligatorio para todos los trabajadores?',
          descripcion: 'Toda empresa con más de 5 trabajadores debe contratar un seguro de vida colectivo para todos sus empleados, con una cobertura mínima establecida.',
          fundamentoLegal: { articulo: 'Art. 108', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH / Administración', periodicidad: 'Anual',
          evidenciaRequerida: ['Póliza de seguro de vida', 'Certificado de cobertura', 'Nómina de beneficiarios'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'SR-002', pregunta: '¿La cobertura del seguro de vida cumple con los montos mínimos establecidos?',
          descripcion: 'El seguro de vida obligatorio debe tener una cobertura mínima equivalente a 20 salarios mínimos nacionales, según la LOTTT.',
          fundamentoLegal: { articulo: 'Art. 108', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH', periodicidad: 'Anual',
          evidenciaRequerida: ['Póliza de seguro', 'Condiciones generales', 'Cálculo de cobertura'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'SR-003', pregunta: '¿Los beneficiarios del seguro de vida están debidamente registrados y actualizados?',
          descripcion: 'La empresa debe mantener un registro actualizado de los beneficiarios designados por cada trabajador para el seguro de vida.',
          fundamentoLegal: { articulo: 'Art. 108', ley: 'LOTTT / Ley de Contrato de Seguro' },
          nivelRiesgo: 'ALTO', responsable: 'Departamento de RRHH', periodicidad: 'Semestral',
          evidenciaRequerida: ['Registro de beneficiarios', 'Formularios de designación', 'Nómina'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'SR-004', pregunta: '¿La empresa paga oportunamente las primas del seguro de vida colectivo?',
          descripcion: 'Las primas del seguro de vida colectivo deben pagarse dentro de los plazos establecidos en la póliza para evitar la suspensión de la cobertura.',
          fundamentoLegal: { articulo: 'Art. 108', ley: 'LOTTT / Ley de Contrato de Seguro' },
          nivelRiesgo: 'ALTO', responsable: 'Departamento de Administración', periodicidad: 'Mensual',
          evidenciaRequerida: ['Comprobantes de pago de primas', 'Estado de cuenta de la póliza'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '11.2',
      title: 'Seguro de Salud (HCM)',
      description: 'Seguro de hospitalización, cirugía y maternidad',
      items: [
        {
          codigo: 'SR-005', pregunta: '¿La empresa ofrece seguro HCM a sus trabajadores?',
          descripcion: 'Aunque no es obligatorio por LOTTT, la contratación colectiva generalmente exige un seguro HCM. Verificar su existencia y cobertura.',
          fundamentoLegal: { articulo: 'Arts. 60, 61', ley: 'Ley de Contrato de Seguro / Convención Colectiva' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'Anual',
          evidenciaRequerida: ['Póliza HCM', 'Certificados individuales', 'Convención colectiva'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'SR-006', pregunta: '¿La cobertura del seguro HCM incluye a los familiares del trabajador?',
          descripcion: 'Cuando la empresa otorga seguro HCM, generalmente la cobertura se extiende al grupo familiar del trabajador. Verificar las condiciones.',
          fundamentoLegal: { articulo: 'Contrato de seguro', ley: 'Ley de Contrato de Seguro' },
          nivelRiesgo: 'MEDIO', responsable: 'Gerencia de RRHH', periodicidad: 'Anual',
          evidenciaRequerida: ['Condiciones de la póliza', 'Cobertura familiar'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'SR-007', pregunta: '¿Los nuevos trabajadores son incluidos en el seguro dentro del mes de ingreso?',
          descripcion: 'Los trabajadores deben ser incluidos en el seguro colectivo dentro de los 30 días siguientes a su ingreso a la empresa.',
          fundamentoLegal: { articulo: 'Arts. 58, 108', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Departamento de RRHH', periodicidad: 'Mensual',
          evidenciaRequerida: ['Registro de ingresos', 'Altas en la póliza', 'Nómina'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '11.3',
      title: 'Prevención y Riesgos',
      description: 'Gestión de riesgos laborales y seguros complementarios',
      items: [
        {
          codigo: 'SR-008', pregunta: '¿La empresa tiene contratado un seguro de responsabilidad civil patronal?',
          descripcion: 'Se recomienda la contratación de un seguro de responsabilidad civil que cubra reclamaciones por accidentes laborales o enfermedades ocupacionales.',
          fundamentoLegal: { articulo: 'Arts. 56, 57', ley: 'LOPCYMAT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de Administración', periodicidad: 'Anual',
          evidenciaRequerida: ['Póliza de responsabilidad civil', 'Certificado de cobertura'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'SR-009', pregunta: '¿Los trabajadores notificados como de alto riesgo reciben cobertura adicional?',
          descripcion: 'Los trabajadores expuestos a condiciones de alto riesgo (alturas, sustancias peligrosas, etc.) deben contar con coberturas de seguro adicionales.',
          fundamentoLegal: { articulo: 'Arts. 59, 60', ley: 'LOPCYMAT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Inspector de Seguridad / RRHH', periodicidad: 'Trimestral',
          evidenciaRequerida: ['Evaluación de riesgos', 'Pólizas adicionales', 'Registro de trabajadores expuestos'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'SR-010', pregunta: '¿Se comunica a los trabajadores las coberturas y condiciones de los seguros contratados?',
          descripcion: 'La empresa debe informar a los trabajadores sobre las coberturas, beneficiarios y procedimientos para hacer uso de los seguros contratados.',
          fundamentoLegal: { articulo: 'Art. 108 parágrafo', ley: 'LOTTT' },
          nivelRiesgo: 'BAJO', responsable: 'Gerencia de RRHH', periodicidad: 'Anual',
          evidenciaRequerida: ['Comunicaciones internas', 'Material informativo', 'Registro de inducción'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 60,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    }
  ]
};
