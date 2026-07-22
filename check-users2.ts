import { query } from './backend/src/database/db.js';

async function check() {
  const users = await query('SELECT * FROM "ProfilePatient"');
  console.log(users.rows);
  process.exit(0);
}
check();
