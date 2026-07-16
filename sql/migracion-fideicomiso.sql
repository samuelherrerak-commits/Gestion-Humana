-- =============================================
-- MIGRACIÓN: Fideicomiso de Prestaciones Sociales
-- Ejecutar en Supabase Dashboard → SQL Editor
-- =============================================

-- 1. Tabla de aportes trimestrales
CREATE TABLE IF NOT EXISTS fideicomiso_aportes (
  id BIGSERIAL PRIMARY KEY,
  empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
  trimestre TEXT NOT NULL CHECK (trimestre IN ('Q1','Q2','Q3','Q4')),
  anio INTEGER NOT NULL,
  monto NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empleado_id, trimestre, anio)
);

-- 2. Tabla de solicitudes de retiro
CREATE TABLE IF NOT EXISTS fideicomiso_solicitudes (
  id BIGSERIAL PRIMARY KEY,
  empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
  monto_solicitado NUMERIC(12,2) NOT NULL,
  motivo TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobada','rechazada')),
  notas_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_fideicomiso_aportes_empleado ON fideicomiso_aportes(empleado_id);
CREATE INDEX IF NOT EXISTS idx_fideicomiso_solicitudes_empleado ON fideicomiso_solicitudes(empleado_id);
CREATE INDEX IF NOT EXISTS idx_fideicomiso_solicitudes_estado ON fideicomiso_solicitudes(estado);

-- 4. RLS (Row Level Security)
ALTER TABLE fideicomiso_aportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fideicomiso_solicitudes ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de acceso (usando service_role desde el backend)
CREATE POLICY "fideicomiso_aportes_all" ON fideicomiso_aportes FOR ALL USING (true);
CREATE POLICY "fideicomiso_solicitudes_all" ON fideicomiso_solicitudes FOR ALL USING (true);
