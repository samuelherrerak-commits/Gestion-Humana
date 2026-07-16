/* ════════════════════════════════════════════════════════════
   REPORT MODAL — Generación y descarga del informe con IA
   ════════════════════════════════════════════════════════════ */

import { generarInforme } from '../engine/nvidia-client.js';
import { recolectarDatosAuditoria, construirPromptUsuario } from '../engine/report-generator.js';
import { store } from '../engine/store.js';
import { api } from '../utils/api-client.js';

const SYSTEM_PROMPT_SYSTEM = `Eres un auditor laboral senior con 20 años de experiencia especializado en legislación laboral venezolana (LOTTT, LOPCYMAT, IVSS, INCES, FAOV, Ley de Alimentación, Ley de Discapacidad, Código de Comercio y normativa del MINPPTRASS).

Debes generar un INFORME DE AUDITORÍA LABORAL profesional en español, con lenguaje formal y técnico, listo para presentar a la Junta Directiva.

Estructura obligatoria del informe:

# INFORME DE AUDITORÍA DE CUMPLIMIENTO LEGAL LABORAL

## 1. DATOS DE LA AUDITORÍA
- Nombre de la auditoría, fecha, auditor responsable, módulos evaluados

## 2. RESUMEN EJECUTIVO
- ISL, LCS (Clase), total requisitos, cumplidos, parciales, no cumplidos, N/A, hallazgos por criticidad, plan de acción, vencimientos

## 3. PUNTOS FUERTES
Módulos con mayor cumplimiento y por qué son importantes legalmente.

## 4. PUNTOS DÉBILES
Por cada módulo con incumplimientos: código, pregunta, riesgo, explicación, consecuencias legales.

## 5. ANÁLISIS POR MÓDULO
Analiza CADA MÓDULO individualmente en orden. Para cada uno:
- Porcentaje de cumplimiento
- Ítems críticos incumplidos o con problemas
- Fortalezas del módulo
- Recomendaciones específicas para ese módulo
- Consecuencias legales de los incumplimientos detectados

## 6. RIESGOS DETECTADOS
Clasificados en CRÍTICOS, ALTOS, MEDIOS, BAJOS con impacto legal y operativo.

## 7. RECOMENDACIONES
Priorizadas por criticidad, accionables y concretas.

## 8. PLAN DE ACCIÓN PROPUESTO
Tabla: prioridad, código, acción correctiva, área responsable, plazo.

## 9. CONCLUSIONES FINALES

REGLAS ESTRICTAS:
- No inventes datos. Usa exclusivamente la información proporcionada.
- No incluyas instrucciones, metadatos ni texto adicional fuera del informe.
- Si faltan datos para una sección, indícalo claramente.
- Incluye referencias a leyes venezolanas cuando sea pertinente.
- En la sección 5 (Análisis por Módulo), NO te limites a una tabla genérica. Desarrolla un párrafo de análisis para cada módulo explicando la situación particular de ese módulo.
- Tu respuesta debe contener ÚNICAMENTE el informe, sin prefacios ni comentarios.`;

let _reporteGenerado = '';

export function abrirModalInforme() {
  const modal = document.getElementById('report-modal');
  if (!modal) return;
  modal.style.display = 'flex';

  const content = document.getElementById('report-content');
  const status = document.getElementById('report-status');
  const actions = document.getElementById('report-actions');

  content.innerHTML = '';
  status.style.display = 'block';
  status.innerHTML = `
    <div style="text-align:center;padding:40px;">
      <div style="font-size:3rem;margin-bottom:16px;">🤖</div>
      <h3 style="margin-bottom:8px;">Generando informe de auditoría...</h3>
      <p style="color:var(--color-text-secondary);margin-bottom:16px;">
        La IA está analizando los ${store.state.auditoria.nombre || 'datos de la auditoría'}
      </p>
      <div style="width:200px;height:6px;background:var(--color-gray-200);border-radius:3px;margin:0 auto;overflow:hidden;">
        <div style="width:100%;height:100%;background:var(--color-blue-600);border-radius:3px;animation:pulse 1.5s ease-in-out infinite;"></div>
      </div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 0.3; width: 30%; }
        50% { opacity: 1; width: 80%; }
      }
    </style>
  `;
  actions.style.display = 'none';

  // Generar informe en segundo plano
  generarInformeAsync(content, status, actions);
}

async function generarInformeAsync(contentEl, statusEl, actionsEl) {
  try {
    const datos = recolectarDatosAuditoria();
    const promptUsuario = construirPromptUsuario(datos);

    const informe = await generarInforme(SYSTEM_PROMPT_SYSTEM, promptUsuario);
    _reporteGenerado = informe;

    // Guardar en Supabase
    const audId = store.state.auditoria?.id;
    if (audId) {
      api.createInforme({ auditoria_id: audId, contenido: informe })
        .catch(e => console.warn('[Report] error saving informe:', e));
    }

    statusEl.style.display = 'none';
    contentEl.innerHTML = renderizarMarkdownComoHTML(informe);
    actionsEl.style.display = 'flex';
  } catch (error) {
    statusEl.innerHTML = `
      <div style="text-align:center;padding:40px;">
        <div style="font-size:3rem;margin-bottom:16px;">❌</div>
        <h3 style="margin-bottom:8px;color:var(--color-danger);">Error al generar el informe</h3>
        <p style="color:var(--color-text-secondary);margin-bottom:16px;">
          ${error.message || 'Ocurrió un error inesperado. Verifica tu conexión a internet e intenta nuevamente.'}
        </p>
        <button class="btn btn--primary" onclick="window.__retryGenerate()">Reintentar</button>
      </div>
    `;
    actionsEl.style.display = 'none';

    // Exponer la función de reintento
    window.__retryGenerate = () => abrirModalInforme();
  }
}

