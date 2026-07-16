require('dotenv').config();
const XLSX = require('xlsx');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const EXCEL_PATH = path.join(__dirname, '..', '..', 'Solicitud Digital de Disfrute de Vacaciones - PROSEIN _ AUSTRAL.xlsx');

function excelDateToISO(serial) {
  if (!serial || typeof serial !== 'number') return null;
  const d = new Date((serial - 25569) * 86400000);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return { nombre: parts[0] || '', apellido: parts.slice(1).join(' ') || '' };
  const apellido = parts.slice(-2).join(' ');
  const nombre = parts.slice(0, -2).join(' ');
  return { nombre, apellido };
}

const EMPRESA_MAP = {
  'PROSEIN C.A.': 1,
  'AUSTRAL IMPORT DE VENEZUELA C.A.': 2,
  'Prosein C.A.': 1,
  'Austral Import de Venezuela C.A.': 2,
};

const PERIODOS = ['22-23', '23-24', '24-25', '25-26'];

function parseHistorial(row, empresaId) {
  const historial = [];
  for (const p of PERIODOS) {
    const corrKey = Object.keys(row).find(k => k.startsWith('CORRESPONDIENTE ' + p));
    const disfKey = Object.keys(row).find(k => k.startsWith('DISFRUTADOS ' + p));
    const pendKey = Object.keys(row).find(k => k.startsWith('PENDIENTES ' + p));

    const correspondiente = Number(row[corrKey]) || 0;
    if (correspondiente === 0) continue;

    const disfrutados = Number(row[disfKey]) || 0;
    const pendientes = Number(row[pendKey]) || (correspondiente - disfrutados);

    historial.push({ periodo: p, correspondiente, disfrutados, pendientes, empresa_id: empresaId });
  }
  return historial;
}

