/**
 * Carga DEA/zonas de demo en Neon (útil antes de importar el Excel).
 * Uso: yarn seed:demo
 */
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Falta DATABASE_URL en .env');
}

const sql = neon(databaseUrl);

async function main() {
  const existingDeas = await sql`SELECT COUNT(*)::int AS count FROM dea_locations`;
  if (Number(existingDeas[0].count) > 0) {
    console.log(`Ya hay ${existingDeas[0].count} DEA(s). Seed demo omitido.`);
  } else {
    const deas = [
      {
        name: 'Shopping Los Patos',
        address: 'Av. Colón 3450, Mar del Plata',
        description: 'DEA Lex instalado en planta baja, recepción central.',
        lat: -38.0058,
        lng: -57.5426,
        accessHours: 'Lun a Dom 10:00 - 22:00',
      },
      {
        name: 'Club Atlético Central',
        address: 'Av. Independencia 2100, Mar del Plata',
        description: 'Gabinete exterior señalizado junto a tribunas.',
        lat: -37.9982,
        lng: -57.5561,
        accessHours: 'Eventos y entrenamientos',
      },
      {
        name: 'Farmacia del Centro',
        address: 'San Martín 1820, Mar del Plata',
        description: 'DEA comunitario verificado por Lex.',
        lat: -38.0021,
        lng: -57.5489,
        accessHours: 'Lun a Sáb 08:00 - 20:00',
        source: 'comunitario' as const,
        contactName: 'María González',
        contactPhone: '+54 9 223 444 7788',
        contactEmail: 'farmacia@ejemplo.com',
      },
      {
        name: 'Terminal de Ómnibus',
        address: 'Av. Luro 4700, Mar del Plata',
        description: 'Punto estratégico de alta concurrencia.',
        lat: -38.0185,
        lng: -57.5322,
        accessHours: '24 horas',
      },
    ];

    for (const dea of deas) {
      await sql`
        INSERT INTO dea_locations (
          name, address, description, lat, lng, access_hours,
          contact_name, contact_phone, contact_email,
          source, status, is_public
        )
        VALUES (
          ${dea.name},
          ${dea.address},
          ${dea.description},
          ${dea.lat},
          ${dea.lng},
          ${dea.accessHours},
          ${dea.contactName ?? 'Lex CardioSegura'},
          ${dea.contactPhone ?? '+54 9 223 555 0101'},
          ${dea.contactEmail ?? 'info@lex.com.ar'},
          ${(dea.source ?? 'lex') as 'lex' | 'comunitario'},
          'operativo',
          true
        )
      `;
    }
    console.log(`Insertados ${deas.length} DEA(s) demo.`);
  }

  // Insertar solo si no hay zonas activas
  const existing = await sql`SELECT COUNT(*)::int AS count FROM cardio_zones`;
  if (Number(existing[0].count) === 0) {
    const zoneRows = await sql`
      INSERT INTO cardio_zones (
        name, address, description, access_hours, image_url,
        center_lat, center_lng, radius_meters, status
      )
      VALUES
        (
          'Zona Cardio-Segura Centro MDP',
          'Av. Colón 3450, Mar del Plata',
          'Cobertura estratégica con DEAs en el microcentro.',
          'Lun a Dom 08:00 - 22:00',
          'https://images.unsplash.com/photo-1584036561561-dafc550f444f?auto=format&fit=crop&w=800&q=80',
          -38.005,
          -57.545,
          800,
          'activa'
        ),
        (
          'Zona Cardio-Segura Terminal',
          'Av. Luro 4700, Mar del Plata',
          'Área de transporte con DEA Lex.',
          '24 horas',
          'https://images.unsplash.com/photo-1516574180901-ee7180e27b68?auto=format&fit=crop&w=800&q=80',
          -38.0185,
          -57.5322,
          500,
          'activa'
        )
      RETURNING id, name
    `;
    console.log('Zonas creadas:', zoneRows.map((z) => z.name).join(', '));
  }

  const count = await sql`
    SELECT COUNT(*)::int AS count FROM dea_locations
    WHERE status = 'operativo' AND is_public = true
  `;
  console.log(`DEAs públicos operativos: ${count[0].count}`);
  console.log('Seed demo listo.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
