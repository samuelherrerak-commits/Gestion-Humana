-- Migración: Unificar login en tabla usuarios
-- Ejecutar en Supabase Dashboard → SQL Editor

-- 1. Agregar columnas a usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cedula TEXT UNIQUE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'empleado';
ALTER TABLE usuarios ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Admin: mantener contraseña, agregar cédula y rol
UPDATE usuarios SET cedula = '00000000', rol = 'admin' WHERE email = 'admin@rrhh.com';

-- 3. Empleados activos → usuarios (sin contraseña)
INSERT INTO usuarios (email, cedula, nombre, rol, empresa_id)
SELECT 
  empleados.cedula || '@prosein.com',
  empleados.cedula,
  TRIM(empleados.nombre || ' ' || empleados.apellido),
  CASE 
    WHEN empleados.nivel_jerarquico IN ('gerente_general', 'encargado_departamento') THEN 'gerente'
    ELSE 'empleado'
  END,
  empleados.empresa_id
FROM empleados
WHERE empleados.estatus = 'activo'
  AND empleados.cedula IS NOT NULL
ON CONFLICT (cedula) DO NOTHING;

-- Verificar resultados
SELECT rol, COUNT(*) as total FROM usuarios GROUP BY rol ORDER BY rol;
