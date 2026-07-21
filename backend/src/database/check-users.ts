import { pool } from './db.js';

async function main() {
  try {
    const r = await pool.query('SELECT email, role, password_hash IS NOT NULL as has_hash FROM "User"');
    console.log(JSON.stringify(r.rows, null, 2));
  } catch(e: any) {
    console.error('ERROR:', e.message);
  } finally {
    pool.end();
  }
}
main();
