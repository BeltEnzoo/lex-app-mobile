import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Falta DATABASE_URL en .env');
}

const sql = neon(databaseUrl);

async function main() {
  await sql`
    ALTER TABLE dea_locations
      ADD COLUMN IF NOT EXISTS client_number INTEGER,
      ADD COLUMN IF NOT EXISTS installed_at DATE,
      ADD COLUMN IF NOT EXISTS institution_type TEXT,
      ADD COLUMN IF NOT EXISTS brand TEXT,
      ADD COLUMN IF NOT EXISTS model TEXT,
      ADD COLUMN IF NOT EXISTS serial_number TEXT,
      ADD COLUMN IF NOT EXISTS province TEXT,
      ADD COLUMN IF NOT EXISTS locality TEXT
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS dea_locations_serial_uidx
      ON dea_locations (serial_number)
      WHERE serial_number IS NOT NULL
  `;

  console.log('Migración Excel fields OK');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
