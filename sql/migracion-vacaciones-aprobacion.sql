-- Migración: Cadena de aprobación de vacaciones
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query

-- 1. Agregar columnas nuevas (ignorar si ya existen)
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

-- 2. Actualizar CHECK constraint para permitir nuevos estatus
ALTER TABLE vacaciones DROP CONSTRAINT IF EXISTS vacaciones_estatus_check;
ALTER TABLE vacaciones ADD CONSTRAINT vacaciones_estatus_check
  CHECK (estatus IN (
    'pendiente',
    'aprobado',
    'rechazado',
    'pendiente_jefe',
    'aprobado_jefe',
    'aprobado_rrhh'
  ));

-- 3. Migrar solicitudes existentes al nuevo flujo
UPDATE vacaciones SET estatus = 'pendiente_jefe' WHERE estatus = 'pendiente';

-- 4. Marcar aprobaciones existentes como aprobadas por RRHH
UPDATE vacaciones SET
  aprobado_por_rrhh = aprobado_por,
  fecha_aprobacion_rrhh = created_at
WHERE estatus = 'aprobado' AND aprobado_por IS NOT NULL;

-- 5. Verificar resultado
SELECT id, empleado_id, estatus, dias_solicitados, dias_correspondientes, periodo
FROM vacaciones ORDER BY id LIMIT 10;
