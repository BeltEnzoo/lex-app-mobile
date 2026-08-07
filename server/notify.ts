import nodemailer from 'nodemailer';

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
  return `<li><strong>${label}:</strong> ${String(value)}</li>`;
}

export async function notifyZoneRequest(payload: ZoneRequestNotifyPayload): Promise<void> {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s+/g, '');
  const to = process.env.ZONE_REQUEST_NOTIFY_EMAIL?.trim();
  const fromName = process.env.GMAIL_FROM_NAME?.trim() || 'Lex CardioSegura';

  if (!user || !pass || !to) {
    console.warn(
      '[notify] Falta GMAIL_USER, GMAIL_APP_PASSWORD o ZONE_REQUEST_NOTIFY_EMAIL; no se envía aviso.',
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  const subject = `Nueva solicitud de zona — ${payload.name || 'Sin nombre'}`;
  const html = `
    <h2>Nueva solicitud de Incorporar zona</h2>
    <p>Se recibió una solicitud pendiente de revisión en Lex CardioSegura.</p>
    <ul>
      ${line('ID', payload.id)}
      ${line('Lugar', payload.name)}
      ${line('Dirección', payload.address)}
      ${line('Localidad', payload.locality)}
      ${line('Provincia', payload.province)}
      ${line('Tipo', payload.institutionType)}
      ${line('Contacto', payload.contactName)}
      ${line('Teléfono', payload.contactPhone)}
      ${line('Email', payload.contactEmail)}
      ${line('Marca DEA', payload.brand)}
      ${line('Modelo', payload.model)}
      ${line('Nº serie', payload.serialNumber)}
      ${line('Fecha instalación', payload.installedAt)}
      ${line('Ubicación DEA', payload.deaPlacement)}
      ${line('Ya instalado', payload.alreadyInstalled)}
      ${line('Lat', payload.lat)}
      ${line('Lng', payload.lng)}
      ${line('Descripción', payload.description)}
    </ul>
    <p>Estado: <strong>pendiente</strong>. Revisá y aprobá cuando corresponda.</p>
  `;

  await transporter.sendMail({
    from: `"${fromName}" <${user}>`,
    to,
    subject,
    html,
  });

  console.log(`[notify] Aviso Gmail enviado a ${to} (solicitud ${payload.id})`);
}
