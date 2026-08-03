/**
 * Aprueba una solicitud de incorporación y publica el DEA.
 *
 * Uso:
 *   npm run approve:zone -- <request-id>
 */
import 'dotenv/config';

const apiUrl = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787').replace(/\/$/, '');
const approveKey = process.env.LEX_APPROVE_KEY;
const requestId = process.argv[2];

async function main() {
  if (!requestId) {
    console.error('Uso: npm run approve:zone -- <request-id>');
    process.exit(1);
  }

  const response = await fetch(`${apiUrl}/zone-requests/${requestId}/approve`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(approveKey ? { 'x-lex-approve-key': approveKey } : {}),
    },
  });

  const payload = (await response.json()) as { error?: string; deaId?: string };
  if (!response.ok) {
    throw new Error(payload.error || `HTTP ${response.status}`);
  }

  console.log('Solicitud aprobada. DEA publicado:', payload.deaId);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
