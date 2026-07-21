import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root if it exists
dotenv.config({ path: path.join(import.meta.dirname, '../../../../.env') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:tsiferqnq@localhost:5432/cliniquedb?schema=public';

export const pool = new Pool({
  connectionString,
});

// Helper for single queries
export const query = (text: string, params?: any[]) => pool.query(text, params);
