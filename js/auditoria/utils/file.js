/* ════════════════════════════════════════════════════════════
   FILE VALIDATION UTILITIES
   ════════════════════════════════════════════════════════════ */

import { FORMATOS_PERMITIDOS, MAX_FILE_SIZE } from '../constants.js';

export function validateFile(file) {
  const errors = [];

  if (!file) {
    errors.push('No se ha seleccionado ningún archivo');
    return { valid: false, errors };
  }

  const ext = file.name.split('.').pop().toLowerCase();

  if (!FORMATOS_PERMITIDOS.includes(ext)) {
    errors.push(`Formato ".${ext}" no permitido. Formatos aceptados: ${FORMATOS_PERMITIDOS.join(', ')}`);
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push(`El archivo excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  return { valid: errors.length === 0, errors };
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileIcon(ext) {
  const icons = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    jpg: '🖼',
    jpeg: '🖼',
    png: '🖼',
    msg: '✉️',
    eml: '✉️',
    zip: '📦',
    mp4: '🎬',
    avi: '🎬'
  };
  return icons[ext.toLowerCase()] || '📎';
}
