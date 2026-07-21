import { pool, query } from './db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  console.log('🌱 Début du seed de la base de données...');

  try {
    console.log('🧹 Suppression des anciennes données...');
    await query('TRUNCATE "User", "MedicalService", "ProfileDoctor", "ProfilePatient", "ProfileStaff", "Appointment", "QueueEntry", "Consultation", "Prescription", "PrescriptionItem", "DoctorWorkingHours", "DoctorUnavailability" CASCADE;');

    console.log('🏥 Création des services médicaux...');
    const servicesData = [
      { id: uuidv4(), name: 'Médecine Générale', description: 'Consultations générales et suivis', duration_minutes: 30, price: 50.0 },
      { id: uuidv4(), name: 'Cardiologie', description: 'Maladies du cœur et des vaisseaux', duration_minutes: 45, price: 80.0 },
      { id: uuidv4(), name: 'Pédiatrie', description: 'Médecine des enfants', duration_minutes: 30, price: 60.0 },
      { id: uuidv4(), name: 'Dermatologie', description: 'Maladies de la peau', duration_minutes: 20, price: 70.0 },
      { id: uuidv4(), name: 'Gynécologie', description: 'Santé de la femme', duration_minutes: 30, price: 65.0 }
    ];

    for (const s of servicesData) {
      await query(
        'INSERT INTO "MedicalService" (id, name, description, duration_minutes, price, updated_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [s.id, s.name, s.description, s.duration_minutes, s.price]
      );
    }

    console.log('👤 Création des utilisateurs...');
    const defaultPassword = await bcrypt.hash('clinique2026', 10);

    const users = [
      { id: uuidv4(), email: 'admin@clinique.com', role: 'ADMIN', first_name: 'Super', last_name: 'Admin', phone: '0340000001' },
      { id: uuidv4(), email: 'dr.dupont@clinique.com', role: 'DOCTOR', first_name: 'Jean', last_name: 'Dupont', phone: '0340000002' },
      { id: uuidv4(), email: 'dr.martin@clinique.com', role: 'DOCTOR', first_name: 'Claire', last_name: 'Martin', phone: '0340000003' },
      { id: uuidv4(), email: 'accueil@clinique.com', role: 'STAFF', first_name: 'Alice', last_name: 'Accueil', phone: '0340000004' },
      { id: uuidv4(), email: 'patient@example.com', role: 'PATIENT', first_name: 'Bob', last_name: 'Testeur', phone: '0340000005' }
    ];

    for (const u of users) {
      await query(
        'INSERT INTO "User" (id, email, password_hash, role, first_name, last_name, phone, is_active, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())',
        [u.id, u.email, defaultPassword, u.role, u.first_name, u.last_name, u.phone]
      );
    }

    console.log('🔗 Liaison des profils utilisateurs...');
    const drDupont = users[1];
    const drMartin = users[2];
    const staffUser = users[3];
    const patientUser = users[4];

    const drDupontId = uuidv4();
    await query(
      'INSERT INTO "ProfileDoctor" (id, user_id, first_name, last_name, email, phone, specialty, license_number, cabinet_number, service_id, is_available, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW())',
      [drDupontId, drDupont.id, drDupont.first_name, drDupont.last_name, drDupont.email, drDupont.phone, 'Médecine Générale', 'MED-12345', 'Cab 1', servicesData[0].id]
    );

    const drMartinId = uuidv4();
    await query(
      'INSERT INTO "ProfileDoctor" (id, user_id, first_name, last_name, email, phone, specialty, license_number, cabinet_number, service_id, is_available, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW())',
      [drMartinId, drMartin.id, drMartin.first_name, drMartin.last_name, drMartin.email, drMartin.phone, 'Cardiologie', 'MED-67890', 'Cab 2', servicesData[1].id]
    );

    await query(
      'INSERT INTO "ProfileStaff" (id, user_id, first_name, last_name, email, phone, department, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
      [uuidv4(), staffUser.id, staffUser.first_name, staffUser.last_name, staffUser.email, staffUser.phone, 'Réception']
    );

    await query(
      'INSERT INTO "ProfilePatient" (id, user_id, first_name, last_name, email, phone, gender, birth_date, address, blood_group, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())',
      [uuidv4(), patientUser.id, patientUser.first_name, patientUser.last_name, patientUser.email, patientUser.phone, 'M', '1990-05-15T00:00:00Z', '123 Rue de la Santé', 'O+']
    );

    console.log('⏰ Configuration des horaires...');
    for (let day = 1; day <= 5; day++) {
      await query(
        'INSERT INTO "DoctorWorkingHours" (id, doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active) VALUES ($1, $2, $3, $4, $5, $6, true)',
        [uuidv4(), drDupontId, day, '08:00', '17:00', 30]
      );
      await query(
        'INSERT INTO "DoctorWorkingHours" (id, doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active) VALUES ($1, $2, $3, $4, $5, $6, true)',
        [uuidv4(), drMartinId, day, '09:00', '16:00', 45]
      );
    }

    console.log('✅ Seed terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors du seed :', error);
  } finally {
    pool.end();
  }
}

seed();
