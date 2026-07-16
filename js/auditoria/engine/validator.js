/* ════════════════════════════════════════════════════════════
   VALIDATOR — Reglas de Validación de Negocio
   ════════════════════════════════════════════════════════════
   Reglas:
   1. No se permite "Cumple" ni "Cumple Parcial" sin evidencia cargada
   2. No se permite "No Cumple" sin al menos descripción del hallazgo
   3. No se permite cerrar auditoría si hay "Cumple" o "Parcial" sin evidencia
   ════════════════════════════════════════════════════════════ */

import { STATUS } from '../constants.js';
import { getAllRequisitos } from '../data/index.js';
import { store } from './store.js';
import { validateFile } from '../utils/file.js';

class Validator {

  /**
   * Valida si se puede asignar "Cumple" o "Cumple Parcial" a un requisito.
   * Ambos requieren evidencia probatoria.
   * @param {string} codigo - Código del requisito
   * @returns {{ valid: boolean, error: string|null }}
   */
  validarRequerimientoEvidencia(codigo) {
    const reqState = store.getRequisitoState(codigo);
    if (!reqState) return { valid: false, error: 'Requisito no encontrado' };

    if (!reqState.evidencia) {
      return {
        valid: false,
        error: 'Debe adjuntar la evidencia probatoria para marcar esta obligación como cumplida o parcialmente cumplida'
      };
    }

    return { valid: true, error: null };
  }

  /**
   * Valida un archivo de evidencia
   * @param {File} file
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validarEvidencia(file) {
    return validateFile(file);
  }

  /**
   * Valida si se puede cerrar la auditoría completa.
   * Busca requisitos marcados como "Cumple" o "Parcial" sin evidencia.
   * @returns {{ puedeCerrar: boolean, pendientes: Array }}
   */
  validarCierreAuditoria() {
    const reqs = getAllRequisitos();
    const pendientes = [];

    reqs.forEach(r => {
      const st = store.getRequisitoState(r.codigo);
      if ((st?.status === STATUS.CUMPLE || st?.status === STATUS.PARCIAL) && !st.evidencia) {
        pendientes.push({
          codigo: r.codigo,
          modulo: r._moduloTitle,
          pregunta: r.pregunta
        });
      }
    });

    return {
      puedeCerrar: pendientes.length === 0,
      pendientes
    };
  }

  /**
   * Valida que los hallazgos tengan contenido mínimo
   */
  validarHallazgo(hallazgoData) {
    const errors = [];
    if (!hallazgoData.descripcion || hallazgoData.descripcion.trim() === '') {
      errors.push('La descripción del hallazgo es requerida');
    }
    if (!hallazgoData.recomendacion || hallazgoData.recomendacion.trim() === '') {
      errors.push('La recomendación es requerida');
    }
    if (!hallazgoData.responsableAccion || hallazgoData.responsableAccion.trim() === '') {
      errors.push('El responsable de la acción es requerido');
    }
    if (!hallazgoData.fechaCompromiso) {
      errors.push('La fecha compromiso es requerida');
    }
    return { valid: errors.length === 0, errors };
  }

  /**
   * Verifica si un cambio de estado es válido
   */
  validarCambioEstado(codigo, nuevoStatus) {
    if (nuevoStatus === STATUS.CUMPLE || nuevoStatus === STATUS.PARCIAL) {
      return this.validarRequerimientoEvidencia(codigo);
    }
    return { valid: true, error: null };
  }
}

export const validator = new Validator();
