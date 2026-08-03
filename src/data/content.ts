export const OFFICIAL_WEBSITE_URL = 'https://lexserviciosintegrales.com.ar/';

/** Teléfono Lex Servicios Integrales (web oficial) */
export const WHATSAPP_PHONE = '5492284717419';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}`;

export const LEX_FOLLOW_UP_MESSAGE =
  'Un representante de Lex se comunicará con vos para coordinar los próximos pasos.';

export const LEX_ZONE_REQUEST_SUCCESS =
  'Recibimos tu solicitud. Lex revisará los datos, se pondrá en contacto y, si el DEA está en condiciones, lo publicará en el mapa de la red.';

/** Tipos de institución para el formulario de incorporación (alineados al filtro). */
export const INSTITUTION_TYPE_OPTIONS = [
  'Gimnasio',
  'Escuela',
  'Padel',
  'Complejo deportivo',
  'Empresa',
  'Institucion sanitaria',
  'Otro',
] as const;

/** Material Lex (Google Drive — acceso “Cualquiera con el enlace”) */
export const MEDIA = {
  queEsZonaCardioasistida: {
    title: '¿Qué es una zona cardioasistida?',
    video: {
      title: 'Video explicativo',
      driveUrl:
        'https://drive.google.com/file/d/1OgtaNCuw9pve8bmS-2im2ztM7oe2OTGH/view?usp=drive_link',
    },
    pdf: {
      title: 'Guía N° 1 — LEX',
      driveUrl:
        'https://drive.google.com/file/d/1h9InvVGvoaLnWX1JsM5di4khRLqDqF7R/view?usp=drive_link',
    },
  },
  porqueElegirLugarCardioasistido: {
    title: '¿Por qué elegir un Lugar Cardioasistido?',
    headline: 'Un Lugar Cardioasistido es mucho más que un DEA instalado.',
    body: 'Integrar equipamiento, capacitación, señalización y un plan de respuesta convierte un espacio en un entorno preparado para actuar cuando cada minuto cuenta.',
    cta: 'Conocé por qué estos espacios hacen la diferencia...',
    pdf: {
      title: '¿Por qué elegir un Lugar Cardioasistido?',
      subtitle: 'Descargá la guía y conocé los beneficios...',
      driveUrl:
        'https://drive.google.com/file/d/14xoSWucefxkyNFgY7doU731M7mKa29K7/view?usp=drive_link',
    },
    lugares: [
      {
        id: 'gimnasios',
        title: 'Gimnasios',
        description: 'Centros de entrenamiento cardioasistidos',
        icon: 'barbell' as const,
        accent: '#0047AB',
      },
      {
        id: 'escuelas',
        title: 'Escuelas',
        description: 'Instituciones educativas preparadas',
        icon: 'school' as const,
        accent: '#16A34A',
      },
      {
        id: 'padel',
        title: 'Pádel',
        description: 'Clubes y canchas cardioasistidas',
        icon: 'tennisball' as const,
        accent: '#0D9488',
      },
      {
        id: 'complejos-deportivos',
        title: 'Complejos deportivos',
        description: 'Instituciones deportivas de la red',
        icon: 'shield' as const,
        accent: '#DC2626',
      },
      {
        id: 'empresas',
        title: 'Empresas',
        description: 'Espacios laborales cardioasistidos',
        icon: 'briefcase' as const,
        accent: '#EA580C',
      },
      {
        id: 'instituciones-sanitarias',
        title: 'Instituciones sanitarias',
        description: 'Centros de salud de la Red LEX',
        icon: 'medkit' as const,
        accent: '#0891B2',
      },
      {
        id: 'otros',
        title: 'Otros',
        description: 'Más lugares de la Red LEX',
        icon: 'star' as const,
        accent: '#7C3AED',
      },
    ],
  },
  aprenderRcp: {
    title: 'Aprender RCP y uso de DEA',
    headline: 'Aprendé RCP y usá un DEA.',
    videos: [
      {
        id: 'rcp-video-1',
        title: '1 - Diferencia entre paro cardíaco y muerte súbita',
        driveUrl:
          'https://drive.google.com/file/d/1AaKc9p_xaGOG_yGHhQ4YYIT-yiO4_YpN/view?usp=drive_link',
      },
      {
        id: 'rcp-video-2',
        title: '2 - Cadena de supervivencia',
        driveUrl:
          'https://drive.google.com/file/d/12L2V666ZMlL87hvUWWlK2ydIEESEYcas/view?usp=drive_link',
      },
      {
        id: 'rcp-video-3',
        title: '3 - Cómo usar un DEA',
        driveUrl:
          'https://drive.google.com/file/d/1_OcOY7LuIpsblpc6l46vr0XJZ2Som1Ry/view?usp=drive_link',
      },
    ],
    pdfs: [
      {
        id: 'rcp-pdf-1',
        title: '1 - Catálogo de capacitaciones',
        driveUrl:
          'https://drive.google.com/file/d/1lp7zW7Wl8K_4_jd9-60AmvGlgnPDD0yi/view?usp=drive_link',
      },
      {
        id: 'rcp-pdf-2',
        title: '2 - RCP y uso de DEA',
        driveUrl:
          'https://drive.google.com/file/d/1yHvc5L9Lgs_Ug_5o6Q7CebhsKvAiW1KJ/view?usp=drive_link',
      },
      {
        id: 'rcp-pdf-3',
        title: '3 - Catálogo',
        driveUrl:
          'https://drive.google.com/file/d/1_oi_t-XfefKWtlTtfUK8YDKpqcc43lyl/view?usp=drive_link',
      },
    ],
  },
  serviciosRedLex: {
    headline: 'LEX te acompaña antes, durante y después.',
    pdf: {
      title: 'PDF',
      subtitle: 'Servicios de Red Lex',
      driveUrl:
        'https://drive.google.com/file/d/1fHtOD3_R6n80ErhvfsDZWIptJ7IncOen/view?usp=drive_link',
    },
    videos: [
      {
        id: 'servicios-video-1',
        title: 'Video',
        subtitle: 'Conocé nuestros servicios',
        driveUrl:
          'https://drive.google.com/file/d/19LPvp7sxgBEFRlrZreyaBvYmeaj0v3Zt/view?usp=drive_link',
      },
    ],
    plans: [
      {
        id: 'plan-gimnasios',
        title: 'Plan Lex - Gimnasios',
        subtitle: 'Accedé a tu DEA',
        icon: 'heart' as const,
        accent: '#16A34A',
        driveUrl:
          'https://drive.google.com/file/d/1vslOWqAiQCdnViExHHGlojY0E4vCuNC3/view?usp=drive_link',
      },
      {
        id: 'plan-escuelas',
        title: 'Plan Lex - Escuelas',
        subtitle: 'Accedé a tu DEA',
        icon: 'school' as const,
        accent: '#EA580C',
        driveUrl:
          'https://drive.google.com/file/d/1hlq_BG3_3J4xbiejY9d8PDDWcd4bGRB2/view?usp=drive_link',
      },
      {
        id: 'plan-padel',
        title: 'Plan Lex Pádel',
        subtitle: 'Clubes y centros deportivos',
        icon: 'tennisball' as const,
        accent: '#2563EB',
        driveUrl:
          'https://drive.google.com/file/d/1vqENpnMqZhrLWe5608Ml7ytWE86XOsl3/view?usp=drive_link',
      },
    ],
  },
};
