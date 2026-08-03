# Base de datos (Neon)

Archivo principal: [`schema.sql`](./schema.sql)

## Cómo aplicarlo

1. Entrá a [console.neon.tech](https://console.neon.tech)
2. Abrí el proyecto `lex_app`
3. Andá a **SQL Editor**
4. Pegá todo el contenido de `schema.sql`
5. Ejecutá **Run**

Si todo sale bien, en **Tables** deberías ver:

- `dea_locations`
- `cardio_zones`
- `zone_deas`
- `zone_requests`
- `contact_inquiries`
- `media_assets`

## Connection string

En Neon: **Dashboard → Connection details → Connection string**

Guardala en un `.env` local (nunca la subas a git):

```env
DATABASE_URL=postgresql://...
API_PORT=8787
EXPO_PUBLIC_API_URL=http://localhost:8787
```

## API local (app → Neon)

La app **no** se conecta directo a Neon. Corre la API:

```bash
yarn api
```

Endpoints:

- `GET /health`
- `GET /deas` — DEA `operativo` + públicos
- `GET /zones` — zonas `activa`
- `POST /zone-requests` — solicitud de incorporación (queda `pendiente`, no sale en el mapa)
- `GET /zone-requests?status=pendiente` — listado para Lex
- `POST /zone-requests/:id/approve` — publica el DEA en el mapa (`operativo` + público)
- `POST /zone-requests/:id/reject` — rechaza la solicitud

Migración de campos DEA en solicitudes:

```bash
npm run migrate:zone-requests
```

Aprobar una solicitud:

```bash
npm run approve:zone -- <request-id>
```

## Datos

Demo (mientras llega el Excel):

```bash
yarn seed:demo
```

Importar Excel/CSV:

```bash
yarn import:deas -- ./data/deas.xlsx
```
