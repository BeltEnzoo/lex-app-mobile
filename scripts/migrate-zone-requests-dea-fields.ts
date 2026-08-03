import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Falta DATABASE_URL en .env');
}

const sql = neon(databaseUrl);

async function main() {
  await sql`
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
      ADD COLUMN IF NOT EXISTS published_dea_id UUID
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS zone_requests_pending_idx
      ON zone_requests (status, created_at DESC)
      WHERE status = 'pendiente'
  `;

  console.log('Migración zone_requests DEA fields OK');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
