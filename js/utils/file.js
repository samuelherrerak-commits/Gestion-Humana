const FORMATOS_PERMITIDOS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'msg', 'eml', 'zip'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateFile(file) {
  const errors = [];
  if (!file) {
    errors.push('No se ha seleccionado ningún archivo');
    return { valid: false, errors };
  }
  const ext = file.name.split('.').pop().toLowerCase();
  if (!FORMATOS_PERMITIDOS.includes(ext)) {
    errors.push(`Formato ".${ext}" no permitido. Aceptados: ${FORMATOS_PERMITIDOS.join(', ')}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`El archivo excede ${MAX_FILE_SIZE / 1024 / 1024}MB`);
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
    pdf: '\u{1F4C4}', doc: '\u{1F4DD}', docx: '\u{1F4DD}',
    xls: '\u{1F4CA}', xlsx: '\u{1F4CA}',
    jpg: '\u{1F5BC}', jpeg: '\u{1F5BC}', png: '\u{1F5BC}', gif: '\u{1F5BC}',
    msg: '\u{2709}', eml: '\u{2709}', zip: '\u{1F4E6}'
  };
  return icons[ext?.toLowerCase()] || '\u{1F4CE}';
}
