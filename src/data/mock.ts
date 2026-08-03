import type { CardioSafeZone, ControlReminder, DeaLocation, RedLexBenefit, RedLexVideo } from '@/types';

export const INITIAL_DEAS: DeaLocation[] = [
  {
    id: 'dea-lex-1',
    name: 'Shopping Los Patos',
    address: 'Av. Colón 3450, Mar del Plata',
    description: 'DEA Lex instalado en planta baja, recepción central.',
    coordinates: { latitude: -38.0058, longitude: -57.5426 },
    source: 'lex',
    status: 'operativo',
    isPublic: true,
    accessHours: 'Lun a Dom 10:00 - 22:00',
    contactName: 'Lex CardioSegura',
    contactPhone: '+54 9 223 555 0101',
    contactEmail: 'info@lex.com.ar',
    swornDeclarationAccepted: true,
    createdAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 'dea-lex-2',
    name: 'Club Atlético Central',
    address: 'Av. Independencia 2100, Mar del Plata',
    description: 'Gabinete exterior señalizado junto a tribunas.',
    coordinates: { latitude: -37.9982, longitude: -57.5561 },
    source: 'lex',
    status: 'operativo',
    isPublic: true,
    accessHours: 'Eventos y entrenamientos',
    contactName: 'Lex CardioSegura',
    contactPhone: '+54 9 223 555 0101',
    contactEmail: 'info@lex.com.ar',
    swornDeclarationAccepted: true,
    createdAt: '2025-02-15T10:00:00.000Z',
  },
  {
    id: 'dea-com-1',
    name: 'Farmacia del Centro',
    address: 'San Martín 1820, Mar del Plata',
    description: 'DEA comunitario verificado por Lex.',
    coordinates: { latitude: -38.0021, longitude: -57.5489 },
    source: 'comunitario',
    status: 'operativo',
    isPublic: true,
    accessHours: 'Lun a Sáb 08:00 - 20:00',
    contactName: 'María González',
    contactPhone: '+54 9 223 444 7788',
    contactEmail: 'farmacia@ejemplo.com',
    swornDeclarationAccepted: true,
    createdAt: '2025-03-01T10:00:00.000Z',
  },
  {
    id: 'dea-lex-3',
    name: 'Terminal de Ómnibus',
    address: 'Av. Luro 4700, Mar del Plata',
    description: 'Punto estratégico de alta concurrencia.',
    coordinates: { latitude: -38.0185, longitude: -57.5322 },
    source: 'lex',
    status: 'operativo',
    isPublic: true,
    accessHours: '24 horas',
    contactName: 'Lex CardioSegura',
    contactPhone: '+54 9 223 555 0101',
    contactEmail: 'info@lex.com.ar',
    swornDeclarationAccepted: true,
    createdAt: '2025-04-20T10:00:00.000Z',
  },
];

export const CARDIO_SAFE_ZONES: CardioSafeZone[] = [
  {
    id: 'zone-1',
    name: 'Zona Cardio-Segura Centro MDP',
    description: 'Cobertura estratégica con 3 DEAs en un radio de 800 m del microcentro.',
    address: 'Av. Colón 3450, Mar del Plata',
    accessHours: 'Lun a Dom 08:00 - 22:00',
    imageUri:
      'https://images.unsplash.com/photo-1584036561561-dafc550f444f?auto=format&fit=crop&w=800&q=80',
    center: { latitude: -38.005, longitude: -57.545 },
    radiusMeters: 800,
    deaIds: ['dea-lex-1', 'dea-com-1', 'dea-lex-2'],
  },
  {
    id: 'zone-2',
    name: 'Zona Cardio-Segura Terminal',
    description: 'Área de transporte con DEA Lex y puntos de respuesta rápida.',
    address: 'Av. Luro 4700, Mar del Plata',
    accessHours: '24 horas',
    imageUri:
      'https://images.unsplash.com/photo-1516574180901-ee7180e27b68?auto=format&fit=crop&w=800&q=80',
    center: { latitude: -38.0185, longitude: -57.5322 },
    radiusMeters: 500,
    deaIds: ['dea-lex-3'],
  },
];

export const RED_LEX_VIDEOS: RedLexVideo[] = [
  {
    id: 'video-1',
    title: 'RCP básica: solo con las manos',
    description: 'Aprendé compresiones torácicas efectivas antes de la ambulancia.',
    youtubeId: 'BQNNOh8c8ks',
    category: 'rcp',
  },
  {
    id: 'video-2',
    title: 'Uso del DEA paso a paso',
    description: 'Guía para operadores laicos con un desfibrilador automático.',
    youtubeId: '7MTWm8O7u4E',
    category: 'dea',
  },
  {
    id: 'video-3',
    title: 'Controles periódicos del equipo',
    description: 'Qué revisar para mantener tu DEA siempre operativo.',
    youtubeId: 'ILxjxfB4zNk',
    category: 'mantenimiento',
  },
  {
    id: 'video-4',
    title: 'Beneficios de la Red Lex',
    description: 'Ventajas de integrar tu espacio a la red cardio-segura Lex.',
    youtubeId: 'BQNNOh8c8ks',
    category: 'beneficios',
  },
];

export const RED_LEX_BENEFITS: RedLexBenefit[] = [
  {
    id: 'benefit-1',
    title: 'Soporte técnico Lex',
    description: 'Asistencia especializada para instalación, mantenimiento y recambio de insumos.',
  },
  {
    id: 'benefit-2',
    title: 'Capacitación certificada',
    description: 'Acceso preferencial a cursos de RCP y uso de DEA para tu equipo.',
  },
  {
    id: 'benefit-3',
    title: 'Visibilidad en el mapa',
    description: 'Tu espacio aparece como punto cardio-seguro verificado dentro de la red Lex.',
  },
  {
    id: 'benefit-4',
    title: 'Recordatorios de control',
    description: 'Alertas de mantenimiento preventivo para garantizar que el DEA esté operativo.',
  },
];

export const CONTROL_REMINDERS: ControlReminder[] = [
  {
    id: 'control-1',
    title: 'Control mensual visual',
    description: 'Verificar led de estado, sellos intactos y accesibilidad del gabinete.',
    frequency: 'Mensual',
  },
  {
    id: 'control-2',
    title: 'Control de batería y pads',
    description: 'Confirmar fecha de vencimiento de electrodos y nivel de batería.',
    frequency: 'Trimestral',
  },
  {
    id: 'control-3',
    title: 'Simulacro PREMI',
    description: 'Realizar simulacro del plan de respuesta ante emergencias.',
    frequency: 'Semestral',
  },
];

export const SWORN_DECLARATION_TEXT =
  'Declaro bajo juramento que el Desfibrilador Externo Automático (DEA) informado se encuentra operativo, accesible al público en las condiciones declaradas, y que los datos proporcionados son verídicos. Entiendo que Fundación Lex verificará manualmente la información y podrá contactarme para validar el alta en la red.';

export const DEFAULT_MAP_REGION = {
  latitude: -36.8927,
  longitude: -60.3225,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};
