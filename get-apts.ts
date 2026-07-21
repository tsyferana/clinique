import { query } from './backend/src/database/db.js';
query('SELECT id, patient_id, doctor_id, appointment_date, appointment_time, status FROM "Appointment"').then(r => console.table(r.rows)).catch(console.error).finally(()=>process.exit(0));
