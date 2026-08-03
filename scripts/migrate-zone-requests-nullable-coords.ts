import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`ALTER TABLE zone_requests ALTER COLUMN lat DROP NOT NULL`;
  await sql`ALTER TABLE zone_requests ALTER COLUMN lng DROP NOT NULL`;
  console.log('OK: zone_requests.lat/lng ahora permiten NULL');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
