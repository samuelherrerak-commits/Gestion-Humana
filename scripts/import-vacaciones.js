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

async function main() {
  console.log('Leyendo Excel:', EXCEL_PATH);
  const wb = XLSX.readFile(EXCEL_PATH);

  // ─── 1. Fetch empleados from DB to build cedula->id map ───
  const { data: empleados, error: empErr } = await supabase.from('empleados').select('id, cedula, empresa_id');
  if (empErr) { console.error('Error fetching empleados:', empErr.message); process.exit(1); }
  console.log('Empleados en DB:', empleados.length);

  const cedulaMap = {};
  const cedulaEmpresaMap = {};
  empleados.forEach(e => {
    const key = e.cedula.trim().toUpperCase();
    cedulaMap[key] = e.id;
    cedulaEmpresaMap[key] = e.empresa_id;
  });

  // ─── 2. HISTORIAL (CIERRE DE VACACIONES) ───
  console.log('\n=== IMPORTANDO HISTORIAL ===');
  const wsCierre = wb.Sheets['CIERRE DE VACACIONES'];
  const cierre = XLSX.utils.sheet_to_json(wsCierre, { defval: '' });
  console.log('Filas en cierre:', cierre.length);

  const periodos = ['22-23', '23-24', '24-25', '25-26'];
  const histRows = [];
  let histMatched = 0, histNoMatch = 0;

  for (const row of cierre) {
    const cedula = String(row['CEDULA'] || '').trim().toUpperCase();
    const empleadoId = cedulaMap[cedula];
    if (!empleadoId) { histNoMatch++; continue; }
    histMatched++;

    for (const p of periodos) {
      const correspondiente = Number(row['CORRESPONDIENTE ' + p]) || 0;
      if (correspondiente === 0) continue; // skip periods with no data

      const disfrutados = Number(row['DISFRUTADOS ' + p]) || 0;
      // Handle trailing space in "PENDIENTES 23-24 "
      const pendientesKey = Object.keys(row).find(k => k.startsWith('PENDIENTES ' + p) && k.includes(p));
      const pendientes = Number(row[pendientesKey]) || (correspondiente - disfrutados);

      histRows.push({
        empleado_id: empleadoId,
        empresa_id: cedulaEmpresaMap[cedula] || null,
        periodo: p,
        correspondiente,
        disfrutados,
        pendientes
      });
    }
  }

  console.log('Empleados matched:', histMatched, '| Sin match:', histNoMatch);
  console.log('Registros historial a insertar:', histRows.length);

  // Insert in batches
  let histInserted = 0;
  for (let i = 0; i < histRows.length; i += 50) {
    const batch = histRows.slice(i, i + 50);
    const { data, error } = await supabase.from('vacaciones_historial').upsert(batch, { onConflict: 'empleado_id,periodo' }).select();
    if (error) {
      console.error('Error batch historial:', error.message);
    } else {
      histInserted += data.length;
    }
  }
  console.log('Historial insertado:', histInserted);

  // ─── 3. SOLICITUDES 25-26 (Sheet1 (2)) ───
  console.log('\n=== IMPORTANDO SOLICITUDES 25-26 ===');
  const wsSolicitudes = wb.Sheets['Sheet1 (2)'];
  const solicitudes = XLSX.utils.sheet_to_json(wsSolicitudes, { defval: '' });
  console.log('Solicitudes en Excel:', solicitudes.length);

  const vacRows = [];
  let vacMatched = 0, vacNoMatch = 0;

  for (const row of solicitudes) {
    const cedula = String(row['CÉDULA (V12345678)'] || '').trim().toUpperCase();
    const empleadoId = cedulaMap[cedula];
    if (!empleadoId) { vacNoMatch++; continue; }
    vacMatched++;

    const fechaInicio = excelDateToISO(row['FECHA DE INICIO']);
    const fechaFin = excelDateToISO(row['FECHA DE CULMINACION']);
    if (!fechaInicio || !fechaFin) continue;

    vacRows.push({
      empleado_id: empleadoId,
      empresa_id: cedulaEmpresaMap[cedula] || null,
      fecha_solicitud: excelDateToISO(row['Fecha']) || fechaInicio,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      dias_solicitados: Number(row['dias a disfrutar']) || 0,
      dias_disponibles: Number(row['TOTAL PENDIENTES GLOBAL']) || 0,
      estatus: 'aprobado'
    });
  }

  console.log('Solicitudes matched:', vacMatched, '| Sin match:', vacNoMatch);
  console.log('Registros vacaciones a insertar:', vacRows.length);

  let vacInserted = 0;
  for (let i = 0; i < vacRows.length; i += 50) {
    const batch = vacRows.slice(i, i + 50);
    const { data, error } = await supabase.from('vacaciones').insert(batch).select();
    if (error) {
      console.error('Error batch vacaciones:', error.message);
    } else {
      vacInserted += data.length;
    }
  }
  console.log('Vacaciones insertadas:', vacInserted);

  // ─── 4. ACTUALIZAR SALDOS EN EMPLEADOS ───
  console.log('\n=== ACTUALIZANDO SALDOS EN EMPLEADOS ===');
  let saldosUpdated = 0;

  for (const row of cierre) {
    const cedula = String(row['CEDULA'] || '').trim().toUpperCase();
    const empleadoId = cedulaMap[cedula];
    if (!empleadoId) continue;

    const saldo = Number(row['TOTAL PENDIENTES AL 2026']) || 0;
    const corr2526 = Number(row['CORRESPONDIENTE 25-26']) || 0;
    const disfr2526 = Number(row['DISFRUTADOS 25-26']) || 0;

    const { error } = await supabase.from('empleados').update({
      vacaciones_saldo: saldo,
      vacaciones_correspondientes: corr2526,
      vacaciones_disfrutadas: disfr2526
    }).eq('id', empleadoId);

    if (!error) saldosUpdated++;
  }
  console.log('Saldos actualizados:', saldosUpdated);

  console.log('\n=== RESUMEN FINAL ===');
  console.log('Historial:', histInserted, 'registros');
  console.log('Vacaciones:', vacInserted, 'solicitudes');
  console.log('Saldos:', saldosUpdated, 'empleados actualizados');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
