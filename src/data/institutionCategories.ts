import { MEDIA } from '@/data/content';
import type { DeaLocation } from '@/types';

/** IDs de modalidad en la app → valores de `institution_type` en Neon (Excel actual). */
export const INSTITUTION_CATEGORY_TYPES: Record<string, string[]> = {
  gimnasios: ['gimnasio'],
  escuelas: ['escuela'],
  padel: ['padel'],
  'complejos-deportivos': ['club', 'complejo deportivo'],
  empresas: ['empresa'],
  'instituciones-sanitarias': [
    'hospital',
    'unidad sanitaria',
    'centro de rehabilitacion',
    'emergencias medicas',
    'consultorio cardiologico',
    'consultorio odontologico',
    'institucion sanitaria',
  ],
  otros: ['bomberos', 'otro'],
};

function normalizeType(value?: string | null): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const KNOWN_NON_OTROS = new Set(
  Object.entries(INSTITUTION_CATEGORY_TYPES)
    .filter(([id]) => id !== 'otros')
    .flatMap(([, types]) => types.map(normalizeType)),
);

/** Tipo desde el campo o, si falta, desde `description` ("Tipo: Club · ..."). */
export function getDeaInstitutionType(dea: DeaLocation): string | undefined {
  if (dea.institutionType?.trim()) {
    return dea.institutionType.trim();
  }
  const match = dea.description?.match(/Tipo:\s*([^·|/]+)/i);
  const parsed = match?.[1]?.trim();
  return parsed || undefined;
}

/** Ciudad desde el campo o desde `description` ("Ubicación: Bolivar, Buenos Aires"). */
export function getDeaLocality(dea: DeaLocation): string | undefined {
  if (dea.locality?.trim()) {
    return dea.locality.trim();
  }
  const match = dea.description?.match(/Ubicaci[oó]n:\s*([^·|/]+)/i);
  const place = match?.[1]?.trim();
  if (!place) return undefined;
  return place.split(',')[0]?.trim() || undefined;
}

/** Provincia desde el campo o desde `description` ("Ubicación: Bolivar, Buenos Aires"). */
export function getDeaProvince(dea: DeaLocation): string | undefined {
  if (dea.province?.trim()) {
    return dea.province.trim();
  }
  const match = dea.description?.match(/Ubicaci[oó]n:\s*([^·|/]+)/i);
  const place = match?.[1]?.trim();
  if (!place) return undefined;
  const parts = place
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 1] : undefined;
}

export function uniqueSorted(values: Array<string | undefined>): string[] {
  const set = new Set<string>();
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) set.add(trimmed);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'es'));
}

/** Coincidencias para typeahead (≥ minChars, sin acentos). */
export function matchLocationOptions(
  options: string[],
  query: string,
  minChars = 4,
): string[] {
  const q = normalizeType(query);
  if (q.length < minChars) return [];
  return options.filter((option) => normalizeType(option).includes(q));
}

export function filterDeasByCityAndType(
  deas: DeaLocation[],
  options: {
    city?: string | null;
    province?: string | null;
    institutionType?: string | null;
  },
): DeaLocation[] {
  const cityNorm = normalizeType(options.city);
  const provinceNorm = normalizeType(options.province);
  const typeNorm = normalizeType(options.institutionType);

  return deas.filter((dea) => {
    if (cityNorm && normalizeType(getDeaLocality(dea)) !== cityNorm) {
      return false;
    }
    if (provinceNorm && normalizeType(getDeaProvince(dea)) !== provinceNorm) {
      return false;
    }
    if (typeNorm && normalizeType(getDeaInstitutionType(dea)) !== typeNorm) {
      return false;
    }
    return true;
  });
}

/** Modalidades de la app que tienen al menos un DEA cargado. */
export function getLoadedModalityOptions(
  deas: DeaLocation[],
): Array<{ id: string; label: string; count: number }> {
  return MEDIA.porqueElegirLugarCardioasistido.lugares
    .map((lugar) => ({
      id: lugar.id,
      label: lugar.title,
      count: filterDeasByCategory(deas, lugar.id).length,
    }))
    .filter((item) => item.count > 0);
}

/** Todas las modalidades, con conteo (incluye 0) para filtrar en conjunto. */
export function getAllModalityOptions(
  deas: DeaLocation[],
): Array<{ id: string; label: string; count: number }> {
  return MEDIA.porqueElegirLugarCardioasistido.lugares.map((lugar) => ({
    id: lugar.id,
    label: lugar.title,
    count: filterDeasByCategory(deas, lugar.id).length,
  }));
}

/** Tipos crudos de institución presentes en el listado (Club, Hospital…). */
export function getLoadedInstitutionTypeOptions(deas: DeaLocation[]): string[] {
  return uniqueSorted(deas.map((dea) => getDeaInstitutionType(dea)));
}

export function describeFilterEmpty(options: {
  city?: string | null;
  province?: string | null;
  typeLabel?: string | null;
}): string {
  const city = options.city?.trim();
  const province = options.province?.trim();
  const typeLabel = options.typeLabel?.trim();
  const place = [city, province].filter(Boolean).join(', ');

  if (place && typeLabel) {
    return `No hay DEA instalados en ${place} para el tipo “${typeLabel}”.`;
  }
  if (place) {
    return `No hay DEA instalados en ${place}.`;
  }
  if (typeLabel) {
    return `No hay DEA instalados para el tipo “${typeLabel}”.`;
  }
  return 'No hay DEA con esos filtros.';
}

export function getInstitutionCategoryLabel(categoryId?: string | null): string | null {
  if (!categoryId) return null;
  return (
    MEDIA.porqueElegirLugarCardioasistido.lugares.find((lugar) => lugar.id === categoryId)?.title ??
    null
  );
}

export function resolveCategoryId(
  value?: string | string[] | null,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0] || undefined;
  }
  return value || undefined;
}

export function filterDeasByCategory(
  deas: DeaLocation[],
  categoryId?: string | null,
): DeaLocation[] {
  if (!categoryId) return deas;

  if (categoryId === 'otros') {
    return deas.filter((dea) => {
      const type = normalizeType(getDeaInstitutionType(dea));
      if (!type) return true;
      if (INSTITUTION_CATEGORY_TYPES.otros.map(normalizeType).includes(type)) return true;
      return !KNOWN_NON_OTROS.has(type);
    });
  }

  const allowed = new Set((INSTITUTION_CATEGORY_TYPES[categoryId] ?? []).map(normalizeType));
  if (allowed.size === 0) return [];

  return deas.filter((dea) => allowed.has(normalizeType(getDeaInstitutionType(dea))));
}
