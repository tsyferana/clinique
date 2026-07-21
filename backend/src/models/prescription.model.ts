import { query, pool } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const prescriptionModel = {
  async findAll() {
    const res = await query('SELECT * FROM "Prescription"');
    return res.rows;
  },
  async findById(id: string) {
    const res = await query('SELECT * FROM "Prescription" WHERE id = $1', [id]);
    return res.rows[0];
  },
  async create(data: any) {
    const id = data.id || uuidv4();
    const keys = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at');
    const cols = ['id', ...keys, 'created_at', 'updated_at'].map(k => `"${k}"`).join(', ');
    const vals = [id, ...keys.map(k => data[k])];
    const placeholders = [...vals.map((_, i) => `$${i + 1}`), 'NOW()', 'NOW()'].join(', ');
    
    const res = await query(
      `INSERT INTO "Prescription" (${cols}) VALUES (${placeholders}) RETURNING *`,
      vals
    );
    return res.rows[0];
  },
  async update(id: string, data: any) {
    const keys = Object.keys(data);
    if (keys.length === 0) return this.findById(id);
    
    const setClause = keys.map((k, i) => `"${k}" = $${i + 2}`).join(', ');
    const vals = [id, ...keys.map(k => data[k])];
    
    const res = await query(
      `UPDATE "Prescription" SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      vals
    );
    return res.rows[0];
  },
  async delete(id: string) {
    await query('DELETE FROM "Prescription" WHERE id = $1', [id]);
    return true;
  }
  ,
  async findByDoctorId(doctor_id: string) {
    const res = await query('SELECT * FROM "Prescription" WHERE doctor_id = $1', [doctor_id]);
    return res.rows;
  }  ,
  async findByPatientId(patient_id: string) {
    const res = await query('SELECT * FROM "Prescription" WHERE patient_id = $1', [patient_id]);
    return res.rows;
  }
,
  async findByConsultationId(consultation_id: string) {
    const res = await query('SELECT * FROM "Prescription" WHERE consultation_id = $1', [consultation_id]);
    return res.rows;
  }
};
