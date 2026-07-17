-- Migración: Columnas de pago para vacaciones
-- Ejecutar en Supabase Dashboard → SQL Editor

-- 1. Nuevas columnas en vacaciones
ALTER TABLE vacaciones ADD COLUMN IF NOT EXISTS condicion TEXT;
ALTER TABLE vacaciones ADD COLUMN IF NOT EXISTS quincena_pago TEXT;
ALTER TABLE vacaciones ADD COLUMN IF NOT EXISTS numero_nomina TEXT;

-- 2. Marcar vacaciones existentes aprobadas como 'pago' (ya fueron pagadas)
UPDATE vacaciones SET condicion = 'pago' WHERE estatus = 'aprobado' AND condicion IS NULL;

-- Verificar
SELECT condicion, COUNT(*) as total FROM vacaciones GROUP BY condicion ORDER BY condicion;
