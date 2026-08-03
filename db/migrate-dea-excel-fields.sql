-- Extiende dea_locations con campos del Excel de Lex
-- Correr en Neon SQL Editor (una vez)

ALTER TABLE dea_locations
  ADD COLUMN IF NOT EXISTS client_number INTEGER,
  ADD COLUMN IF NOT EXISTS installed_at DATE,
  ADD COLUMN IF NOT EXISTS institution_type TEXT,
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS serial_number TEXT,
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS locality TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS dea_locations_serial_uidx
  ON dea_locations (serial_number)
  WHERE serial_number IS NOT NULL;