async function main() {
  // ─── Load Excel ───
  console.log('Leyendo Excel:', EXCEL_PATH);
  const wb = XLSX.readFile(EXCEL_PATH);
  const cierre = XLSX.utils.sheet_to_json(wb.Sheets['CIERRE DE VACACIONES'], { defval: '' });
  console.log('Filas en cierre:', cierre.length);

  // ─── Load DB empleados ───
  const { data: empleados } = await supabase.from('empleados').select('id, cedula, empresa_id, nombre, apellido');
  const dbCedulas = new Map();
  empleados.forEach(e => dbCedulas.set(e.cedula.trim().toUpperCase(), e));
  console.log('Empleados en DB:', empleados.length);

  // ═══════════════════════════════════════════════════
  // PASO 1: Fix 5 DUPLICADOS (cedula typo en Excel)
  // ═══════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════');
  console.log('PASO 1: CORRIGIENDO DUPLICADOS');
  console.log('══════════════════════════════════════');

  const DUPLICADOS = [
    { excelCedula: 'V235774336', dbCedula: 'V23577433', nombre: 'STEFANI RODRIGUEZ DE OROPEZA' },
    { excelCedula: 'V14689109', dbCedula: 'V14689108', nombre: 'ORLANDO JOSE BERRIO TERAN' },
    { excelCedula: 'E810535060', dbCedula: 'E81053506', nombre: 'DANILO KOENIG WARTSKI' },
    { excelCedula: 'V21412383', dbCedula: 'V02141238', nombre: 'LESTER GARCES TOVAR' },
    { excelCedula: 'V16421705', dbCedula: 'V01642170', nombre: 'CARMEN JIMENEZ' },
  ];

  let dupFixed = 0;
  for (const dup of DUPLICADOS) {
    const excelRow = cierre.find(r => String(r['CEDULA'] || '').trim().toUpperCase() === dup.excelCedula);
    const dbEmp = dbCedulas.get(dup.dbCedula);

    if (!excelRow) { console.log(`  SKIP ${dup.nombre}: no encontrada cedula ${dup.excelCedula} en Excel`); continue; }
    if (!dbEmp) { console.log(`  SKIP ${dup.nombre}: no encontrada cedula ${dup.dbCedula} en DB`); continue; }

    const empresaId = dbEmp.empresa_id || EMPRESA_MAP[excelRow['EMPRESA']] || 1;
    const historial = parseHistorial(excelRow, empresaId);

    // Insert historial
    for (const h of historial) {
      const { error } = await supabase.from('vacaciones_historial').upsert({
        empleado_id: dbEmp.id, empresa_id: h.empresa_id, periodo: h.periodo,
        correspondiente: h.correspondiente, disfrutados: h.disfrutados, pendientes: h.pendientes
      }, { onConflict: 'empleado_id,periodo' });
      if (error && !error.message.includes('duplicate')) console.log(`  WARN historial ${dup.nombre} ${h.periodo}:`, error.message);
    }

    // Update saldo
    const saldo = Number(excelRow['TOTAL PENDIENTES AL 2026']) || 0;
    const corr2526 = Number(excelRow['CORRESPONDIENTE 25-26']) || 0;
    const disf2526 = Number(excelRow['DISFRUTADOS 25-26']) || 0;
    const { error: updErr } = await supabase.from('empleados').update({
      vacaciones_saldo: saldo, vacaciones_correspondientes: corr2526, vacaciones_disfrutadas: disf2526
    }).eq('id', dbEmp.id);
    if (updErr) console.log(`  ERR update saldo ${dup.nombre}:`, updErr.message);
    else { console.log(`  OK ${dup.nombre}: saldo=${saldo}, historial=${historial.length} periodos`); dupFixed++; }
  }
  console.log(`Duplicados corregidos: ${dupFixed}/5`);

  // ═══════════════════════════════════════════════════
  // PASO 2: INSERTAR 13 EMPLEADOS NUEVOS
  // ═══════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════');
  console.log('PASO 2: INSERTANDO EMPLEADOS NUEVOS');
  console.log('══════════════════════════════════════');

  const NUEVOS = [
    // Activos
    { cedula: 'V08762107', nombre: 'ANA DOLORES', apellido: 'CEUTA', empresa: 'Prosein C.A.', ingreso: '2000-09-15', estatus: 'activo' },
    { cedula: 'V12735862', nombre: 'YAJAIRA DEL CARMEN', apellido: 'ARIAS ATACHO', empresa: 'Prosein C.A.', ingreso: '1997-04-30', estatus: 'activo' },
    // Inactivos
    { cedula: 'V05611257', nombre: 'SERGIO', apellido: 'GONZALEZ BOLIVAR', empresa: 'Prosein C.A.', ingreso: '2000-04-30', estatus: 'inactivo' },
    { cedula: 'V11303212', nombre: 'JESUS GREGORIO', apellido: 'FLORES SANDREA', empresa: 'Austral Import de Venezuela C.A.', ingreso: '2005-05-31', estatus: 'inactivo' },
    { cedula: 'V14166886', nombre: 'JEAN CARLOS', apellido: 'BONILLA', empresa: 'Austral Import de Venezuela C.A.', ingreso: '2007-11-25', estatus: 'inactivo' },
    { cedula: 'V15665826', nombre: 'ULISES JOSE', apellido: 'VARGAS FERNANDEZ', empresa: 'Austral Import de Venezuela C.A.', ingreso: '2010-01-24', estatus: 'inactivo' },
    { cedula: 'V14202724', nombre: 'RAMON ANTONIO', apellido: 'MARTINEZ ZUNIGA', empresa: 'Prosein C.A.', ingreso: '2019-09-15', estatus: 'inactivo' },
    { cedula: 'V27606792', nombre: 'GILBERT ANTONY', apellido: 'GUZMAN RODRIGUEZ', empresa: 'Austral Import de Venezuela C.A.', ingreso: '2024-12-01', estatus: 'inactivo' },
    { cedula: 'V31792957', nombre: 'JHEREMY JESUS', apellido: 'LEYVA MATUTE', empresa: 'Austral Import de Venezuela C.A.', ingreso: '2025-09-22', estatus: 'inactivo' },
    { cedula: 'V18710143', nombre: 'ANDREINA CAROLINA', apellido: 'GODOY CASTILLO', empresa: 'Prosein C.A.', ingreso: '2025-08-31', estatus: 'inactivo' },
    { cedula: 'V21131475', nombre: 'ANGIEBELL NAZARETH', apellido: 'MARTINEZ IBARRA', empresa: 'Austral Import de Venezuela C.A.', ingreso: '2025-08-31', estatus: 'inactivo' },
    { cedula: 'V12962254', nombre: 'ELEN TATIANA', apellido: 'FERNANDEZ SIERRA', empresa: 'Austral Import de Venezuela C.A.', ingreso: '2025-03-31', estatus: 'inactivo' },
    { cedula: 'V31065908', nombre: 'MARIA TERESA', apellido: 'VELIZ MILANI', empresa: 'Austral Import de Venezuela C.A.', ingreso: '2025-06-08', estatus: 'inactivo' },
  ];

  let newInserted = 0;
  for (const emp of NUEVOS) {
    // Skip if already in DB
    if (dbCedulas.has(emp.cedula.toUpperCase())) {
      console.log(`  SKIP ${emp.nombre} ${emp.apellido}: ya existe en DB`);
      continue;
    }

    const empresaId = EMPRESA_MAP[emp.empresa] || 1;

    // Get saldo from Excel
    const excelRow = cierre.find(r => String(r['CEDULA'] || '').trim().toUpperCase() === emp.cedula.toUpperCase());
    const saldo = excelRow ? (Number(excelRow['TOTAL PENDIENTES AL 2026']) || 0) : 0;
    const corr2526 = excelRow ? (Number(excelRow['CORRESPONDIENTE 25-26']) || 0) : 0;
    const disf2526 = excelRow ? (Number(excelRow['DISFRUTADOS 25-26']) || 0) : 0;

    // Insert empleado
    const { data: newEmp, error: empErr } = await supabase.from('empleados').insert({
      nombre: emp.nombre,
      apellido: emp.apellido,
      cedula: emp.cedula,
      empresa_id: empresaId,
      fecha_ingreso: emp.ingreso,
      estatus: emp.estatus,
      vacaciones_saldo: saldo,
      vacaciones_correspondientes: corr2526,
      vacaciones_disfrutadas: disf2526,
    }).select().single();

    if (empErr) {
      console.log(`  ERR ${emp.nombre} ${emp.apellido}:`, empErr.message);
      continue;
    }

    console.log(`  OK ${emp.nombre} ${emp.apellido} | C.I. ${emp.cedula} | ${emp.estatus} | saldo: ${saldo}`);

    // Insert historial if we have Excel data
    if (excelRow) {
      const historial = parseHistorial(excelRow, empresaId);
      for (const h of historial) {
        await supabase.from('vacaciones_historial').upsert({
          empleado_id: newEmp.id, empresa_id: empresaId, periodo: h.periodo,
          correspondiente: h.correspondiente, disfrutados: h.disfrutados, pendientes: h.pendientes
        }, { onConflict: 'empleado_id,periodo' });
      }
    }

    newInserted++;
  }
  console.log(`Empleados insertados: ${newInserted}/13`);

  // ═══════════════════════════════════════════════════
  // PASO 3: VERIFICACION
  // ═══════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════');
  console.log('PASO 3: VERIFICACION');
  console.log('══════════════════════════════════════');

  const { data: allEmp } = await supabase.from('empleados').select('id, cedula, nombre, apellido, estatus, vacaciones_saldo, empresa_id');
  const { data: allHist } = await supabase.from('vacaciones_historial').select('empleado_id');

  const activos = allEmp.filter(e => e.estatus === 'activo');
  const inactivos = allEmp.filter(e => e.estatus === 'inactivo');
  const conSaldo = allEmp.filter(e => (e.vacaciones_saldo || 0) > 0);

  console.log(`Total empleados: ${allEmp.length}`);
  console.log(`Activos: ${activos.length} | Inactivos: ${inactivos.length}`);
  console.log(`Con saldo > 0: ${conSaldo.length}`);
  console.log(`Registros historial: ${allHist.length}`);

  console.log('\nEmpleados inactivos con saldo:');
  inactivos.filter(e => (e.vacaciones_saldo || 0) > 0).forEach(e =>
    console.log(`  ${e.cedula} | ${e.nombre} ${e.apellido} | saldo: ${e.vacaciones_saldo}`)
  );
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
