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

function buildSegmentsStandard(tipo, nombre, cedula, cargo, departamento, fechaIngreso, salario) {
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

function formatDateShort(dateStr) {
  if (!dateStr) return '_______________';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-VE');
}

function fechaReincorporacion(fechaFin) {
  if (!fechaFin) return '_______________';
  const d = new Date(fechaFin + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('es-VE');
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

  if (constancia.tipo === 'vacaciones') {
    renderVacacionesConstancia(doc, constancia, empleado, opciones);
  } else {
    renderStandardConstancia(doc, constancia, empleado, opciones);
  }

  const filename = `Constancia-${constancia.tipo}-${empleado.apellido}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

function renderStandardConstancia(doc, constancia, empleado, opciones) {
  const empresa = getEmpresaByLocalidad(empleado.localidad);
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
  const segs = buildSegmentsStandard(constancia.tipo, nombreCompleto, cedula, cargo, departamento, fechaIngreso, salario);
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

  // QR: texto plano con datos del empleado
  const qrSize = 25;
  const qrX = PAGE.w - M.right - qrSize;
  const qrY = PAGE.h - 20 - qrSize;
  const qrText = `C.I. ${cedula}\n${nombreCompleto}\nSueldo: ${salario}\n${empresa}`;
  if (typeof qrcode !== 'undefined') {
    try {
      const qr = qrcode(0, 'M');
      qr.addData(qrText);
      qr.make();
      const qrDataUrl = qr.createDataURL(4, 0);
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    } catch (e) { /* skip QR */ }
  }

  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  const empresaLabel = EMPRESA_LABELS[empresa] || empresa.toUpperCase();
  doc.text(
    `${empresaLabel} — Confidencial. Este documento contiene información privilegiada.`,
    PAGE.w / 2, PAGE.h - 10, { align: 'center' }
  );
}

function renderVacacionesConstancia(doc, constancia, empleado, opciones) {
  const empresa = getEmpresaByLocalidad(empleado.localidad);
  const nombreCompleto = `${empleado.nombre} ${empleado.apellido}`;
  const cedula = empleado.cedula || '_______________';

  const fechaInicio = constancia.fecha_inicio || opciones.fecha_inicio;
  const fechaFin = constancia.fecha_fin || opciones.fecha_fin;
  const diasSolicitados = constancia.dias_solicitados || opciones.dias_solicitados || 0;
  const condicion = constancia.condicion || opciones.condicion || 'pago';
  const periodosPendientes = opciones.periodosPendientes || [];
  const totalPendientes = opciones.totalPendientes || 0;

  doc.setFont('CenturyGothic', 'normal');
  doc.setTextColor(30, 30, 30);

  let y = M.top;

  doc.setFontSize(14);
  doc.setFont('CenturyGothic', 'bold');
  const titleLines = doc.splitTextToSize('CONSTANCIA DE APROBACIÓN DE VACACIONES', CONTENT_W);
  for (const line of titleLines) {
    doc.text(line, PAGE.w / 2, y, { align: 'center' });
    y += LINE_H;
  }
  y += 4;

  doc.setFontSize(9);
  doc.setFont('CenturyGothic', 'normal');
  doc.text(`C.I. ${cedula}`, M.left, y);
  y += LINE_H + 4;

  doc.setFontSize(11);
  doc.setFont('CenturyGothic', 'bold');
  doc.text(`Estimado(a) ${nombreCompleto.toUpperCase()},`, M.left, y);
  y += LINE_H + 4;

  const texto1 = `Por medio de la presente te confirmamos que tu solicitud de vacaciones ha sido aprobada.`;
  const texto2 = `La empresa, en cumplimiento de la normativa laboral vigente y de conformidad con los lineamientos internos, aprueba la solicitud de vacaciones para el periodo comprendido entre el ${formatDateShort(fechaInicio)} y el ${formatDateShort(fechaFin)} reincorporándose a sus funciones el día ${fechaReincorporacion(fechaFin)}. Siendo un total de ${diasSolicitados} días a disfrutar.`;

  y = renderSimpleText(doc, texto1, M.left, y, CONTENT_W, LINE_H);
  y += 2;
  y = renderSimpleText(doc, texto2, M.left, y, CONTENT_W, LINE_H);
  y += 4;

  doc.setFont('CenturyGothic', 'bold');
  doc.setFontSize(11);
  doc.text(`Condición: ${condicion.toUpperCase()}`, M.left, y);
  y += LINE_H + 4;

  doc.setFont('CenturyGothic', 'normal');
  const texto3 = 'Se hace de su conocimiento que, una vez aplicado el presente disfrute, quedarán pendientes en los siguientes periodos.';
  y = renderSimpleText(doc, texto3, M.left, y, CONTENT_W, LINE_H);
  y += 4;

  if (periodosPendientes.length > 0) {
    for (const p of periodosPendientes) {
      if (p.dias > 0) {
        doc.setFont('CenturyGothic', 'bold');
        doc.text(`${p.periodo}:`, M.left + 4, y);
        doc.setFont('CenturyGothic', 'normal');
        doc.text(`${p.dias} días`, M.left + 60, y);
        y += LINE_H;
      }
    }
    y += 2;
  }

  doc.setFont('CenturyGothic', 'bold');
  doc.text(`Quedando un total de ${totalPendientes} días pendientes de vacaciones por disfrutar.`, M.left, y);
  y += LINE_H + 4;

  doc.setFont('CenturyGothic', 'normal');
  const cierre = `Se expide la presente constancia a solicitud de la parte interesada, en la ciudad de Caracas, el ${fechaEnLetras(new Date())}, para los fines administrativos.`;
  y = renderSimpleText(doc, cierre, M.left, y, CONTENT_W, LINE_H);
  y += 10;

  const empresaLabel = EMPRESA_LABELS[empresa] || empresa.toUpperCase();
  doc.setFont('CenturyGothic', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(160, 160, 160);
  doc.text('Atentamente,', M.left, y);
  y += LINE_H + 2;
  doc.text('Gerencia de Gestión Humana.', M.left, y);
  y += LINE_H + 8;

  doc.setFontSize(7);
  doc.text(
    `${empresaLabel} — Confidencial. Este documento contiene información privilegiada.`,
    PAGE.w / 2, PAGE.h - 10, { align: 'center' }
  );
}
