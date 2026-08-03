/**
 * Corrige coords de General Lamadrid (partido BA), no la calle de San Isidro.
 * Centro aproximado del partido: -37.2494, -61.2625
 */
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

// General Lamadrid, Provincia de Buenos Aires (cabecera del partido)
const LAMADRID = { lat: -37.2494, lng: -61.2625 };

async function main() {
  const updated = await sql`
    UPDATE dea_locations
    SET
      lat = ${LAMADRID.lat},
      lng = ${LAMADRID.lng},
      address = CASE
        WHEN address IS NULL OR TRIM(address) = '' OR address ILIKE '%boulogne%' OR address ILIKE '%san isidro%'
          THEN ${'General Lamadrid, Buenos Aires, Argentina'}
        WHEN address NOT ILIKE '%lamadrid%' AND (locality ILIKE '%lamadrid%' OR name ILIKE '%lamadrid%' OR name ILIKE '%ingeniero%')
          THEN ${'General Lamadrid, Buenos Aires, Argentina'}
        ELSE address
      END,
      locality = 'General Lamadrid',
      province = 'Buenos Aires'
    WHERE locality ILIKE '%lamadrid%'
       OR name ILIKE '%lamadrid%'
       OR name ILIKE '%ingeniero%'
       OR (name ILIKE '%consultorio%cardiolog%' AND (locality ILIKE '%lamadrid%' OR lat BETWEEN -34.6 AND -34.4))
    RETURNING name, serial_number, lat, lng
  `;

  console.log(`Actualizados: ${updated.length}`);
  for (const row of updated) {
    console.log(`- ${row.name} (${row.serial_number})`);
  }

  const count = await sql`
    SELECT COUNT(*)::int AS count FROM dea_locations
    WHERE status = 'operativo' AND is_public = true
  `;
  console.log(`DEA públicos: ${count[0].count}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
