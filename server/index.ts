import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { sql } from './db';
import { notifyZoneRequest } from './notify';

const app = new Hono();
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 8787);

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
);

app.get('/health', (c) => c.json({ ok: true, service: 'lex-api' }));

app.get('/deas', async (c) => {
  const rows = await sql`
    SELECT
      id,
      name,
      address,
      description,
      lat,
      lng,
      access_hours,
      contact_name,
      contact_phone,
      contact_email,
      source,
      status,
      is_public,
      rejection_reason,
      institution_type,
      locality,
      province,
      created_at
    FROM dea_locations
    WHERE status = 'operativo' AND is_public = true
    ORDER BY name ASC
  `;

  return c.json({
    deas: rows.map((row) => {
      const description = row.description ? String(row.description) : '';
      const institutionType = row.institution_type
        ? String(row.institution_type)
        : (() => {
            const match = description.match(/Tipo:\s*([^·|/]+)/i);
            return match?.[1]?.trim() || undefined;
          })();
      const locality = row.locality
        ? String(row.locality)
        : (() => {
            const match = description.match(/Ubicaci[oó]n:\s*([^·|/]+)/i);
            const place = match?.[1]?.trim();
            return place?.split(',')[0]?.trim() || undefined;
          })();
      const province = row.province ? String(row.province) : undefined;

      return {
      id: String(row.id),
      name: String(row.name),
      address: String(row.address),
      description: description || undefined,
      coordinates: {
        latitude: Number(row.lat),
        longitude: Number(row.lng),
      },
      source: row.source as 'lex' | 'comunitario',
      status: row.status as 'operativo' | 'pendiente' | 'rechazado',
      isPublic: Boolean(row.is_public),
      accessHours: row.access_hours ? String(row.access_hours) : undefined,
      contactName: String(row.contact_name),
      contactPhone: String(row.contact_phone),
      contactEmail: String(row.contact_email),
      institutionType,
      locality,
      province,
      rejectionReason: row.rejection_reason ? String(row.rejection_reason) : undefined,
      swornDeclarationAccepted: true,
      createdAt: new Date(String(row.created_at)).toISOString(),
    };
    }),
  });
});

app.get('/zones', async (c) => {
  const zones = await sql`
    SELECT
      z.id,
      z.name,
      z.address,
      z.description,
      z.access_hours,
      z.image_url,
      z.center_lat,
      z.center_lng,
      z.radius_meters
    FROM cardio_zones z
    WHERE z.status = 'activa'
    ORDER BY z.name ASC
  `;

  const links = await sql`
    SELECT zone_id, dea_id
    FROM zone_deas
  `;

  const deaIdsByZone = new Map<string, string[]>();
  for (const link of links) {
    const zoneId = String(link.zone_id);
    const list = deaIdsByZone.get(zoneId) ?? [];
    list.push(String(link.dea_id));
    deaIdsByZone.set(zoneId, list);
  }

  return c.json({
    zones: zones.map((zone) => ({
      id: String(zone.id),
      name: String(zone.name),
      address: String(zone.address),
      description: zone.description ? String(zone.description) : '',
      accessHours: zone.access_hours ? String(zone.access_hours) : '',
      imageUri: zone.image_url ? String(zone.image_url) : '',
      center: {
        latitude: Number(zone.center_lat),
        longitude: Number(zone.center_lng),
      },
      radiusMeters: Number(zone.radius_meters),
      deaIds: deaIdsByZone.get(String(zone.id)) ?? [],
    })),
  });
});

