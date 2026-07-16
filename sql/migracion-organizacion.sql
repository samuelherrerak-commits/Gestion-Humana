-- Módulo de Organización: Agregar jerarquía a empleados
-- Ejecutar en: Supabase Dashboard > SQL Editor

-- 1. Agregar jefe_id (referencia a otro empleado)
DO $$ BEGIN
  ALTER TABLE empleados ADD COLUMN IF NOT EXISTS jefe_id integer REFERENCES empleados(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 2. Agregar nivel_jerarquico
DO $$ BEGIN
  ALTER TABLE empleados ADD COLUMN IF NOT EXISTS nivel_jerarquico text DEFAULT 'empleado';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 3. Verificar
SELECT id, nombre, apellido, departamento, cargo, jefe_id, nivel_jerarquico
FROM empleados WHERE estatus = 'activo' ORDER BY apellido;
