export default {
  id: 14,
  codigo: 'M14',
  title: 'Relaciones Colectivas',
  description: 'Cumplimiento de los derechos de sindicalización, negociación colectiva, fuero sindical y solución de conflictos colectivos.',
  icon: '🤝',
  activaModulos: false,
  categoria: [
    {
      id: '14.1',
      title: 'Libertad Sindical',
      description: 'Derecho a la sindicalización y fuero sindical',
      items: [
        {
          codigo: 'RC-001', pregunta: '¿Se respeta el derecho de los trabajadores a constituir sindicatos sin injerencia de la empresa?',
          descripcion: 'La empresa no puede obstaculizar la constitución de sindicatos, ni condicionar el empleo a la afiliación o desafiliación sindical.',
          fundamentoLegal: { articulo: 'Arts. 355, 356, 357', ley: 'LOTTT / CRBV Art. 95' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia General / Asesoría Legal', periodicidad: 'Permanente',
          evidenciaRequerida: ['Registro de sindicatos', 'Comunicaciones', 'Política de libertad sindical'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'RC-002', pregunta: '¿Se reconoce y respeta el fuero sindical de los directivos sindicales?',
          descripcion: 'Los directivos sindicales gozan de inamovilidad laboral desde su elección hasta 2 años después de cesar en el cargo. No pueden ser despedidos sin autorización judicial.',
          fundamentoLegal: { articulo: 'Arts. 358, 359, 360', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH / Asesoría Legal', periodicidad: 'Permanente',
          evidenciaRequerida: ['Registro de directivos sindicales', 'Comunicaciones de fuero', 'Nómina'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'RC-003', pregunta: '¿Se concede el permiso sindical a los directivos para el ejercicio de sus funciones?',
          descripcion: 'La empresa debe conceder permisos sindicales remunerados a los directivos para ejercer sus funciones gremiales, sin afectar su salario ni beneficios.',
          fundamentoLegal: { articulo: 'Arts. 360, 361', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Gerencia de RRHH', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Solicitudes de permiso sindical', 'Registro de permisos', 'Nómina'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'RC-004', pregunta: '¿Se descuenta y entrega la cuota sindical a los sindicatos cuando el trabajador lo autoriza?',
          descripcion: 'La empresa debe descontar la cuota sindical de la nómina cuando el trabajador lo autorice por escrito y entregarla al sindicato correspondiente.',
          fundamentoLegal: { articulo: 'Art. 362', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Departamento de Nómina', periodicidad: 'Mensual',
          evidenciaRequerida: ['Autorizaciones de descuento', 'Comprobantes de entrega', 'Nómina'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '14.2',
      title: 'Contratación Colectiva',
      description: 'Negociación y cumplimiento de convenciones colectivas',
      items: [
        {
          codigo: 'RC-005', pregunta: '¿Existe una Convención Colectiva vigente en la empresa?',
          descripcion: 'Si existe un sindicato, la empresa debe negociar una convención colectiva cuando esta sea solicitada. Verificar su existencia, vigencia y contenido.',
          fundamentoLegal: { articulo: 'Arts. 396, 397', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia General / Asesoría Legal', periodicidad: 'Anual',
          evidenciaRequerida: ['Convención Colectiva', 'Acta de depósito', 'Registro en Inspectoría'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 30,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'RC-006', pregunta: '¿Se cumplen las cláusulas económicas y sociales de la Convención Colectiva?',
          descripcion: 'Verificar que todos los beneficios pactados en la convención colectiva (salariales, sociales, recreacionales) se estén cumpliendo efectivamente.',
          fundamentoLegal: { articulo: 'Arts. 416, 417, 418', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia de RRHH / Finanzas', periodicidad: 'Mensual',
          evidenciaRequerida: ['Nómina', 'Registro de beneficios', 'Cumplimiento de cláusulas'],
          formatoPermitido: ['pdf', 'xlsx'], tipoEvidencia: ['PDF', 'Excel'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'RC-007', pregunta: '¿La Convención Colectiva está depositada ante la Inspectoría del Trabajo?',
          descripcion: 'La Convención Colectiva debe ser depositada ante la Inspectoría del Trabajo dentro de los 15 días siguientes a su firma para que produzca efectos legales.',
          fundamentoLegal: { articulo: 'Arts. 400, 401', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Asesoría Legal', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Convención depositada', 'Comprobante de depósito', 'Registro'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'RC-008', pregunta: '¿Se inicia el proceso de negociación colectiva con antelación al vencimiento de la Convención?',
          descripcion: 'La negociación debe iniciarse al menos 3 meses antes del vencimiento de la Convención Colectiva vigente.',
          fundamentoLegal: { articulo: 'Arts. 398, 399', ley: 'LOTTT' },
          nivelRiesgo: 'MEDIO', responsable: 'Gerencia General / Asesoría Legal', periodicidad: 'Anual',
          evidenciaRequerida: ['Cronograma de negociación', 'Comunicaciones', 'Actas de reuniones'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 60,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    },
    {
      id: '14.3',
      title: 'Conflictos Colectivos',
      description: 'Solución de conflictos colectivos de trabajo',
      items: [
        {
          codigo: 'RC-009', pregunta: '¿Se ha presentado pliego de peticiones y cuál ha sido su tramitación?',
          descripcion: 'En caso de pliego de peticiones, debe seguirse el procedimiento legal ante la Inspectoría del Trabajo, con mediación obligatoria.',
          fundamentoLegal: { articulo: 'Arts. 467, 468, 469', ley: 'LOTTT' },
          nivelRiesgo: 'ALTO', responsable: 'Asesoría Legal', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Pliego de peticiones', 'Actas de mediación', 'Resolución'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        },
        {
          codigo: 'RC-010', pregunta: '¿Se garantiza el derecho de huelga y se respeta el procedimiento legal?',
          descripcion: 'En caso de huelga, debe cumplirse con los requisitos legales (votación, notificación a la Inspectoría, servicios mínimos). No puede haber represalias.',
          fundamentoLegal: { articulo: 'Arts. 481, 482, 483, 484', ley: 'LOTTT' },
          nivelRiesgo: 'CRÍTICO', responsable: 'Gerencia General / Asesoría Legal', periodicidad: 'A requerimiento',
          evidenciaRequerida: ['Notificación de huelga', 'Votación', 'Registro de servicios mínimos'],
          formatoPermitido: ['pdf'], tipoEvidencia: ['PDF'], diasAlerta: 15,
          status: null, evidencia: null, evidenciaStatus: null, observaciones: '',
          fechaVencimiento: null, fechaRevision: null, auditorResponsable: '',
          hallazgo: { descripcion: '', nivelRiesgoHallazgo: null, recomendacion: '', responsableAccion: '', fechaCompromiso: null, costoEstimado: null, prioridad: null, estadoPlan: 'abierto' }
        }
      ]
    }
  ]
};
