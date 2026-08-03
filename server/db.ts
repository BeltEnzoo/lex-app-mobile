import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'Falta DATABASE_URL. Copiá .env.example a .env y pegá el connection string de Neon.',
  );
}

export const sql = neon(databaseUrl);
