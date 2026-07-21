import { query } from './backend/src/database/db.js';
query('SELECT column_name FROM information_schema.columns WHERE table_name = \'MedicalService\'')
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(()=>process.exit(0));
