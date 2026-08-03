-- Lex CardioSegura — schema inicial (Neon / PostgreSQL 16)
-- Pegar en: Neon Console → SQL Editor → Run

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE dea_source AS ENUM ('lex', 'comunitario');
CREATE TYPE dea_status AS ENUM ('operativo', 'pendiente', 'rechazado');
CREATE TYPE zone_status AS ENUM ('activa', 'pendiente', 'inactiva');
CREATE TYPE request_status AS ENUM ('pendiente', 'aprobado', 'rechazado');
CREATE TYPE inquiry_type AS ENUM ('informacion', 'capacitacion');
CREATE TYPE inquiry_status AS ENUM ('nuevo', 'atendido');

-- ---------------------------------------------------------------------------
-- DEA (desfibriladores)
-- ---------------------------------------------------------------------------

CREATE TABLE dea_locations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  address           TEXT NOT NULL,
  description       TEXT,
  lat               DOUBLE PRECISION NOT NULL,
  lng               DOUBLE PRECISION NOT NULL,
  access_hours      TEXT,
  contact_name      TEXT NOT NULL,
  contact_phone     TEXT NOT NULL,
  contact_email     TEXT NOT NULL,
  source            dea_source NOT NULL DEFAULT 'lex',
  status            dea_status NOT NULL DEFAULT 'pendiente',
  image_url         TEXT,
  is_public         BOOLEAN NOT NULL DEFAULT false,
  submitted_by_name TEXT,
  submitted_by_email TEXT,
  rejection_reason  TEXT,
  client_number     INTEGER,
  installed_at      DATE,
  institution_type  TEXT,
  brand             TEXT,
  model             TEXT,
  serial_number     TEXT,
  province          TEXT,
  locality          TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT dea_locations_lat_check CHECK (lat BETWEEN -90 AND 90),
  CONSTRAINT dea_locations_lng_check CHECK (lng BETWEEN -180 AND 180)
);

CREATE UNIQUE INDEX IF NOT EXISTS dea_locations_serial_uidx
  ON dea_locations (serial_number)
  WHERE serial_number IS NOT NULL;

CREATE INDEX dea_locations_status_public_idx
  ON dea_locations (status, is_public)
  WHERE status = 'operativo' AND is_public = true;

CREATE INDEX dea_locations_geo_idx
  ON dea_locations (lat, lng);

-- ---------------------------------------------------------------------------
-- Zonas cardioasistidas
-- ---------------------------------------------------------------------------

CREATE TABLE cardio_zones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  address       TEXT NOT NULL,
  description   TEXT,
  access_hours  TEXT,
  image_url     TEXT,
  center_lat    DOUBLE PRECISION NOT NULL,
  center_lng    DOUBLE PRECISION NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 500,
  status        zone_status NOT NULL DEFAULT 'pendiente',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT cardio_zones_lat_check CHECK (center_lat BETWEEN -90 AND 90),
  CONSTRAINT cardio_zones_lng_check CHECK (center_lng BETWEEN -180 AND 180),
  CONSTRAINT cardio_zones_radius_check CHECK (radius_meters > 0)
);

CREATE INDEX cardio_zones_status_idx
  ON cardio_zones (status)
  WHERE status = 'activa';

CREATE INDEX cardio_zones_geo_idx
  ON cardio_zones (center_lat, center_lng);

-- Relación N:N zona ↔ DEA
CREATE TABLE zone_deas (
  zone_id UUID NOT NULL REFERENCES cardio_zones (id) ON DELETE CASCADE,
  dea_id  UUID NOT NULL REFERENCES dea_locations (id) ON DELETE CASCADE,
  PRIMARY KEY (zone_id, dea_id)
);

-- ---------------------------------------------------------------------------
-- Solicitudes de incorporación (clientes → pendientes para Martín)
-- ---------------------------------------------------------------------------

CREATE TABLE zone_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL DEFAULT 'Sin nombre',
  address       TEXT NOT NULL DEFAULT 'Sin dirección',
  description   TEXT,
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  access_hours  TEXT,
  contact_name  TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  locality      TEXT,
  province      TEXT,
  institution_type TEXT,
  brand         TEXT,
  model         TEXT,
  serial_number TEXT,
  installed_at  DATE,
  dea_placement TEXT,
  already_installed BOOLEAN DEFAULT true,
  status        request_status NOT NULL DEFAULT 'pendiente',
  reviewed_at   TIMESTAMPTZ,
  published_dea_id UUID REFERENCES dea_locations (id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT zone_requests_lat_check CHECK (lat BETWEEN -90 AND 90),
  CONSTRAINT zone_requests_lng_check CHECK (lng BETWEEN -180 AND 180)
);

CREATE INDEX zone_requests_status_idx
  ON zone_requests (status, created_at DESC);

-- ---------------------------------------------------------------------------
-- Consultas / contacto (info, capacitación)
-- ---------------------------------------------------------------------------

CREATE TABLE contact_inquiries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT NOT NULL,
  message    TEXT,
  type       inquiry_type NOT NULL,
  status     inquiry_status NOT NULL DEFAULT 'nuevo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX contact_inquiries_status_idx
  ON contact_inquiries (status, created_at DESC);

-- ---------------------------------------------------------------------------
-- Media (videos / PDFs de la app)
-- ---------------------------------------------------------------------------

CREATE TABLE media_assets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  youtube_id TEXT,
  pdf_url    TEXT,
  notes      TEXT,
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dea_locations_set_updated_at
  BEFORE UPDATE ON dea_locations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER cardio_zones_set_updated_at
  BEFORE UPDATE ON cardio_zones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER media_assets_set_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Seeds opcionales (media placeholders + 1 zona demo)
-- ---------------------------------------------------------------------------

INSERT INTO media_assets (key, title, youtube_id, pdf_url, notes) VALUES
  (
    'zona_cardioasistida_video',
    '¿Qué es una zona cardioasistida?',
    'BQNNOh8c8ks',
    NULL,
    'Reemplazar con el video definitivo de Lex'
  ),
  (
    'elegir_lugar_pdf',
    '¿Por qué elegir un lugar cardioasistido?',
    NULL,
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'Reemplazar con el PDF definitivo de Lex'
  ),
  (
    'aprender_rcp_video',
    'Aprender RCP y uso de DEA',
    '7MTWm8O7u4E',
    NULL,
    'Reemplazar con el video definitivo de Lex'
  ),
  (
    'aprender_rcp_pdf',
    'Material RCP / DEA',
    NULL,
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'Reemplazar con el PDF definitivo de Lex'
  ),
  (
    'servicios_red_lex_pdf',
    'Material de la Red Lex',
    NULL,
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'Reemplazar con el PDF definitivo de Lex'
  ),
  (
    'servicios_red_lex_video_1',
    'Video 1 — Red Lex',
    'BQNNOh8c8ks',
    NULL,
    'Reemplazar con el video definitivo de Lex'
  ),
  (
    'servicios_red_lex_video_2',
    'Video 2 — Red Lex',
    'ILxjxfB4zNk',
    NULL,
    'Reemplazar con el video definitivo de Lex'
  );

-- Listo. El mapa leerá:
--   dea_locations WHERE status = 'operativo' AND is_public = true
--   cardio_zones  WHERE status = 'activa'
