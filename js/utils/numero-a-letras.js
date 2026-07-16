const UNIDADES = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];
const ESPECIALES = { 100: 'cien', 1000: 'mil', 1000000: 'un millón' };

function unidades(n) { return UNIDADES[n]; }

function decenas(n) {
  if (n < 20) return UNIDADES[n];
  const d = Math.floor(n / 10);
  const u = n % 10;
  const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  return tens[d] + (u ? ' y ' + UNIDADES[u] : '');
}

function centenas(n) {
  if (n === 100) return ESPECIALES[100];
  const c = Math.floor(n / 100);
  const r = n % 100;
  const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  return hundreds[c] + (r ? ' ' + subCentena(r) : '');
}

function subCentena(n) {
  if (n < 20) return UNIDADES[n];
  return decenas(n);
}

function Miles(n) {
  if (n === 0) return '';
  if (n < 1000) return centenas(n);
  const m = Math.floor(n / 1000);
  const r = n % 1000;
  const miles = m === 1 ? 'mil' : centenas(m) + ' mil';
  return miles + (r ? ' ' + centenas(r) : '');
}

function Millones(n) {
  if (n < 1000000) return Miles(n);
  const m = Math.floor(n / 1000000);
  const r = n % 1000000;
  const millones = m === 1 ? 'un millón' : centenas(m) + ' millones';
  return millones + (r ? ' ' + Miles(r) : '');
}

export function numeroALetras(numero) {
  if (numero == null || isNaN(numero)) return '';
  const n = Math.abs(Math.round(numero * 100) / 100);
  const parteEntera = Math.floor(n);
  const parteDecimal = Math.round((n - parteEntera) * 100);

  let texto = '';
  if (parteEntera === 0) {
    texto = 'cero';
  } else {
    texto = Millones(parteEntera);
  }

  texto += ' bolívares';

  if (parteDecimal > 0) {
    const dec = parteDecimal < 10 ? '0' + parteDecimal : '' + parteDecimal;
    texto += ' con ' + dec + '/100 Céntimos';
  } else {
    texto += ' con 00/100 Céntimos';
  }

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
