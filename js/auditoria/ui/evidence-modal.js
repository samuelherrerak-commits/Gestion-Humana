/* ════════════════════════════════════════════════════════════
   EVIDENCE MODAL — Carga de Archivos de Evidencia
   ════════════════════════════════════════════════════════════ */

import { store } from '../engine/store.js';
import { validator } from '../engine/validator.js';
import { getRequisitoByCodigo } from '../data/index.js';
import { FORMATOS_EVIDENCIA_LABEL, MAX_FILE_SIZE } from '../constants.js';
import { formatFileSize } from '../utils/file.js';
import { refreshModuleAfterEvidence } from './module-view.js';

let _currentCodigo = null;
let _selectedFile = null;

export function initEvidenceModal() {
  const modal = document.getElementById('evidence-modal');
  const closeBtn = document.getElementById('modal-close');
  const cancelBtn = document.getElementById('modal-cancel');
  const confirmBtn = document.getElementById('modal-confirm');
  const fileInput = document.getElementById('file-input');
  const fileDrop = document.getElementById('file-drop');
  const obsTextarea = document.getElementById('modal-observaciones');

  // Cerrar
  const close = () => {
    modal.style.display = 'none';
    _currentCodigo = null;
    _selectedFile = null;
    fileInput.value = '';
    confirmBtn.disabled = true;
    obsTextarea.value = '';
    document.querySelector('.file-drop__text').innerHTML = 'Arrastra el archivo aquí o <span class="file-drop__link">selecciona uno</span>';
  };

  closeBtn.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // File drag & drop
  fileDrop.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDrop.classList.add('dragover');
  });
  fileDrop.addEventListener('dragleave', () => {
    fileDrop.classList.remove('dragover');
  });
  fileDrop.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDrop.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleFile(e.target.files[0]);
    }
  });

  // Confirmar
  confirmBtn.addEventListener('click', () => {
    if (!_currentCodigo || !_selectedFile) return;

    store.setRequisitoEvidencia(_currentCodigo, {
      name: _selectedFile.name,
      size: _selectedFile.size,
      type: _selectedFile.type,
      lastModified: _selectedFile.lastModified
    });

    // Actualizar observaciones desde modal
    if (obsTextarea.value.trim()) {
      store.setRequisitoObservaciones(_currentCodigo, obsTextarea.value.trim());
    }

    // Refrescar la UI del requisito
    refreshModuleAfterEvidence(_currentCodigo);

    close();
  });

  // Escuchar evento para abrir modal
  document.addEventListener('open-evidence-modal', (e) => {
    _currentCodigo = e.detail.codigo;
    open(_currentCodigo);
  });
}

function handleFile(file) {
  const validation = validator.validarEvidencia(file);
  const fileDrop = document.getElementById('file-drop');
  const textEl = document.querySelector('.file-drop__text');

  if (!validation.valid) {
    _selectedFile = null;
    document.getElementById('modal-confirm').disabled = true;
    textEl.innerHTML = `<span style="color:#DC2626">⚠️ ${validation.errors[0]}</span>`;
    fileDrop.classList.add('has-error');
    return;
  }

  _selectedFile = file;
  document.getElementById('modal-confirm').disabled = false;
  textEl.innerHTML = `📎 <strong>${file.name}</strong> (${formatFileSize(file.size)})`;
  fileDrop.classList.remove('has-error');
}

function open(codigo) {
  const req = getRequisitoByCodigo(codigo);
  if (!req) return;

  _currentCodigo = codigo;
  _selectedFile = null;

  document.getElementById('modal-title').textContent = `Cargar Evidencia · ${codigo}`;
  document.getElementById('modal-req-info').textContent = `${req.pregunta}`;
  document.getElementById('file-drop-formats').textContent = `${FORMATOS_EVIDENCIA_LABEL} — máx ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  document.getElementById('modal-confirm').disabled = true;
  document.getElementById('file-input').value = '';
  document.getElementById('modal-observaciones').value = '';

  document.querySelector('.file-drop__text').innerHTML = 'Arrastra el archivo aquí o <span class="file-drop__link">selecciona uno</span>';
  document.getElementById('file-drop').classList.remove('has-error');

  document.getElementById('evidence-modal').style.display = 'flex';
}
