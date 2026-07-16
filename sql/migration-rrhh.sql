-- ============================================================
-- MIGRACIÓN: Módulos RRHH para Sistema RRHH Gestión Integral
-- Ejecutar en el mismo proyecto Supabase de auditoria-rrhh
-- Las tablas empresas, usuarios, modulos, requisitos, auditorias,
-- respuestas, evidencias, plan_accion ya existen.
-- ============================================================

-- 1. EMPLEADOS
CREATE TABLE IF NOT EXISTS empleados (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empresa_id        BIGINT REFERENCES empresas(id),
  nombre            TEXT NOT NULL,
  apellido          TEXT NOT NULL,
  cedula            TEXT UNIQUE NOT NULL,
  fecha_nacimiento  DATE,
  fecha_ingreso     DATE,
  cargo             TEXT,
  departamento      TEXT,
  salario           NUMERIC(12,2),
  estatus           TEXT DEFAULT 'activo' CHECK (estatus IN ('activo','inactivo')),
  foto_url          TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 2. DOCUMENTOS (Expedientes Digitales)
CREATE TABLE IF NOT EXISTS documentos (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empleado_id       BIGINT NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  empresa_id        BIGINT REFERENCES empresas(id),
  tipo              TEXT NOT NULL CHECK (tipo IN ('contrato','cedula','titulo','certificado','recibo','otro')),
  nombre_archivo    TEXT NOT NULL,
  url               TEXT NOT NULL,
  fecha_subida      DATE DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 3. VACACIONES
CREATE TABLE IF NOT EXISTS vacaciones (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empleado_id       BIGINT NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  empresa_id        BIGINT REFERENCES empresas(id),
  fecha_solicitud   DATE DEFAULT CURRENT_DATE,
  fecha_inicio      DATE NOT NULL,
  fecha_fin         DATE NOT NULL,
  dias_solicitados  INT NOT NULL,
  dias_disponibles  INT DEFAULT 0,
  estatus           TEXT DEFAULT 'pendiente' CHECK (estatus IN ('pendiente','aprobado','rechazado')),
  aprobado_por      BIGINT REFERENCES usuarios(id),
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 4. CONSTANCIAS
CREATE TABLE IF NOT EXISTS constancias (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empleado_id       BIGINT NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  empresa_id        BIGINT REFERENCES empresas(id),
  tipo              TEXT NOT NULL CHECK (tipo IN ('trabajo','sueldo','recomendacion')),
  contenido         TEXT,
  fecha_emision     DATE DEFAULT CURRENT_DATE,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 5. INFORMES (para la auditoría, si no existe aún)
CREATE TABLE IF NOT EXISTS informes (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  auditoria_id    BIGINT NOT NULL REFERENCES auditorias(id) ON DELETE CASCADE,
  contenido       TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS (permisiva — auth propia con JWT)
-- ============================================================
ALTER TABLE empleados   ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacaciones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE constancias ENABLE ROW LEVEL SECURITY;
ALTER TABLE informes    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todo_empleados"   ON empleados   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_documentos"  ON documentos  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_vacaciones"  ON vacaciones  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_constancias" ON constancias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_informes"    ON informes    FOR ALL USING (true) WITH CHECK (true);

-- Grants (necesario para rol anon)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Índices
CREATE INDEX IF NOT EXISTS idx_empleados_empresa   ON empleados(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empleados_cedula    ON empleados(cedula);
CREATE INDEX IF NOT EXISTS idx_documentos_empleado ON documentos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_vacaciones_empleado ON vacaciones(empleado_id);
CREATE INDEX IF NOT EXISTS idx_constancias_empleado ON constancias(empleado_id);
