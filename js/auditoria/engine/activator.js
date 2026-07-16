/* ════════════════════════════════════════════════════════════
   ACTIVATOR — Motor de Activación Dinámica de Requisitos
   ════════════════════════════════════════════════════════════
   Basado en los datos del Módulo 1 (Información General),
   activa/desactiva automáticamente requisitos en otros módulos.
   ════════════════════════════════════════════════════════════ */

import { MODULES, getAllRequisitos } from '../data/index.js';
import { store } from './store.js';

class Activator {
  constructor() {
    this._rules = this._buildRules();
  }

  _buildRules() {
    return {
      'habilitarGuarderia': (info) => info.numTrabajadores >= 20,
      'habilitarINCES': (info) => info.numTrabajadores >= 5,
      'habilitarONA': (info) => info.numTrabajadores >= 50,
      'habilitarDiscapacidad': (info) => info.numTrabajadores >= 25,
      'habilitarSSTPropio': (info) => info.numTrabajadores >= 100,
      'habilitarComiteSST': (info) => info.numTrabajadores >= 50,
      'habilitarExtranjeros': (info) => info.trabajadoresExtranjeros === true,
      'habilitarTercerizados': (info) => info.tercerizados === true,
      'habilitarSindicato': (info) => info.sindicato === true,
      'habilitarAprendices': (info) => info.adolescentesAprendices === true,
      'habilitarContratistas': (info) => info.contratistas === true
    };
  }

  /**
   * Evalúa todas las reglas y actualiza el estado de activación
   * @returns {Object} Mapa de reglas activas
   */
  evaluar() {
    const info = store.state.infoEmpresa;
    if (!info.numTrabajadores && info.numTrabajadores !== 0) return {};

    const activaciones = {};
    Object.entries(this._rules).forEach(([key, rule]) => {
      try {
        activaciones[key] = rule(info);
      } catch (e) {
        activaciones[key] = false;
      }
    });

    return activaciones;
  }

  /**
   * Devuelve los códigos de requisitos que deben estar activos según
   * las reglas de activación.
   */
  getRequisitosActivos() {
    const activaciones = this.evaluar();
    const todos = getAllRequisitos();
    const activos = [];

    // Todos los requisitos son activos por defecto, excepto los que
    // están condicionados por reglas específicas
    const reglasRequisitos = {
      'habilitarGuarderia': ['PF-012', 'PF-013', 'PF-014'],
      'habilitarINCES': ['INCES-001', 'INCES-002', 'INCES-003', 'INCES-004', 'INCES-005', 'INCES-006', 'INCES-011', 'INCES-012'],
      'habilitarExtranjeros': ['CT-008', 'CT-009', 'CT-010'],
      'habilitarDiscapacidad': ['CT-011', 'CT-012'],
      'habilitarAprendices': ['CT-013', 'CT-014'],
      'habilitarSindicato': [] // requisitos de contratación colectiva (futuro)
    };

    todos.forEach(r => {
      let activo = true;

      Object.entries(reglasRequisitos).forEach(([regla, codigos]) => {
        if (codigos.includes(r.codigo) && !activaciones[regla]) {
          activo = false;
        }
      });

      activos.push({ codigo: r.codigo, activo });
    });

    return activos;
  }

  /**
   * Verifica si un requisito específico está activo
   */
  isActivo(codigo) {
    const activos = this.getRequisitosActivos();
    const req = activos.find(a => a.codigo === codigo);
    return req ? req.activo : true;
  }
}

export const activator = new Activator();
