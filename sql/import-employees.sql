-- ============================================================
-- IMPORTACIÓN: Agregar columnas + empresas para importar empleados
-- Ejecutar en Supabase Dashboard > SQL Editor ANTES del script Node.js
-- ============================================================

-- 1. Agregar columnas que faltan en la tabla empleados
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS genero TEXT;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS estado_civil TEXT;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS localidad TEXT;

-- 2. Crear las 2 empresas
INSERT INTO empresas (nombre) VALUES
  ('PROSEIN'),
  ('AUSTRAL IMPORT DE VENEZUELA C.A')
ON CONFLICT DO NOTHING;

-- Verificar
SELECT id, nombre FROM empresas;
