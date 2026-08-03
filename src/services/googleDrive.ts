/** Utilidades para archivos públicos de Google Drive */

const DRIVE_ID_PATTERNS = [
  /\/file\/d\/([^/]+)/,
  /[?&]id=([^&]+)/,
  /\/d\/([^/]+)/,
];

export function extractGoogleDriveFileId(urlOrId: string): string | null {
  const value = urlOrId.trim();
  if (!value) return null;

  if (/^[a-zA-Z0-9_-]{20,}$/.test(value) && !value.includes('/')) {
    return value;
  }

  for (const pattern of DRIVE_ID_PATTERNS) {
    const match = value.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

export function isGoogleDriveUrl(url: string): boolean {
  return /drive\.google\.com|docs\.google\.com/.test(url) || Boolean(extractGoogleDriveFileId(url));
}

/** Visor embebido (PDF / video) dentro de la app */
export function googleDrivePreviewUrl(urlOrId: string): string {
  const id = extractGoogleDriveFileId(urlOrId);
  if (!id) {
    return urlOrId;
  }
  return `https://drive.google.com/file/d/${id}/preview`;
}

/** Abrir / descargar en el navegador */
export function googleDriveOpenUrl(urlOrId: string): string {
  const id = extractGoogleDriveFileId(urlOrId);
  if (!id) {
    return urlOrId;
  }
  return `https://drive.google.com/file/d/${id}/view`;
}
