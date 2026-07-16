-- =============================================
-- MIGRACIÓN: Bucket de Storage para Expedientes
-- Ejecutar en Supabase Dashboard → SQL Editor
-- =============================================

-- 1. Crear bucket 'expedientes' (público para lectura)
INSERT INTO storage.buckets (id, name, public)
VALUES ('expedientes', 'expedientes', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política de lectura pública
CREATE POLICY "Expedientes: lectura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'expedientes');

-- 3. Política de subida autenticada
CREATE POLICY "Expedientes: subida autenticada"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'expedientes');

-- 4. Política de eliminación autenticada
CREATE POLICY "Expedientes: eliminación autenticada"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'expedientes');
