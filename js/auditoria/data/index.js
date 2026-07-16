import mod01 from './module-01.js';
import mod02 from './module-02.js';
import mod03 from './module-03.js';
import mod04 from './module-04.js';
import mod05 from './module-05.js';
import mod06 from './module-06.js';
import mod07 from './module-07.js';
import mod08 from './module-08.js';
import mod09 from './module-09.js';
import mod10 from './module-10.js';
import mod11 from './module-11.js';
import mod12 from './module-12.js';
import mod13 from './module-13.js';
import mod14 from './module-14.js';
import mod15 from './module-15.js';
import mod16 from './module-16.js';
import mod17 from './module-17.js';
import mod18 from './module-18.js';
import mod19 from './module-19.js';
import mod20 from './module-20.js';

export const MODULES = [mod01, mod02, mod03, mod04, mod05, mod06, mod07, mod08, mod09, mod10, mod11, mod12, mod13, mod14, mod15, mod16, mod17, mod18, mod19, mod20];

export function getModuleById(id) {
  return MODULES.find(m => m.id === id) || null;
}

export function getModuleByCodigo(codigo) {
  return MODULES.find(m => m.codigo === codigo) || null;
}

export function getAllRequisitos() {
  const all = [];
  MODULES.forEach(mod => {
    mod.categoria.forEach(cat => {
      cat.items.forEach(item => {
        all.push({
          ...item,
          _moduloId: mod.id,
          _moduloCodigo: mod.codigo,
          _moduloTitle: mod.title,
          _categoriaId: cat.id,
          _categoriaTitle: cat.title
        });
      });
    });
  });
  return all;
}

export function getRequisitoByCodigo(codigo) {
  return getAllRequisitos().find(r => r.codigo === codigo) || null;
}

export function getTotalRequisitos() {
  return getAllRequisitos().length;
}

export function getModuleProgress(modId, store) {
  const mod = getModuleById(modId);
  if (!mod) return { cumplidos: 0, total: 0, pct: 0 };

  let total = 0;
  let puntos = 0;

  mod.categoria.forEach(cat => {
    cat.items.forEach(item => {
      const reqState = store.getRequisitoState(item.codigo);
      if (!reqState || reqState.status === 'no-aplica') return;
      total += item.ponderacion || 3;
      if (reqState.status === 'cumple') puntos += (item.ponderacion || 3) * 1.0;
      else if (reqState.status === 'parcial') puntos += (item.ponderacion || 3) * 0.5;
    });
  });

  return {
    cumplidos: puntos,
    total,
    pct: total > 0 ? Math.round((puntos / total) * 100) : 0
  };
}
