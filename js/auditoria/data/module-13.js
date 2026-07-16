export default {
  id: 13,
  codigo: 'M13',
  title: 'Régimen Disciplinario',
  description: 'Cumplimiento del régimen sancionatorio, faltas, despidos y procedimientos disciplinarios establecidos en la LOTTT.',
  icon: '⚖️',
  activaModulos: false,
  categoria: [
    {
      id: '13.1',
      title: 'Reglamento Interior',
      description: 'Normas internas de conducta y procedimientos',
      items: [
        {
          codigo: 'DS-001', pregunta: '¿La empresa tiene un Reglamento Interior de Trabajo aprobado?',
          descripcion: 'Las empresas con más de 10 trabajadores deben tener un Reglamento Interior de Trabajo aprobado por la Inspectoría del Trabajo.',
          fundamentoLegal: { articulo: 'Arts. 68, 69', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH / Asesoría Legal', periodicidad: 'Anual',
          evidenciaRequerida: ['Reglamento Interior aprobado', 'Registro en Inspectoría', 'Publicación'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'DS-002', pregunta: '¿El Reglamento Interior está publicado y es conocido por los trabajadores?',
          descripcion: 'El Reglamento Interior debe estar publicado en lugares visibles de la empresa y ser comunicado formalmente a todos los trabajadores.',
          fundamentoLegal: { articulo: 'Art. 69', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'Anual',
          evidenciaRequerida: ['Registro de publicación', 'Constancias de recepción', 'Fotografías'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'DS-003', pregunta: '¿El Reglamento Interior contiene el régimen sancionatorio y las faltas claramente definidas?',
          descripcion: 'Debe incluir la clasificación de faltas (leves, graves, muy graves), las sanciones aplicables y el procedimiento disciplinario.',
          fundamentoLegal: { articulo: 'Arts. 68, 78', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Asesoría Legal', periodicidad: 'Anual',
          evidenciaRequerida: ['Reglamento Interior', 'Lista de faltas y sanciones'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '13.2',
      title: 'Faltas y Sanciones',
      description: 'Procedimiento disciplinario y sanciones',
      items: [
        {
          codigo: 'DS-004', pregunta: '¿Se sigue el debido proceso antes de aplicar una sanción disciplinaria?',
          descripcion: 'Debe garantizarse el derecho a la defensa: notificación escrita de la falta, oportunidad de descargo, plazo razonable y proporcionalidad de la sanción.',
          fundamentoLegal: { articulo: 'Arts. 78, 79', ley: 'LOTTT / CRBV Art. 49' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH / Asesoría Legal', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Comunicación de falta', 'Descargo del trabajador', 'Decisión motivada'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'DS-005', pregunta: '¿Las sanciones son proporcionales a la falta cometida?',
          descripcion: 'La sanción debe ser proporcional a la gravedad de la falta, sin que puedan aplicarse sanciones no previstas en el Reglamento Interior.',
          fundamentoLegal: { articulo: 'Arts. 78, 79', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Registro de sanciones', 'Reglamento Interior', 'Comunicaciones'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'DS-006', pregunta: '¿Se lleva un registro escrito de las sanciones aplicadas a los trabajadores?',
          descripcion: 'Debe mantenerse un expediente disciplinario por trabajador con todas las sanciones aplicadas, fechas, causas y descargos.',
          fundamentoLegal: { articulo: 'Arts. 78, 80', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Departamento de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Expedientes disciplinarios', 'Registro de sanciones'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '13.3',
      title: 'Despido',
      description: 'Procedimiento y causales de despido',
      items: [
        {
          codigo: 'DS-007', pregunta: '¿Los despidos justificados se basan en causales legales previstas en la LOTTT?',
          descripcion: 'El despido justificado debe fundarse en las causales taxativas del Art. 79 LOTTT. La empresa debe probar la falta del trabajador.',
          fundamentoLegal: { articulo: 'Art. 79', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH / Asesoría Legal', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Carta de despido', 'Pruebas de la falta', 'Registro del procedimiento'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'DS-008', pregunta: '¿Se paga el doble de la indemnización en caso de despido injustificado?',
          descripcion: 'Si el despido es declarado injustificado, la empresa debe pagar el doble de las prestaciones sociales e indemnizaciones establecidas.',
          fundamentoLegal: { articulo: 'Arts. 92, 93', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Asesoría Legal / Finanzas', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Cálculo de indemnización', 'Recibo de pago', 'Acta de mediación'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'DS-009', pregunta: '¿Se entrega la carta de despido con los requisitos formales exigidos?',
          descripcion: 'La carta de despido debe contener: fecha, causa legal, hechos concretos, lugar y fecha del despido, y la firma del empleador.',
          fundamentoLegal: { articulo: 'Arts. 80, 81', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Carta de despido', 'Registro de entrega', 'Acuse de recibo'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'DS-010', pregunta: '¿La empresa tiene un procedimiento documentado para manejo de conflictos laborales?',
          descripcion: 'Debe existir un procedimiento interno para la gestión de conflictos laborales, quejas y reclamaciones, con canales formales de comunicación.',
          fundamentoLegal: { articulo: 'Arts. 68, 69', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Gerencia de RRHH', periodicidad: 'Anual',
          evidenciaRequerida: ['Procedimiento de conflictos', 'Registro de quejas', 'Actas de mediación'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    }
  ]
};
