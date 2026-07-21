import { query, pool } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const unavailabilityModel = {
  async findAll() {
    const res = await query('SELECT * FROM "DoctorUnavailability"');
    return res.rows;
  },
  async findById(id: string) {
    const res = await query('SELECT * FROM "DoctorUnavailability" WHERE id = $1', [id]);
    return res.rows[0];
  },
  async create(data: any) {
    const id = data.id || uuidv4();
    const keys = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at');
    const cols = ['id', ...keys, 'created_at', 'updated_at'].map(k => `"${k}"`).join(', ');
    const vals = [id, ...keys.map(k => data[k])];
    const placeholders = [...vals.map((_, i) => `$${i + 1}`), 'NOW()', 'NOW()'].join(', ');
    
    const res = await query(
      `INSERT INTO "DoctorUnavailability" (${cols}) VALUES (${placeholders}) RETURNING *`,
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
      `UPDATE "DoctorUnavailability" SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      vals
    );
    return res.rows[0];
  },
  async delete(id: string) {
    await query('DELETE FROM "DoctorUnavailability" WHERE id = $1', [id]);
    return true;
  }
  ,
  async findByDoctorId(doctor_id: string) {
    const res = await query('SELECT * FROM "DoctorUnavailability" WHERE doctor_id = $1', [doctor_id]);
    return res.rows;
  }  ,
  async findByDoctorAndDateRange(doctor_id: string, start_date: string, end_date: string) {
    const res = await query('SELECT * FROM "DoctorUnavailability" WHERE doctor_id = $1', [doctor_id]); // simplified for now
    return res.rows;
  }
};
