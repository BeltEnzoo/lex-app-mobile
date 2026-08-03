/**
 * Importa DEAs del Excel Lex → Neon (con geocoding de direcciones).
 *
 * Uso:
 *   npm run import:deas -- ./data/deas_instalados.xlsx
 */
import { readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
import * as XLSX from 'xlsx';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Falta DATABASE_URL en .env');
}

const sql = neon(databaseUrl);

type RawRow = Record<string, unknown>;

function normalizeKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[º°]/g, '')
    .replace(/[()]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

function pick(row: RawRow, aliases: string[]): string | undefined {
  const normalized = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), value]),
  );

  for (const alias of aliases) {
    const value = normalized[normalizeKey(alias)];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return undefined;
}

function toNumber(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function excelDateToIso(value: string | undefined): string | null {
  if (!value) return null;
  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && asNumber > 20000) {
    const utc = Date.UTC(1899, 11, 30) + asNumber * 86400000;
    return new Date(utc).toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

function readLexSheet(filePath: string): RawRow[] {
  const workbook = XLSX.read(readFileSync(filePath), { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: '',
    raw: true,
  });

  if (matrix.length < 3) {
    return [];
  }

  const groupHeaders = matrix[0].map((cell) => String(cell ?? '').trim());
  const fieldHeaders = matrix[1].map((cell) => String(cell ?? '').trim());

  const headers = fieldHeaders.map((field, index) => {
    if (field) return field;
    if (groupHeaders[index]) return groupHeaders[index];
    return `col_${index}`;
  });

  const rows: RawRow[] = [];
  for (const cells of matrix.slice(2)) {
    if (!cells || cells.every((cell) => String(cell ?? '').trim() === '')) {
      continue;
    }

    const row: RawRow = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? '';
    });
    rows.push(row);
  }

  return rows;
}

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'ar');

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'LexCardioSegura/1.0 (contacto@lexserviciosintegrales.com.ar)',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.warn(`Geocode HTTP ${response.status} para: ${query}`);
    return null;
  }

  const results = (await response.json()) as Array<{ lat: string; lon: string }>;
  if (!results[0]) return null;

  return {
    lat: Number(results[0].lat),
    lng: Number(results[0].lon),
  };
}