function renderizarMarkdownComoHTML(md) {
  let html = md
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  html = `<div class="reporto">${html}</div>`;
  return html
    .replace(/<p><\/p>/g, '')
    .replace(/<br><br>/g, '</p><p>');
}

function _renderParrafo(doc, text, x, w, lineH) {
  const lines = doc.splitTextToSize(text, w);
  for (let i = 0; i < lines.length; i++) {
    if (doc.y + lineH > 280) doc.addPage();
    doc.text(lines[i], x, doc.y, { align: 'left' });
    doc.y += lineH;
  }
}

export function descargarPDF() {
  if (!_reporteGenerado) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = 190;
  const m = 10;
  doc.y = 20;

  const user = store.state.authUser || {};
  const emp = store.state.infoEmpresa || {};

  // Encabezado del PDF
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 27, 45);
  doc.text('INFORME DE AUDITORÍA', m, doc.y);
  doc.y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Cumplimiento Legal Laboral · República Bolivariana de Venezuela', m, doc.y);
  doc.y += 8;

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.6);
  doc.line(m, doc.y, pageW + m, doc.y);
  doc.y += 6;

  const hoy = new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Fecha de emisión: ${hoy}`, m, doc.y); doc.y += 4;
  doc.text(`Auditoría: ${store.state.auditoria.nombre || 'Auditoría General'}`, m, doc.y); doc.y += 4;
  if (emp.razonSocial) { doc.text(`Empresa: ${emp.razonSocial}`, m, doc.y); doc.y += 4; }
  if (user.nombre) { doc.text(`Auditor responsable: ${user.nombre} (${user.email || ''})`, m, doc.y); doc.y += 4; }

  doc.y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(m, doc.y, pageW + m, doc.y);
  doc.y += 6;

  // Contenido del informe — párrafos alineados a la izquierda
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');

  const parrafos = _limpiarTextoParaPDF(_reporteGenerado);
  for (const p of parrafos) {
    if (doc.y > 265) doc.addPage();

    const primera = p.split('\n')[0].trim();

    if (primera.match(/^\d+\.\s/) || primera.startsWith('INFORME DE AUDITORÍA') || primera.startsWith('INFORME DE')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 27, 45);
      doc.text(primera, m, doc.y);
      doc.y += 7;
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');

    } else if (p.startsWith('- ') || p.startsWith('  - ')) {
      const bullets = p.split('\n').filter(l => l.trim().startsWith('-'));
      for (const b of bullets) {
        if (doc.y > 270) doc.addPage();
        doc.text(b.replace(/^\s*-\s*/, '- '), m + 5, doc.y);
        doc.y += 5;
      }

    } else {
      _renderParrafo(doc, p, m, pageW, 5);
      doc.y += 2;
    }
  }

  // Footer en todas las páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(`Página ${i} de ${totalPages} · Auditoría RRHH · Compliance Center`, m, 290);
  }

  doc.save(`Informe-Auditoria-Laboral-${new Date().toISOString().split('T')[0]}.pdf`);
}

function _limpiarTextoParaPDF(texto) {
  return texto
    .replace(/^#+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

export function mostrarInformeGuardado(contenido) {
  const modal = document.getElementById('report-modal');
  if (!modal) return;
  modal.style.display = 'flex';

  const content = document.getElementById('report-content');
  const status = document.getElementById('report-status');
  const actions = document.getElementById('report-actions');

  _reporteGenerado = contenido;
  status.style.display = 'none';
  content.innerHTML = renderizarMarkdownComoHTML(contenido);
  actions.style.display = 'flex';
}

export function descargarWord() {
  if (!_reporteGenerado) return;
  const contenidoHTML = renderizarMarkdownComoHTML(_reporteGenerado);
  const user = store.state.authUser || {};
  const emp = store.state.infoEmpresa || {};
  const hoy = new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
  const titulo = store.state.auditoria.nombre || 'Auditoría General';

  const docHTML = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="utf-8"><title>Informe de Auditoría</title>
<style>
  body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; margin: 40px; }
  h1 { font-size: 18pt; color: #0F1B2D; border-bottom: 2px solid #2563EB; padding-bottom: 8px; }
  h2 { font-size: 14pt; color: #1A2D4A; margin-top: 24px; }
  h3 { font-size: 12pt; color: #1A2D4A; margin-top: 18px; }
  h4 { font-size: 11pt; color: #1A2D4A; margin-top: 14px; }
  .header { font-size: 9pt; color: #64748b; margin-bottom: 4px; }
  strong { color: #0F1B2D; }
  ul { margin: 6px 0; padding-left: 24px; }
  li { margin-bottom: 4px; }
  p { margin: 6px 0; }
  .footer { margin-top: 40px; font-size: 8pt; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px; }
</style></head><body>
  <h1>INFORME DE AUDITORÍA</h1>
  <p class="header"><strong>Fecha de emisión:</strong> ${hoy}</p>
  <p class="header"><strong>Auditoría:</strong> ${titulo}</p>
  ${emp.razonSocial ? `<p class="header"><strong>Empresa:</strong> ${emp.razonSocial}</p>` : ''}
  ${user.nombre ? `<p class="header"><strong>Auditor responsable:</strong> ${user.nombre}${user.email ? ` (${user.email})` : ''}</p>` : ''}
  ${contenidoHTML}
  <div class="footer">Documento generado por Compliance Center · Auditoría Legal RRHH</div>
</body></html>`;

  const blob = new Blob([docHTML], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Informe-Auditoria-Laboral-${new Date().toISOString().split('T')[0]}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function cerrarModalInforme() {
  const modal = document.getElementById('report-modal');
  if (modal) modal.style.display = 'none';
}
