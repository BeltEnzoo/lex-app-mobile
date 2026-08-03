-- Amplía zone_requests con datos del DEA / lugar para incorporación.
ALTER TABLE zone_requests
  ADD COLUMN IF NOT EXISTS locality TEXT,
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS institution_type TEXT,
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS serial_number TEXT,
  ADD COLUMN IF NOT EXISTS installed_at DATE,
  ADD COLUMN IF NOT EXISTS dea_placement TEXT,
  ADD COLUMN IF NOT EXISTS already_installed BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_dea_id UUID REFERENCES dea_locations (id);

CREATE INDEX IF NOT EXISTS zone_requests_pending_idx
  ON zone_requests (status, created_at DESC)
  WHERE status = 'pendiente';
