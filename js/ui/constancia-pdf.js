import { EMPRESAS, EMPRESA_LABELS, getEmpresaByLocalidad } from '../constants.js';
import { MEMBRETE_PROSEIN, MEMBRETE_AUSTRAL, FIRMA_LUIS } from './constancia-membrete.js';
import { FONT_CGOTHIC, FONT_CGOTHIC_BOLD } from './constancia-fonts.js';
import { numeroALetras } from '../utils/numero-a-letras.js';

const MEMBRETES = {
  [EMPRESAS.PROSEIN]: MEMBRETE_PROSEIN,
  [EMPRESAS.AUSTRAL]: MEMBRETE_AUSTRAL
};

const PAGE = { w: 210, h: 272 };
const M = { top: 55, bottom: 25, left: 28, right: 28 };
const CONTENT_W = PAGE.w - M.left - M.right;
const LINE_H = 6;

function fechaEnLetras(date) {
  const d = new Date(date);
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function salarioFormateado(valor) {
  const num = Number(valor);
  if (isNaN(num) || num <= 0) return { enLetras: '_______________', numerico: '0,00' };
  const partes = num.toFixed(2).split('.');
  const entero = parseInt(partes[0]).toLocaleString('es-VE');
  return {
    enLetras: numeroALetras(num),
    numerico: `${entero}.${partes[1]}`
  };
}

function buildSegments(tipo, nombre, cedula, cargo, departamento, fechaIngreso, salario) {
  const segs = [];
  const pre = 'Por medio de la presente, Hacemos constar que el ciudadano ';
  const mid1 = ', portador de la cédula de identidad N\u00B0 ';
  const mid2 = ', se desempeña como ';
  const mid3 = ' \u2014 ';
  const mid4 = ' de esta empresa desde ';

  if (tipo === 'trabajo') {
    segs.push({ text: pre, bold: false });
    segs.push({ text: nombre, bold: true });
    segs.push({ text: mid1, bold: false });
    segs.push({ text: cedula, bold: true });
    segs.push({ text: mid2, bold: false });
    segs.push({ text: cargo, bold: true });
    segs.push({ text: mid3, bold: false });
    segs.push({ text: departamento, bold: true });
    segs.push({ text: mid4 + fechaIngreso + ', devengando una remuneración mensual de ', bold: false });
    segs.push({ text: salario.enLetras, bold: true });
    segs.push({ text: ' (Bs ' + salario.numerico + ').', bold: false });
  } else if (tipo === 'sueldo') {
    segs.push({ text: pre, bold: false });
    segs.push({ text: nombre, bold: true });
    segs.push({ text: mid1, bold: false });
    segs.push({ text: cedula, bold: true });
    segs.push({ text: ', percibe una remuneración mensual de ', bold: false });
    segs.push({ text: salario.enLetras, bold: true });
    segs.push({ text: ' (Bs ' + salario.numerico + '), devengado en su cargo de ', bold: false });
    segs.push({ text: cargo, bold: true });
    segs.push({ text: mid3, bold: false });
    segs.push({ text: departamento, bold: true });
    segs.push({ text: '.', bold: false });
  } else {
    segs.push({ text: pre, bold: false });
    segs.push({ text: nombre, bold: true });
    segs.push({ text: mid1, bold: false });
    segs.push({ text: cedula, bold: true });
    segs.push({ text: mid2, bold: false });
    segs.push({ text: cargo, bold: true });
    segs.push({ text: mid3, bold: false });
    segs.push({ text: departamento, bold: true });
    segs.push({ text: mid4 + fechaIngreso + '.', bold: false });
  }

  return segs;
}

function flattenSegmentsToWords(segments) {
  const words = [];
  for (const seg of segments) {
    const parts = seg.text.split(/\s+/).filter(w => w.length > 0);
    for (let i = 0; i < parts.length; i++) {
      words.push({ text: parts[i], bold: seg.bold });
    }
  }
  return words;
}

function calculateLines(doc, words, maxW) {
  const lines = [];
  let current = [words[0]];
  doc.setFont('CenturyGothic', words[0].bold ? 'bold' : 'normal');
  let w = doc.getTextWidth(words[0].text);

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    doc.setFont('CenturyGothic', word.bold ? 'bold' : 'normal');
    const ww = doc.getTextWidth(word.text);
    const spaceW = doc.getTextWidth(' ');
    if (w + spaceW + ww > maxW) {
      lines.push(current);
      current = [word];
      w = ww;
    } else {
      current.push(word);
      w += spaceW + ww;
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

function renderLine(doc, words, x, y, maxW, isLast) {
  let totalW = 0;
  const widths = [];
  for (const word of words) {
    doc.setFont('CenturyGothic', word.bold ? 'bold' : 'normal');
    const ww = doc.getTextWidth(word.text);
    widths.push(ww);
    totalW += ww;
  }

  const gaps = words.length - 1;
  const spaceW = doc.getTextWidth(' ');
  const extra = (isLast || gaps === 0) ? 0 : Math.max(0, (maxW - totalW - spaceW * gaps) / gaps);

  let cx = x;
  for (let i = 0; i < words.length; i++) {
    doc.setFont('CenturyGothic', words[i].bold ? 'bold' : 'normal');
    doc.text(words[i].text, cx, y);
    cx += widths[i];
    if (i < words.length - 1) cx += spaceW + extra;
  }
}

function renderSegmentBlock(doc, segments, x, startY, maxW, lineH) {
  const words = flattenSegmentsToWords(segments);
  if (words.length === 0) return startY;
  const lines = calculateLines(doc, words, maxW);
  let y = startY;
  for (let i = 0; i < lines.length; i++) {
    renderLine(doc, lines[i], x, y, maxW, i === lines.length - 1);
    y += lineH;
  }
  return y;
}

function renderSimpleText(doc, text, x, y, maxW, lineH) {
  doc.setFont('CenturyGothic', 'normal');
  const lines = doc.splitTextToSize(text, maxW);
  let cy = y;
  for (const line of lines) {
    doc.text(line, x, cy);
    cy += lineH;
  }
  return cy;
}

export function generarConstanciaPDF(constancia, empleado, opciones = {}) {
  if (!constancia || !empleado) return;

  const empresa = getEmpresaByLocalidad(empleado.localidad);
  const membrete = MEMBRETES[empresa];

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [PAGE.w, PAGE.h] });

  const rawRegular = FONT_CGOTHIC.replace(/^data:.*?;base64,/, '');
  const rawBold = FONT_CGOTHIC_BOLD.replace(/^data:.*?;base64,/, '');
  doc.addFileToVFS('Gothic.ttf', rawRegular);
  doc.addFont('Gothic.ttf', 'CenturyGothic', 'normal');
  doc.addFileToVFS('GothicB.ttf', rawBold);
  doc.addFont('GothicB.ttf', 'CenturyGothic', 'bold');

  if (membrete) {
    try {
      doc.addImage(membrete, 'PNG', 0, 0, PAGE.w, PAGE.h);
    } catch (e) { /* skip membrete */ }
  }

  const salario = salarioFormateado(opciones.salario || empleado.salario);
  const cargo = opciones.cargo || empleado.cargo || '_______________';
  const departamento = empleado.departamento || '_______________';
  const cedula = empleado.cedula || '_______________';
  const nombreCompleto = `${empleado.nombre} ${empleado.apellido}`;
  const fechaIngreso = empleado.fecha_ingreso
    ? new Date(empleado.fecha_ingreso).toLocaleDateString('es-VE')
    : '_______________';

  doc.setFont('CenturyGothic', 'normal');
  doc.setFontSize(20);
  doc.setTextColor(30, 30, 30);

  let y = M.top;

  y = renderSimpleText(doc, 'A quien pueda interesar.', M.left, y, CONTENT_W, LINE_H);
  y += 10;

  doc.setFontSize(11);
  const segs = buildSegments(constancia.tipo, nombreCompleto, cedula, cargo, departamento, fechaIngreso, salario);
  y = renderSegmentBlock(doc, segs, M.left, y, CONTENT_W, LINE_H);
  y += 4;

  if (constancia.tipo === 'recomendacion') {
    y = renderSimpleText(
      doc,
      'Durante su permanencia en la empresa demostró ser una persona responsable, comprometida y con alto sentido de ética profesional.',
      M.left, y, CONTENT_W, LINE_H
    );
    y += 4;
  }

  y = renderSimpleText(
    doc,
    'La presente constancia se expide a solicitud del interesado(a) para los fines legales que estime convenientes.',
    M.left, y, CONTENT_W, LINE_H
  );
  y += 4;

  const ciudadFecha = `Constancia que se expide a solicitud de la parte interesada en la ciudad de Caracas, el día ${fechaEnLetras(new Date())}.`;
  y = renderSimpleText(doc, ciudadFecha, M.left, y, CONTENT_W, LINE_H);
  y += 3;

  if (y + 45 > PAGE.h - M.bottom) y = PAGE.h - M.bottom - 45;

  const firmaSize = 38;
  if (FIRMA_LUIS) {
    try {
      doc.addImage(FIRMA_LUIS, 'PNG', M.left, y, firmaSize, firmaSize);
    } catch (e) { /* skip firma */ }
  }

  doc.setFont('CenturyGothic', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('Lic. Luis Paul Rojas', M.left + 2, y + firmaSize - 8);
  doc.setFont('CenturyGothic', 'normal');
  doc.setFontSize(9);
  doc.text('Gerente de Gestión Humana', M.left + 2, y + firmaSize - 3);
  doc.text('(0412) 205.11.60', M.left + 2, y + firmaSize + 2);

  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  const empresaLabel = EMPRESA_LABELS[empresa] || empresa.toUpperCase();
  doc.text(
    `${empresaLabel} — Confidencial. Este documento contiene información privilegiada.`,
    PAGE.w / 2, PAGE.h - 10, { align: 'center' }
  );

  const filename = `Constancia-${constancia.tipo}-${empleado.apellido}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
