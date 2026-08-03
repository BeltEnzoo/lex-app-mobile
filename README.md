# Lex CardioSegura

App móvil multiplataforma (Android + iOS) para localizar DEAs, zonas cardio-seguras y acceder a la Red Lex.

## Funcionalidades incluidas

- Mapa público de DEAs operativos (Lex y comunitarios aprobados)
- Búsqueda del DEA más cercano y de la zona cardio-segura más cercana
- Registro/login para cargar DEAs comunitarios y acceder a la Red Lex
- Carga comunitaria con declaración jurada (queda en estado pendiente)
- Red Lex con videos de YouTube, beneficios y controles recomendados

## Requisitos

- Node.js 20+
- Expo Go o emulador Android / iOS
- API keys de Google Maps (Android e iOS) en `app.json`

## Instalación

```bash
npm install
npm run start
```

Luego escaneá el QR con Expo Go o ejecutá:

```bash
npm run android
npm run ios
```

### Probar en navegador (desarrollo)

```bash
npm run web
```

El mapa interactivo requiere Android/iOS. En web verás un listado de DEAs para desarrollo.

## Configuración de mapas

Reemplazá en `app.json`:

- `YOUR_ANDROID_GOOGLE_MAPS_API_KEY`
- `YOUR_IOS_GOOGLE_MAPS_API_KEY`

Habilitá en Google Cloud Console: Maps SDK for Android, Maps SDK for iOS y Geolocation API.

## Estructura

- `app/` rutas con Expo Router
- `src/components/` UI y pantallas reutilizables
- `src/services/storage.ts` persistencia local (demo)
- `src/data/mock.ts` DEAs, zonas y contenido Red Lex

## Próximos pasos sugeridos

1. Backend real (Supabase/Firebase) para auth, moderación Lex y sincronización
2. Panel web admin para aprobar DEAs comunitarios
3. Notificaciones push cuando Lex cambie el estado de una carga
4. Publicación en Play Store y App Store con EAS Build

## Flujo DEA comunitario

1. Usuario registrado completa formulario + declaración jurada
2. Estado `pendiente` (no visible en mapa público)
3. Lex contacta manualmente y aprueba
4. Estado `operativo` → visible en mapa
