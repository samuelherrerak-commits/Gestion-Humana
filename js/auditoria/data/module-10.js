export default {
  id: 10,
  codigo: 'M10',
  title: 'Protección Familiar',
  description: 'Derechos de maternidad, paternidad, lactancia, permisos familiares y protección integral de la familia trabajadora.',
  icon: '👨‍👩‍👧‍👦',
  activaModulos: false,
  categoria: [
    {
      id: '10.1',
      title: 'Maternidad y Paternidad',
      description: 'Reposos y permisos parentales',
      items: [
        {
          codigo: 'PF-001', pregunta: '¿Se concede el reposo prenatal de 6 semanas y postnatal de 20 semanas?',
          descripcion: 'La trabajadora tiene derecho a 6 semanas de reposo prenatal y 20 semanas de reposo postnatal, con pago del 100% del salario.',
          fundamentoLegal: { articulo: 'Arts. 335, 336, 337', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Certificado médico', 'Reposo aprobado', 'Nómina con pago'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PF-002', pregunta: '¿Se concede el permiso de paternidad de 14 días continuos?',
          descripcion: 'El trabajador padre tiene derecho a 14 días continuos de permiso postnatal, pagados al 100% por la empresa.',
          fundamentoLegal: { articulo: 'Art. 338', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Acta de nacimiento', 'Permiso aprobado', 'Nómina con pago'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PF-003', pregunta: '¿Se protege la inamovilidad laboral de la trabajadora en estado de gravidez?',
          descripcion: 'La trabajadora embarazada goza de inamovilidad laboral desde el inicio del embarazo hasta 2 años después del parto. No puede ser despedida sin autorización judicial.',
          fundamentoLegal: { articulo: 'Arts. 339, 340', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH / Asesoría Legal', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Registro de trabajadoras', 'Notificación de embarazo', 'Evaluación de riesgo'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PF-004', pregunta: '¿Se permite la adopción con los mismos beneficios de maternidad/paternidad?',
          descripcion: 'Los trabajadores que adopten tienen derecho a los mismos reposos y beneficios postnatal que los padres biológicos.',
          fundamentoLegal: { articulo: 'Art. 337', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Documento de adopción', 'Permiso aprobado', 'Nómina con pago'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '10.2',
      title: 'Lactancia',
      description: 'Derechos de lactancia materna',
      items: [
        {
          codigo: 'PF-005', pregunta: '¿Se concede el permiso de lactancia de 2 horas diarias hasta los 24 meses?',
          descripcion: 'La trabajadora tiene derecho a 2 horas diarias de permiso para lactar, durante los 24 meses posteriores al parto, sin pérdida de salario.',
          fundamentoLegal: { articulo: 'Arts. 342, 343', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Solicitud de lactancia', 'Registro de permiso', 'Nómina'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PF-006', pregunta: '¿La empresa dispone de una sala de lactancia o espacio adecuado?',
          descripcion: 'Las empresas con más de 20 trabajadoras deben disponer de una sala de lactancia o espacio adecuado para que las madres puedan extraerse leche.',
          fundamentoLegal: { articulo: 'Art. 344', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH / Infraestructura', periodicidad: 'Anual',
          evidenciaRequerida: ['Fotografías de la sala', 'Registro de uso', 'Certificación'],
          formatoPermitido: ['jpg', 'png', 'pdf'], tipoEvidencia: ['Imagen', 'PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PF-007', pregunta: '¿Se permite la reducción de jornada por lactancia sin reducción salarial?',
          descripcion: 'La trabajadora puede optar por reducir su jornada en 2 horas diarias al inicio o final de la jornada, sin reducción del salario.',
          fundamentoLegal: { articulo: 'Art. 343', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Solicitud de reducción', 'Acuerdo firmado', 'Nómina'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '10.3',
      title: 'Permisos y Protección Familiar',
      description: 'Permisos por responsabilidades familiares',
      items: [
        {
          codigo: 'PF-008', pregunta: '¿Se concede permiso por matrimonio de 3 días hábiles?',
          descripcion: 'El trabajador tiene derecho a 3 días hábiles de permiso remunerado por motivo de matrimonio.',
          fundamentoLegal: { articulo: 'Art. 186', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Acta de matrimonio', 'Solicitud de permiso', 'Nómina'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PF-009', pregunta: '¿Se concede permiso por fallecimiento de familiar de 3 días hábiles?',
          descripcion: 'El trabajador tiene derecho a 3 días hábiles de permiso remunerado por fallecimiento del cónyuge, hijos, padres o hermanos.',
          fundamentoLegal: { articulo: 'Art. 186', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Acta de defunción', 'Solicitud de permiso', 'Nómina'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PF-010', pregunta: '¿Se concede permiso por enfermedad de familiar hasta 5 días?',
          descripcion: 'El trabajador tiene derecho a permiso remunerado por enfermedad grave de familiar hasta 5 días, prorrogables por prescripción médica.',
          fundamentoLegal: { articulo: 'Art. 186', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Certificado médico', 'Solicitud de permiso', 'Nómina'],
          formatoPermitido: ['pdf', 'jpg', 'png'], tipoEvidencia: ['PDF', 'Imagen'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PF-011', pregunta: '¿Se concede permiso por guarda o cuidado de hijos menores de edad?',
          descripcion: 'El trabajador tiene derecho a permiso para la guarda y cuidado de hijos menores, especialmente en casos de enfermedad o emergencia.',
          fundamentoLegal: { articulo: 'Arts. 186, 341', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Solicitud', 'Justificación médica', 'Registro de permisos'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'PF-012', pregunta: '¿Existe una política formal de permisos familiares comunicada a los trabajadores?',
          descripcion: 'La empresa debe tener una política clara de permisos familiares, conocida por todos los trabajadores, que cumpla con la LOTTT.',
          fundamentoLegal: { articulo: 'Arts. 186, 345', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Gerencia de RRHH', periodicidad: 'Anual',
          evidenciaRequerida: ['Política de permisos', 'Registro de comunicaciones', 'Manual del trabajador'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 60,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    }
  ]
};
