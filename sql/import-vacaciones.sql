-- ============================================================
-- VACACIONES: Tabla de historial + columnas de saldo en empleados
-- Ejecutar en Supabase Dashboard > SQL Editor ANTES del script Node.js
-- ============================================================

-- 1. Agregar columnas de saldo a la tabla empleados
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS vacaciones_saldo INT DEFAULT 0;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS vacaciones_correspondientes INT DEFAULT 0;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS vacaciones_disfrutadas INT DEFAULT 0;

-- 2. Tabla de historial por período
CREATE TABLE IF NOT EXISTS vacaciones_historial (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empleado_id     BIGINT NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  empresa_id      BIGINT REFERENCES empresas(id),
  periodo         TEXT NOT NULL,
  correspondiente INT DEFAULT 0,
  disfrutados     INT DEFAULT 0,
  pendientes      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empleado_id, periodo)
);

-- 3. RLS
ALTER TABLE vacaciones_historial ENABLE ROW LEVEL SECURITY;
CREATE POLICY "todo_vacaciones_historial" ON vacaciones_historial FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON vacaciones_historial TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_vac_hist_empleado ON vacaciones_historial(empleado_id);
CREATE INDEX IF NOT EXISTS idx_vac_hist_periodo  ON vacaciones_historial(periodo);
