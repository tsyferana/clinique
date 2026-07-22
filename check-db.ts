import { query } from './backend/src/database/db.js';

async function checkData() {
  try {
    const consultations = await query('SELECT * FROM "Consultation"');
    console.log("Consultations:", consultations.rows);
    
    const prescriptions = await query('SELECT * FROM "Prescription"');
    console.log("Prescriptions:", prescriptions.rows);
    
    const patients = await query('SELECT id, first_name, last_name FROM "ProfilePatient"');
    console.log("Patients:", patients.rows);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkData();
