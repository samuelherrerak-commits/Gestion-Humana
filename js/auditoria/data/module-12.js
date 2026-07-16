export default {
  id: 12,
  codigo: 'M12',
  title: 'Contratación',
  description: 'Cumplimiento de la normativa sobre modalidades de contratación, período de prueba, contratos especiales y formalidades del vínculo laboral.',
  icon: '📝',
  activaModulos: false,
  categoria: [
    {
      id: '12.1',
      title: 'Formalidades del Contrato',
      description: 'Requisitos formales del contrato de trabajo',
      items: [
        {
          codigo: 'CT-001', pregunta: '¿Todo trabajador tiene un contrato de trabajo por escrito?',
          descripcion: 'El contrato de trabajo debe constar por escrito en tres ejemplares (trabajador, empleador e inspectoría), con los datos completos de la relación laboral.',
          fundamentoLegal: { articulo: 'Arts. 58, 59, 60', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Contratos de trabajo firmados', 'Registro de contratos', 'Carpetas de personal'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'CT-002', pregunta: '¿Los contratos contienen todos los elementos exigidos por la ley?',
          descripcion: 'El contrato debe incluir: datos del trabajador y empleador, fecha de inicio, duración, obra o servicio, salario, forma de pago, lugar de trabajo, horario y condiciones.',
          fundamentoLegal: { articulo: 'Arts. 59, 60', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Formato de contrato', 'Contratos firmados', 'Lista de verificación'],
          formatoPermitido: ['pdf', 'docx'], tipoEvidencia: ['PDF', 'Word'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'CT-003', pregunta: '¿Se entrega copia del contrato al trabajador y se registra ante la Inspectoría del Trabajo?',
          descripcion: 'Una copia del contrato debe entregarse al trabajador y otra debe registrarse ante la Inspectoría del Trabajo dentro de los 15 días siguientes.',
          fundamentoLegal: { articulo: 'Art. 60', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Copia del contrato entregada', 'Registro en Inspectoría', 'Acuse de recibo'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'CT-004', pregunta: '¿Las modificaciones del contrato se realizan por escrito y son firmadas por ambas partes?',
          descripcion: 'Toda modificación sustancial del contrato (salario, horario, funciones) debe constar por escrito y ser aceptada por el trabajador.',
          fundamentoLegal: { articulo: 'Art. 63', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Addendas o anexos al contrato', 'Comunicaciones de modificación'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '12.2',
      title: 'Modalidades de Contratación',
      description: 'Tipos de contratos y períodos especiales',
      items: [
        {
          codigo: 'CT-005', pregunta: '¿El período de prueba no excede el límite legal de 30 días?',
          descripcion: 'El período de prueba es de 30 días, prorrogable hasta 90 días por acuerdo entre las partes. Durante este período cualquiera de las partes puede desistir sin responsabilidad.',
          fundamentoLegal: { articulo: 'Art. 62', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Contratos', 'Registro de período de prueba', 'Nómina'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'CT-006', pregunta: '¿Los contratos a término fijo cumplen con los requisitos de temporalidad?',
          descripcion: 'El contrato a término fijo solo procede para actividades temporales, estacionales o suplencias. Debe especificar la causa objetiva de la temporalidad.',
          fundamentoLegal: { articulo: 'Arts. 61, 64', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH / Asesoría Legal', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Contratos a término', 'Justificación de temporalidad', 'Registro'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'CT-007', pregunta: '¿Los contratos por obra determinada tienen un objeto específico y verificable?',
          descripcion: 'El contrato por obra determinada debe especificar claramente la obra o servicio objeto del contrato, con duración limitada a su ejecución.',
          fundamentoLegal: { articulo: 'Arts. 61, 65', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Contratos por obra', 'Descripción de la obra', 'Registro'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'CT-008', pregunta: '¿Se respeta la conversión a contrato indefinido cuando se excede el plazo legal?',
          descripcion: 'Si el trabajador continúa laborando después de vencido el plazo del contrato a término, la relación se convierte en indefinida automáticamente.',
          fundamentoLegal: { articulo: 'Art. 66', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH', periodicidad: 'Mensual',
          evidenciaRequerida: ['Contratos', 'Registro de fecha de vencimiento', 'Nómina'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '12.3',
      title: 'Contratación Especial',
      description: 'Casos especiales de contratación',
      items: [
        {
          codigo: 'CT-009', pregunta: '¿Los trabajadores extranjeros tienen los permisos de trabajo y registro migratorio?',
          descripcion: 'Los trabajadores extranjeros deben contar con visa de trabajo, permiso del Ministerio del Trabajo y registro en el SAIME. No pueden exceder el 10% del personal.',
          fundamentoLegal: { articulo: 'Arts. 26, 27, 28', ley: 'LOTTT / Ley de Extranjería' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH / Asesoría Legal', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Permiso de trabajo', 'Visa', 'Registro SAIME', 'Registro Ministerio del Trabajo'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'CT-010', pregunta: '¿Los trabajadores adolescentes y aprendices tienen las autorizaciones correspondientes?',
          descripcion: 'Los adolescentes entre 14 y 18 años requieren autorización del Ministerio del Trabajo para trabajar, cumpliendo con la jornada reducida y condiciones especiales.',
          fundamentoLegal: { articulo: 'Arts. 246, 247, 248', ley: 'LOTTT / LOPNNA' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Autorización del Ministerio', 'Contrato de aprendizaje', 'Registro'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'CT-011', pregunta: '¿Los contratos de outsourcing o tercerización cumplen con los límites legales?',
          descripcion: 'La tercerización solo procede para actividades especializadas no inherentes al proceso productivo. El contratante es solidariamente responsable.',
          fundamentoLegal: { articulo: 'Arts. 47, 48, 49, 50', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia Legal / Administración', periodicidad: 'Semestral',
          evidenciaRequerida: ['Contratos de tercerización', 'Registro de contratistas', 'Registro INPSASEL'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'CT-012', pregunta: '¿Los trabajadores a tiempo parcial tienen los mismos derechos proporcionales?',
          descripcion: 'Los trabajadores a tiempo parcial (menos de 4 horas diarias) tienen los mismos derechos laborales en proporción al tiempo trabajado.',
          fundamentoLegal: { articulo: 'Art. 77', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Contratos a tiempo parcial', 'Nómina', 'Cálculo de beneficios'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    }
  ]
};
