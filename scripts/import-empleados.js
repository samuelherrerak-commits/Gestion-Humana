require('dotenv').config();
const XLSX = require('xlsx');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const EXCEL_PATH = path.join(__dirname, '..', '..', 'EMPLEADOS.xlsx');
const BATCH_SIZE = 50;

function excelDateToISO(serial) {
  if (!serial || typeof serial !== 'number') return null;
  const d = new Date((serial - 25569) * 86400000);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function splitName(fullName) {
  const clean = fullName.replace(/\s+/g, ' ').trim();
  const parts = clean.split(' ');
  if (parts.length <= 2) return { nombre: parts[0] || '', apellido: parts[1] || '' };
  return {
    nombre: parts.slice(0, -2).join(' '),
    apellido: parts.slice(-2).join(' ')
  };
}

function normalizeEstatus(raw) {
  if (!raw) return 'activo';
  const lower = String(raw).trim().toLowerCase();
  return lower === 'active' || lower === 'activo' ? 'activo' : 'inactivo';
}

function normalizeCedula(raw) {
  if (!raw) return null;
  const clean = String(raw).trim();
  return clean || null;
}

async function main() {
  console.log('Leyendo Excel:', EXCEL_PATH);
  const wb = XLSX.readFile(EXCEL_PATH);
  const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });

  const empleados = data.filter(r => r['Organización'] !== 'Conteo' && r['Nombre Socio del Negocio'] !== 152);
  console.log('Empleados en Excel:', empleados.length);

  // Fetch empresas to build name->id map
  const { data: empresas, error: empErr } = await supabase.from('empresas').select('id, nombre');
  if (empErr) { console.error('Error fetching empresas:', empErr.message); process.exit(1); }

  const empresaMap = {};
  empresas.forEach(e => { empresaMap[e.nombre] = e.id; });
  console.log('Empresas en DB:', empresaMap);

  // Map organization names to empresa_id
  const orgToEmpresa = {};
  for (const emp of empleados) {
    const org = emp['Organización'];
    if (orgToEmpresa[org]) continue;
    for (const [nombre, id] of Object.entries(empresaMap)) {
      if (org.includes(nombre) || nombre.includes(org)) {
        orgToEmpresa[org] = id;
        break;
      }
    }
    if (!orgToEmpresa[org]) {
      console.warn('Sin mapeo para organización:', org);
      orgToEmpresa[org] = null;
    }
  }
  console.log('Mapeo organizaciones:', orgToEmpresa);

  // Check existing cedulas to skip duplicates
  const { data: existing } = await supabase.from('empleados').select('cedula');
  const existingCedulas = new Set((existing || []).map(e => e.cedula));
  console.log('Cédulas ya en DB:', existingCedulas.size);

  // Transform
  const rows = [];
  let skipped = 0;
  for (const emp of empleados) {
    const cedula = normalizeCedula(emp[' Cédula ']);
    if (!cedula) { skipped++; continue; }
    if (existingCedulas.has(cedula)) { skipped++; continue; }

    const { nombre, apellido } = splitName(emp['Nombre Socio del Negocio']);
    rows.push({
      nombre,
      apellido,
      cedula,
      fecha_nacimiento: excelDateToISO(emp['Cumpleaños']),
      fecha_ingreso: excelDateToISO(emp['Fecha Inicio']),
      cargo: String(emp['Puesto Nómina'] || '').trim() || null,
      departamento: String(emp['Departamento'] || '').trim() || null,
      salario: Number(emp['Salario M.']) || 0,
      estatus: normalizeEstatus(emp['Estado']),
      empresa_id: orgToEmpresa[emp['Organización']] || null,
      genero: String(emp['Genero'] || '').trim() || null,
      estado_civil: String(emp['E. Civil'] || '').trim() || null,
      localidad: String(emp['Organización'] || '').trim() || null
    });
  }

  console.log('A insertar:', rows.length, '| Saltados:', skipped);

  // Insert in batches
  let inserted = 0;
  let errors = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { data: result, error } = await supabase.from('empleados').insert(batch).select();
    if (error) {
      console.error(`Error en batch ${i / BATCH_SIZE + 1}:`, error.message);
      errors += batch.length;
    } else {
      inserted += result.length;
      console.log(`Batch ${i / BATCH_SIZE + 1}: ${result.length} insertados`);
    }
  }

  console.log('\n=== RESULTADO ===');
  console.log('Insertados:', inserted);
  console.log('Errores:', errors);
  console.log('Saltados (duplicados/sin cédula):', skipped);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
