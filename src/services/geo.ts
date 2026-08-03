import type { CardioSafeZone, Coordinates, DeaLocation } from '@/types';

const EARTH_RADIUS_METERS = 6371000;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceInMeters(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

export function findNearestDea(
  origin: Coordinates,
  deas: DeaLocation[],
): { dea: DeaLocation; distance: number } | null {
  const publicDeas = deas.filter((dea) => dea.isPublic && dea.status === 'operativo');

  if (publicDeas.length === 0) {
    return null;
  }

  return publicDeas
    .map((dea) => ({
      dea,
      distance: distanceInMeters(origin, dea.coordinates),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
}

export function findNearestZone(
  origin: Coordinates,
  zones: CardioSafeZone[],
): { zone: CardioSafeZone; distance: number } | null {
  if (zones.length === 0) {
    return null;
  }

  return zones
    .map((zone) => ({
      zone,
      distance: distanceInMeters(origin, zone.center),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
}

export function openExternalMaps(destination: Coordinates, label: string) {
  const query = encodeURIComponent(`${destination.latitude},${destination.longitude} (${label})`);
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}
