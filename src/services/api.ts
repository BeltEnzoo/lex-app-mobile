import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { CardioSafeZone, DeaLocation, ZoneSubmissionInput } from '@/types';

/**
 * Resuelve la URL de la API según plataforma:
 * - URL remota en EXPO_PUBLIC_API_URL (producción / staging) → se usa tal cual
 * - Web / iOS simulator → localhost:8787
 * - Emulador Android → 10.0.2.2:8787 (alias de localhost del PC)
 * - Celular físico en dev → IP LAN del host de Expo
 */
function isRemoteApiUrl(url: string): boolean {
  return (
    url.startsWith('https://') ||
    (url.startsWith('http://') &&
      !url.includes('localhost') &&
      !url.includes('127.0.0.1') &&
      !url.includes('10.0.2.2'))
  );
}

function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');

  // Build de Play Store / staging remoto: siempre esta URL
  if (envUrl && isRemoteApiUrl(envUrl)) {
    return envUrl;
  }

  if (Platform.OS === 'web') {
    return envUrl?.replace('://10.0.2.2', '://localhost') || 'http://localhost:8787';
  }

  const hostUri = Constants.expoConfig?.hostUri ?? '';
  const host = hostUri.split(':')[0];

  const isLanHost =
    Boolean(host) &&
    host !== 'localhost' &&
    host !== '127.0.0.1' &&
    host !== '10.0.2.2' &&
    !host.startsWith('127.');

  // Dispositivo físico en la misma red Wi‑Fi (desarrollo)
  if (isLanHost && Platform.OS !== 'web') {
    return `http://${host}:8787`;
  }

  if (Platform.OS === 'android') {
    if (envUrl) {
      return envUrl
        .replace('://localhost', '://10.0.2.2')
        .replace('://127.0.0.1', '://10.0.2.2');
    }
    return 'http://10.0.2.2:8787';
  }

  // iOS simulator
  return envUrl || 'http://localhost:8787';
}

const API_BASE_URL = resolveApiBaseUrl();

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Error HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function fetchPublicDeas(): Promise<DeaLocation[]> {
  const data = await apiFetch<{ deas: DeaLocation[] }>('/deas');
  return data.deas;
}

export async function fetchActiveZones(): Promise<CardioSafeZone[]> {
  const data = await apiFetch<{ zones: CardioSafeZone[] }>('/zones');
  return data.zones;
}

export async function createZoneRequest(input: ZoneSubmissionInput): Promise<void> {
  await apiFetch('/zone-requests', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