app.post('/zone-requests', async (c) => {
  const body = await c.req.json<{
    name?: string;
    address?: string;
    description?: string;
    coordinates?: { latitude: number; longitude: number };
    accessHours?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    locality?: string;
    province?: string;
    institutionType?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    installedAt?: string;
    deaPlacement?: string;
    alreadyInstalled?: boolean;
  }>();

  const name = body.name?.trim() || '';
  const address = body.address?.trim() || '';
  const contactName = body.contactName?.trim();
  const contactPhone = body.contactPhone?.trim();
  const contactEmail = body.contactEmail?.trim().toLowerCase();
  const locality = body.locality?.trim() || null;
  const province = body.province?.trim() || null;
  const institutionType = body.institutionType?.trim() || null;
  const brand = body.brand?.trim() || null;
  const model = body.model?.trim() || null;
  const serialNumber = body.serialNumber?.trim() || null;
  const lat =
    typeof body.coordinates?.latitude === 'number' ? body.coordinates.latitude : null;
  const lng =
    typeof body.coordinates?.longitude === 'number' ? body.coordinates.longitude : null;

  if (!contactName || !contactPhone || !contactEmail) {
    return c.json(
      { error: 'Completá nombre, teléfono y correo de contacto (obligatorios).' },
      400,
    );
  }

  let installedAt: string | null = null;
  const rawDate = body.installedAt?.trim();
  if (rawDate) {
    const iso = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const dmy = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (iso) {
      installedAt = rawDate;
    } else if (dmy) {
      installedAt = `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
    } else {
      return c.json({ error: 'Fecha de instalación inválida. Usá DD/MM/AAAA.' }, 400);
    }
  }

  const rows = await sql`
    INSERT INTO zone_requests (
      name,
      address,
      description,
      lat,
      lng,
      access_hours,
      contact_name,
      contact_phone,
      contact_email,
      locality,
      province,
      institution_type,
      brand,
      model,
      serial_number,
      installed_at,
      dea_placement,
      already_installed,
      status
    )
    VALUES (
      ${name || 'Sin nombre'},
      ${address || 'Sin dirección'},
      ${body.description?.trim() || null},
      ${lat},
      ${lng},
      ${null},
      ${contactName},
      ${contactPhone},
      ${contactEmail},
      ${locality},
      ${province},
      ${institutionType},
      ${brand},
      ${model},
      ${serialNumber},
      ${installedAt},
      ${body.deaPlacement?.trim() || null},
      ${body.alreadyInstalled !== false},
      'pendiente'
    )
    RETURNING id, created_at, status
  `;

  const requestId = String(rows[0].id);

  // No bloquear la respuesta HTTP si Gmail tarda o falla
  void notifyZoneRequest({
    id: requestId,
    name: name || 'Sin nombre',
    address: address || 'Sin dirección',
    contactName,
    contactPhone,
    contactEmail,
    locality,
    province,
    institutionType,
    brand,
    model,
    serialNumber,
    installedAt,
    deaPlacement: body.deaPlacement?.trim() || null,
    alreadyInstalled: body.alreadyInstalled !== false,
    lat,
    lng,
    description: body.description?.trim() || null,
  }).catch((error) => {
    console.error('[zone-requests] Falló el aviso por email:', error);
  });

  return c.json(
    {
      id: requestId,
      status: String(rows[0].status),
      createdAt: new Date(String(rows[0].created_at)).toISOString(),
    },
    201,
  );
});

app.get('/zone-requests', async (c) => {
  const status = c.req.query('status') ?? 'pendiente';
  const rows = await sql`
    SELECT
      id, name, address, description, lat, lng, access_hours,
      contact_name, contact_phone, contact_email,
      locality, province, institution_type, brand, model, serial_number,
      installed_at, dea_placement, already_installed, status, created_at,
      published_dea_id
    FROM zone_requests
    WHERE status = ${status}
    ORDER BY created_at DESC
  `;

  return c.json({
    requests: rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      address: String(row.address),
      description: row.description ? String(row.description) : undefined,
      coordinates: { latitude: Number(row.lat), longitude: Number(row.lng) },
      accessHours: row.access_hours ? String(row.access_hours) : undefined,
      contactName: String(row.contact_name),
      contactPhone: String(row.contact_phone),
      contactEmail: String(row.contact_email),
      locality: row.locality ? String(row.locality) : undefined,
      province: row.province ? String(row.province) : undefined,
      institutionType: row.institution_type ? String(row.institution_type) : undefined,
      brand: row.brand ? String(row.brand) : undefined,
      model: row.model ? String(row.model) : undefined,
      serialNumber: row.serial_number ? String(row.serial_number) : undefined,
      installedAt: row.installed_at ? String(row.installed_at) : undefined,
      deaPlacement: row.dea_placement ? String(row.dea_placement) : undefined,
      alreadyInstalled: row.already_installed !== false,
      status: String(row.status),
      publishedDeaId: row.published_dea_id ? String(row.published_dea_id) : undefined,
      createdAt: new Date(String(row.created_at)).toISOString(),
    })),
  });
});

/** Aprueba una solicitud pendiente y publica el DEA en el mapa. */
app.post('/zone-requests/:id/approve', async (c) => {
  const approveKey = process.env.LEX_APPROVE_KEY;
  if (approveKey) {
    const provided = c.req.header('x-lex-approve-key');
    if (provided !== approveKey) {
      return c.json({ error: 'No autorizado.' }, 401);
    }
  }

  const id = c.req.param('id');
  const rows = await sql`
    SELECT *
    FROM zone_requests
    WHERE id = ${id}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return c.json({ error: 'Solicitud no encontrada.' }, 404);
  }

  const request = rows[0];
  if (String(request.status) !== 'pendiente') {
    return c.json({ error: `La solicitud ya está en estado “${request.status}”.` }, 409);
  }

  if (request.lat == null || request.lng == null) {
    return c.json(
      { error: 'No se puede aprobar: la solicitud no tiene coordenadas GPS.' },
      400,
    );
  }

  const descriptionParts = [
    request.institution_type ? `Tipo: ${request.institution_type}` : null,
    request.brand || request.model
      ? `Equipo: ${[request.brand, request.model].filter(Boolean).join(' ')}`
      : null,
    request.serial_number ? `Serie: ${request.serial_number}` : null,
    request.locality || request.province
      ? `Ubicación: ${[request.locality, request.province].filter(Boolean).join(', ')}`
      : null,
    request.dea_placement ? `Ubicación en el lugar: ${request.dea_placement}` : null,
  ].filter(Boolean);

  const deaRows = await sql`
    INSERT INTO dea_locations (
      name, address, description, lat, lng,
      access_hours, contact_name, contact_phone, contact_email,
      source, status, is_public,
      institution_type, brand, model, serial_number,
      province, locality, installed_at
    )
    VALUES (
      ${String(request.name)},
      ${String(request.address)},
      ${descriptionParts.join(' · ') || null},
      ${Number(request.lat)},
      ${Number(request.lng)},
      ${request.access_hours ? String(request.access_hours) : null},
      ${String(request.contact_name)},
      ${String(request.contact_phone)},
      ${String(request.contact_email)},
      'lex',
      'operativo',
      true,
      ${request.institution_type ? String(request.institution_type) : null},
      ${request.brand ? String(request.brand) : null},
      ${request.model ? String(request.model) : null},
      ${request.serial_number ? String(request.serial_number) : null},
      ${request.province ? String(request.province) : null},
      ${request.locality ? String(request.locality) : null},
      ${request.installed_at ? String(request.installed_at) : null}
    )
    RETURNING id
  `;

  const deaId = String(deaRows[0].id);

  await sql`
    UPDATE zone_requests
    SET
      status = 'aprobado',
      reviewed_at = now(),
      published_dea_id = ${deaId}
    WHERE id = ${id}
  `;

  return c.json({
    ok: true,
    requestId: id,
    deaId,
    status: 'aprobado',
  });
});

app.post('/zone-requests/:id/reject', async (c) => {
  const approveKey = process.env.LEX_APPROVE_KEY;
  if (approveKey) {
    const provided = c.req.header('x-lex-approve-key');
    if (provided !== approveKey) {
      return c.json({ error: 'No autorizado.' }, 401);
    }
  }

  const id = c.req.param('id');
  const rows = await sql`
    UPDATE zone_requests
    SET status = 'rechazado', reviewed_at = now()
    WHERE id = ${id} AND status = 'pendiente'
    RETURNING id
  `;

  if (rows.length === 0) {
    return c.json({ error: 'Solicitud no encontrada o ya procesada.' }, 404);
  }

  return c.json({ ok: true, requestId: id, status: 'rechazado' });
});

console.log(`Lex API escuchando en http://0.0.0.0:${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
});
