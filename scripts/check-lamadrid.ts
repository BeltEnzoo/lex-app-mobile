import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const rows = await sql`
    SELECT name, locality, province, lat, lng
    FROM dea_locations
    WHERE name ILIKE '%lamadrid%'
       OR locality ILIKE '%lamadrid%'
       OR name ILIKE '%ingeniero%'
    ORDER BY name
    LIMIT 15
  `;

  for (const row of rows) {
    console.log(
      `${row.name} | ${row.locality}, ${row.province} | ${row.lat}, ${row.lng}`,
    );
  }

  // Distancia aproximada a Olavarría (-36.89, -60.32)
  if (rows[0]) {
    const olavarria = { lat: -36.8927, lng: -60.3225 };
    const dlat = (Number(rows[0].lat) - olavarria.lat) * 111;
    const dlng =
      (Number(rows[0].lng) - olavarria.lng) *
      111 *
      Math.cos((olavarria.lat * Math.PI) / 180);
    const km = Math.sqrt(dlat * dlat + dlng * dlng);
    console.log(`Distancia aprox. a Olavarría: ${km.toFixed(0)} km`);
  }
}

main();
