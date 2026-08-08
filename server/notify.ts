type ZoneRequestNotifyPayload = {
  id: string;
  name: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  locality?: string | null;
  province?: string | null;
  institutionType?: string | null;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  installedAt?: string | null;
  deaPlacement?: string | null;
  alreadyInstalled?: boolean;
  lat?: number | null;
  lng?: number | null;
  description?: string | null;
};

function line(label: string, value?: string | number | boolean | null): string {
  if (value === undefined || value === null || value === '') return '';
  return `${label}: ${String(value)}`;
}

export async function notifyZoneRequest(payload: ZoneRequestNotifyPayload): Promise<void> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim();

  if (!accessKey) {
    console.warn('[notify] Falta WEB3FORMS_ACCESS_KEY; no se envía aviso.');
    return;
  }

  const subject = `Nueva solicitud de zona — ${payload.name || 'Sin nombre'}`;
  const message = [
    'Nueva solicitud de Incorporar zona (Lex CardioSegura)',
    '',
    line('ID', payload.id),
    line('Lugar', payload.name),
    line('Dirección', payload.address),
    line('Localidad', payload.locality),
    line('Provincia', payload.province),
    line('Tipo', payload.institutionType),
    line('Contacto', payload.contactName),
    line('Teléfono', payload.contactPhone),
    line('Email', payload.contactEmail),
    line('Marca DEA', payload.brand),
    line('Modelo', payload.model),
    line('Nº serie', payload.serialNumber),
    line('Fecha instalación', payload.installedAt),
    line('Ubicación DEA', payload.deaPlacement),
    line('Ya instalado', payload.alreadyInstalled),
    line('Lat', payload.lat),
    line('Lng', payload.lng),
    line('Descripción', payload.description),
    '',
    'Estado: pendiente',
  ]
    .filter(Boolean)
    .join('\n');

  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: accessKey,
      subject,
      from_name: 'Lex CardioSegura',
      name: payload.contactName,
      email: payload.contactEmail,
      phone: payload.contactPhone,
      message,
      botcheck: '',
    }),
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
  } | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      `Web3Forms error: ${result?.message || `HTTP ${response.status}`}`,
    );
  }

  console.log(`[notify] Aviso Web3Forms enviado (solicitud ${payload.id})`);
}
