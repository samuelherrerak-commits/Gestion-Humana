-- Migración: Expandir tabla constancias para tipo vacaciones
-- Ejecutar en Supabase Dashboard → SQL Editor

-- 1. Agregar tipo 'vacaciones' al CHECK constraint
ALTER TABLE constancias DROP CONSTRAINT IF EXISTS constancias_tipo_check;
ALTER TABLE constancias ADD CONSTRAINT constancias_tipo_check
  CHECK (tipo IN ('trabajo','sueldo','recomendacion','vacaciones'));

-- 2. Nuevas columnas para constancias de vacaciones
ALTER TABLE constancias ADD COLUMN IF NOT EXISTS fecha_inicio DATE;
ALTER TABLE constancias ADD COLUMN IF NOT EXISTS fecha_fin DATE;
ALTER TABLE constancias ADD COLUMN IF NOT EXISTS dias_solicitados INTEGER;
ALTER TABLE constancias ADD COLUMN IF NOT EXISTS condicion TEXT;
