-- ════════════════════════════════════════════════════════════
-- MIGRACIÓN: Ficha del Trabajador + Expedientes
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ════════════════════════════════════════════════════════════

-- 1. Nuevas columnas en empleados
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS telefono_alt TEXT;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS correo_personal TEXT;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS estado_ciudad TEXT;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS nivel_estudios TEXT;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS titulo_obtenido TEXT;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS universidad TEXT;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS anio_graduacion INTEGER;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS hijos JSONB DEFAULT '[]'::jsonb;

-- 2. Fix constraint de documentos (agregar todos los tipos necesarios)
ALTER TABLE documentos DROP CONSTRAINT IF EXISTS documentos_tipo_check;
ALTER TABLE documentos ADD CONSTRAINT documentos_tipo_check
  CHECK (tipo IN (
    'cv', 'cedula', 'rif', 'titulos',
    'solicitud_empleo', 'contrato',
    'hoja_ruta', 'carta_riesgos',
    'acuerdo_confidencialidad', 'constancia_ivss',
    'otros'
  ));
