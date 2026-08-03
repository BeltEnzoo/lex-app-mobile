export type DeaStatus = 'operativo' | 'pendiente' | 'rechazado';
export type DeaSource = 'lex' | 'comunitario';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DeaLocation {
  id: string;
  name: string;
  address: string;
  description?: string;
  coordinates: Coordinates;
  source: DeaSource;
  status: DeaStatus;
  isPublic: boolean;
  accessHours?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  /** Tipo de institución del Excel / Neon (Club, Hospital, Empresa…). */
  institutionType?: string;
  /** Ciudad / localidad. */
  locality?: string;
  province?: string;
  submittedByUserId?: string;
  rejectionReason?: string;
  swornDeclarationAccepted: boolean;
  createdAt: string;
}

export interface CardioSafeZone {
  id: string;
  name: string;
  description: string;
  address: string;
  accessHours: string;
  imageUri: string;
  center: Coordinates;
  radiusMeters: number;
  deaIds: string[];
}

export interface ZoneSubmissionInput {
  name?: string;
  address?: string;
  description?: string;
  coordinates?: Coordinates;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  locality?: string;
  province?: string;
  institutionType?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  installedAt?: string;
  deaPlacement?: string;
  alreadyInstalled?: boolean;
}

export interface RedLexVideo {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  category: 'rcp' | 'dea' | 'mantenimiento' | 'beneficios';
}

export interface RedLexBenefit {
  id: string;
  title: string;
  description: string;
}

export interface ControlReminder {
  id: string;
  title: string;
  description: string;
  frequency: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface DeaSubmissionInput {
  name: string;
  address: string;
  description?: string;
  coordinates: Coordinates;
  accessHours?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

export interface ContactInquiryInput {
  name: string;
  email: string;
  phone: string;
  message?: string;
  type: 'informacion' | 'capacitacion';
}
