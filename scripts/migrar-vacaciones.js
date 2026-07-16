const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function runMigration() {
  console.log('Ejecutando migración de vacaciones...');

  const sql = `
    DO $$ BEGIN
      ALTER TABLE vacaciones ADD COLUMN IF NOT EXISTS dias_correspondientes integer;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE vacaciones ADD COLUMN IF NOT EXISTS periodo text;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE vacaciones ADD COLUMN IF NOT EXISTS aprobado_por_jefe integer;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE vacaciones ADD COLUMN IF NOT EXISTS aprobado_por_rrhh integer;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE vacaciones ADD COLUMN IF NOT EXISTS fecha_aprobacion_jefe timestamptz;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE vacaciones ADD COLUMN IF NOT EXISTS fecha_aprobacion_rrhh timestamptz;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;

    UPDATE vacaciones SET estatus = 'pendiente_jefe' WHERE estatus = 'pendiente';

    UPDATE vacaciones SET
      aprobado_por_rrhh = aprobado_por,
      fecha_aprobacion_rrhh = updated_at
    WHERE estatus = 'aprobado' AND aprobado_por IS NOT NULL;
  `;

  // Split by semicolons and execute each statement
  const statements = sql.split(';').filter(s => s.trim());

  for (const stmt of statements) {
    if (!stmt.trim()) continue;
    const { error } = await supabase.rpc('exec_sql', { query: stmt.trim() + ';' }).single();
    if (error) {
      // exec_sql may not exist, try alternative approach
      console.log(`Statement: ${stmt.trim().substring(0, 60)}...`);
      console.log(`  -> ${error.message}`);
    } else {
      console.log(`  OK: ${stmt.trim().substring(0, 60)}...`);
    }
  }

  // Verify
  const { data, error } = await supabase.from('vacaciones').select('id, empleado_id, estatus, dias_solicitados, dias_correspondientes, periodo').order('id');
  if (!error) {
    console.log('\nSolicitudes actuales:');
    console.table(data);
  }
}

runMigration().catch(console.error);
