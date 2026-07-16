-- ============================================================
-- SUPABASE SCHEMA — Sistema RRHH Gestión Integral
-- Incluye tablas de auditoría (originales) + módulos RRHH nuevos
-- ============================================================

-- 1. EMPRESAS (existente)
CREATE TABLE IF NOT EXISTS empresas (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre      TEXT NOT NULL,
  rif         TEXT UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. USUARIOS (existente)
CREATE TABLE IF NOT EXISTS usuarios (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre        TEXT,
  empresa_id    BIGINT REFERENCES empresas(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. MÓDULOS (existente)
CREATE TABLE IF NOT EXISTS modulos (
  id          INT PRIMARY KEY,
  nombre      TEXT NOT NULL,
  orden       INT NOT NULL
);

INSERT INTO modulos (id, nombre, orden) VALUES
  (1, 'Datos de la Empresa',      1),
  (2, 'Salarios y Contratos',     2),
  (3, 'Seguridad Social (IVSS)',  3),
  (4, 'LOPCYMAT',                 4),
  (5, 'INCES',                    5),
  (6, 'Nómina',                   6),
  (7, 'Prestaciones Sociales',    7),
  (8, 'Vacaciones',               8),
  (9, 'Utilidades',               9),
  (10,'Protección Familiar',      10)
ON CONFLICT (id) DO NOTHING;

-- 4. REQUISITOS (existente)
CREATE TABLE IF NOT EXISTS requisitos (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  modulo_id       INT NOT NULL REFERENCES modulos(id),
  codigo          TEXT NOT NULL,
  pregunta        TEXT NOT NULL,
  descripcion     TEXT,
  articulo        TEXT,
  ley             TEXT,
  nivel_riesgo    TEXT NOT NULL CHECK (nivel_riesgo IN ('CRÍTICO','ALTO','MEDIO','BAJO')),
  responsable     TEXT,
  periodicidad    TEXT,
  activo          BOOLEAN DEFAULT true
);

-- 5. AUDITORÍAS (existente)
CREATE TABLE IF NOT EXISTS auditorias (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empresa_id      BIGINT NOT NULL REFERENCES empresas(id),
  usuario_id      BIGINT NOT NULL REFERENCES usuarios(id),
  estado          TEXT DEFAULT 'en_curso' CHECK (estado IN ('en_curso','finalizada')),
  fecha_apertura  DATE DEFAULT CURRENT_DATE,
  fecha_cierre    DATE,
  nombre          TEXT DEFAULT 'Auditoría Inicial',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 6. RESPUESTAS (existente)
CREATE TABLE IF NOT EXISTS respuestas (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  auditoria_id    BIGINT NOT NULL REFERENCES auditorias(id) ON DELETE CASCADE,
  requisito_codigo TEXT NOT NULL,
  cumplimiento    TEXT DEFAULT 'pendiente' CHECK (cumplimiento IN ('cumple','no_cumple','parcial','no_aplica','pendiente')),
  observacion     TEXT,
  fecha_vencimiento DATE,
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (auditoria_id, requisito_codigo)
);

-- 7. EVIDENCIAS (existente)
CREATE TABLE IF NOT EXISTS evidencias (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  respuesta_id    BIGINT NOT NULL REFERENCES respuestas(id) ON DELETE CASCADE,
  nombre          TEXT NOT NULL,
  url             TEXT NOT NULL,
  validado        BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 8. PLAN DE ACCIÓN (existente)
CREATE TABLE IF NOT EXISTS plan_accion (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  auditoria_id      BIGINT NOT NULL REFERENCES auditorias(id) ON DELETE CASCADE,
  requisito_codigo  TEXT,
  descripcion       TEXT,
  accion_correctiva TEXT,
  responsable       TEXT,
  fecha_compromiso  DATE,
  costo_estimado    NUMERIC(12,2),
  prioridad         TEXT DEFAULT 'media' CHECK (prioridad IN ('baja','media','alta','crítica')),
  estado_plan       TEXT DEFAULT 'pendiente' CHECK (estado_plan IN ('pendiente','en_progreso','completada','cancelada')),
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 9. INFORMES (existente)
CREATE TABLE IF NOT EXISTS informes (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  auditoria_id    BIGINT NOT NULL REFERENCES auditorias(id) ON DELETE CASCADE,
  contenido       TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABLAS NUEVAS — Módulos RRHH
-- ============================================================

-- 10. EMPLEADOS
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

-- 11. DOCUMENTOS (Expedientes Digitales)
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

-- 12. VACACIONES
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

-- 13. CONSTANCIAS
CREATE TABLE IF NOT EXISTS constancias (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empleado_id       BIGINT NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  empresa_id        BIGINT REFERENCES empresas(id),
  tipo              TEXT NOT NULL CHECK (tipo IN ('trabajo','sueldo','recomendacion')),
  contenido         TEXT,
  fecha_emision     DATE DEFAULT CURRENT_DATE,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS (permisiva — auth propia con JWT)
-- ============================================================
ALTER TABLE empresas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisitos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditorias  ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidencias  ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_accion ENABLE ROW LEVEL SECURITY;
ALTER TABLE informes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados   ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacaciones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE constancias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todo_empresas"    ON empresas    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_usuarios"    ON usuarios    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_modulos"     ON modulos     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_requisitos"  ON requisitos  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_auditorias"  ON auditorias  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_respuestas"  ON respuestas  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_evidencias"  ON evidencias  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_plan"        ON plan_accion FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_informes"    ON informes    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_empleados"   ON empleados   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_documentos"  ON documentos  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_vacaciones"  ON vacaciones  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "todo_constancias" ON constancias FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon;

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_respuestas_auditoria   ON respuestas(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_respuesta   ON evidencias(respuesta_id);
CREATE INDEX IF NOT EXISTS idx_plan_auditoria         ON plan_accion(auditoria_id);
CREATE INDEX IF NOT EXISTS idx_auditorias_empresa     ON auditorias(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empleados_empresa      ON empleados(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empleados_cedula       ON empleados(cedula);
CREATE INDEX IF NOT EXISTS idx_documentos_empleado    ON documentos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_vacaciones_empleado    ON vacaciones(empleado_id);
CREATE INDEX IF NOT EXISTS idx_constancias_empleado   ON constancias(empleado_id);
