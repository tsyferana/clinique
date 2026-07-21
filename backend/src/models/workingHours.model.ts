import { query, pool } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const workingHoursModel = {
  async findAll() {
    const res = await query('SELECT * FROM "DoctorWorkingHours"');
    return res.rows;
  },
  async findById(id: string) {
    const res = await query('SELECT * FROM "DoctorWorkingHours" WHERE id = $1', [id]);
    return res.rows[0];
  },
  async create(data: any) {
    const id = data.id || uuidv4();
    const keys = Object.keys(data).filter(k => k !== 'id');
    const cols = ['id', ...keys].map(k => `"${k}"`).join(', ');
    const vals = [id, ...keys.map(k => data[k])];
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
    
    const res = await query(
      `INSERT INTO "DoctorWorkingHours" (${cols}) VALUES (${placeholders}) RETURNING *`,
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
      `UPDATE "DoctorWorkingHours" SET ${setClause} WHERE id = $1 RETURNING *`,
      vals
    );
    return res.rows[0];
  },
  async delete(id: string) {
    await query('DELETE FROM "DoctorWorkingHours" WHERE id = $1', [id]);
    return true;
  }
  ,
  async findByDoctorId(doctor_id: string) {
    const res = await query('SELECT * FROM "DoctorWorkingHours" WHERE doctor_id = $1', [doctor_id]);
    return res.rows;
  }  ,
  async upsertDoctorHours(doctor_id: string, day_of_week: number, data: any) {
    const exist = await query('SELECT * FROM "DoctorWorkingHours" WHERE doctor_id = $1 AND day_of_week = $2', [doctor_id, day_of_week]);
    if (exist.rows.length > 0) {
      return this.update(exist.rows[0].id, data);
    } else {
      return this.create({ doctor_id, day_of_week, ...data });
    }
  }  ,
  async findByDoctorAndDay(doctor_id: string, day_of_week: number) {
    const res = await query('SELECT * FROM "DoctorWorkingHours" WHERE doctor_id = $1 AND day_of_week = $2', [doctor_id, day_of_week]);
    return res.rows[0];
  }
};