async function geocodeWithFallback(parts: {
  name: string;
  address: string;
  locality?: string;
  province?: string;
}): Promise<{ lat: number; lng: number } | null> {
  const locality = (parts.locality ?? '')
    .replace(/^Gral\.?\s+/i, 'General ')
    .replace(/\bLamadrid\b/i, 'General Lamadrid');

  const queries = [
    parts.address,
    [parts.address, locality, parts.province, 'Argentina'].filter(Boolean).join(', '),
    [parts.name, locality, parts.province, 'Argentina'].filter(Boolean).join(', '),
    [locality, parts.province, 'Argentina'].filter(Boolean).join(', '),
  ]
    .map((q) => q.trim())
    .filter((q, index, arr) => q.length > 3 && arr.indexOf(q) === index);

  for (const query of queries) {
    const coords = await geocode(query);
    await sleep(1100);
    if (coords) {
      return coords;
    }
  }

  return null;
}

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Pasá el archivo: npm run import:deas -- ./data/deas_instalados.xlsx');
    process.exit(1);
  }

  const filePath = resolve(fileArg);
  const dataRows = readLexSheet(filePath);

  if (dataRows.length === 0) {
    console.error('El archivo no tiene filas de datos.');
    process.exit(1);
  }

  console.log(`Filas a procesar: ${dataRows.length}`);
  console.log('Columnas:', Object.keys(dataRows[0]).join(' | '));

  const existingSerials = await sql`
    SELECT serial_number FROM dea_locations WHERE serial_number IS NOT NULL
  `;
  const knownSerials = new Set(
    existingSerials.map((row) => String(row.serial_number)),
  );
  console.log(`Ya en Neon: ${knownSerials.size} por Nº de serie`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let already = 0;

  for (const [index, row] of dataRows.entries()) {
    const name = pick(row, [
      'nombre_de_la_institucion',
      'nombre_institucion',
      'name',
      'nombre',
      'lugar',
      'institucion',
    ]);
    const address =
      pick(row, [
        'direcion_copiada_de_google_maps', // typo del Excel
        'direccion_copiada_de_google_maps',
        'direcion',
        'direccion',
        'address',
        'domicilio',
        'ubicacion',
      ]) ?? '';
    const locality = pick(row, ['localidad', 'city', 'ciudad']);
    const province = pick(row, ['provincia', 'province', 'estado']);
    const serial = pick(row, ['n_serie', 'nº_serie', 'no_serie', 'serie', 'serial_number', 'serial']);
    const contactName =
      pick(row, [
        'persona_responsable_de_la_institucion',
        'persona_responsable',
        'responsable',
        'contact_name',
        'contacto',
      ]) ?? 'Lex CardioSegura';
    const institutionType = pick(row, ['tipo_de_institucion', 'tipo_institucion', 'tipo']);
    const brand = pick(row, ['marca', 'brand']);
    const model = pick(row, ['modelo', 'model']);
    const clientNumber = toNumber(pick(row, ['n_cliente', 'nº_cliente', 'no_cliente', 'cliente']));
    const installedAt = excelDateToIso(pick(row, ['fecha_instalacion', 'fecha', 'installed_at']));

    let lat = toNumber(pick(row, ['lat', 'latitude', 'latitud']));
    let lng = toNumber(pick(row, ['lng', 'lon', 'long', 'longitude', 'longitud']));

    if (!name) {
      console.warn(`Fila ${index + 3}: sin nombre. Se omite.`);
      skipped += 1;
      continue;
    }

    if (serial && knownSerials.has(serial)) {
      already += 1;
      continue;
    }

    const composedAddress = [address, locality, province, 'Argentina']
      .filter(Boolean)
      .join(', ');

    if (lat === null || lng === null) {
      const querySeed = address || [name, locality, province].filter(Boolean).join(', ');
      if (!querySeed.trim() && !locality && !province) {
        console.warn(`Fila ${index + 3} (${name}): sin dirección ni coords. Se omite.`);
        skipped += 1;
        continue;
      }

      process.stdout.write(`Geocoding ${index + 1}/${dataRows.length}: ${name}... `);
      const coords = await geocodeWithFallback({
        name,
        address,
        locality,
        province,
      });

      if (!coords) {
        console.log('falló');
        skipped += 1;
        continue;
      }

      lat = coords.lat;
      lng = coords.lng;
      console.log(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }

    const descriptionParts = [
      institutionType ? `Tipo: ${institutionType}` : null,
      brand || model ? `Equipo: ${[brand, model].filter(Boolean).join(' ')}` : null,
      serial ? `Serie: ${serial}` : null,
      locality || province ? `Ubicación: ${[locality, province].filter(Boolean).join(', ')}` : null,
    ].filter(Boolean);

    const description = descriptionParts.join(' · ') || null;
    const finalAddress = address || composedAddress;

    await sql`
      INSERT INTO dea_locations (
        name, address, description, lat, lng,
        contact_name, contact_phone, contact_email,
        source, status, is_public,
        client_number, installed_at, institution_type,
        brand, model, serial_number, province, locality
      )
      VALUES (
        ${name},
        ${finalAddress},
        ${description},
        ${lat},
        ${lng},
        ${contactName},
        ${'+54 9 2284 717419'},
        ${'info@lexserviciosintegrales.com.ar'},
        'lex',
        'operativo',
        true,
        ${clientNumber},
        ${installedAt},
        ${institutionType ?? null},
        ${brand ?? null},
        ${model ?? null},
        ${serial ?? null},
        ${province ?? null},
        ${locality ?? null}
      )
    `;
    inserted += 1;
    if (serial) {
      knownSerials.add(serial);
    }
  }

  console.log(
    `Import listo. Insertados: ${inserted}. Ya existían: ${already}. Omitidos: ${skipped}.`,
  );
  console.log(`Archivo: ${filePath} (${extname(filePath)})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
