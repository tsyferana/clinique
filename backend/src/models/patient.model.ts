import { query, pool } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const patientModel = {
  async findAll() {
    const res = await query('SELECT * FROM "ProfilePatient"');
    return res.rows;
  },
  async findById(id: string) {
    const res = await query('SELECT * FROM "ProfilePatient" WHERE id = $1', [id]);
    return res.rows[0];
  },
  async create(data: any) {
    const id = data.id || uuidv4();
    const keys = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at');
    const cols = ['id', ...keys, 'created_at', 'updated_at'].map(k => `"${k}"`).join(', ');
    const vals = [id, ...keys.map(k => data[k])];
    const placeholders = [...vals.map((_, i) => `$${i + 1}`), 'NOW()', 'NOW()'].join(', ');
    
    const res = await query(
      `INSERT INTO "ProfilePatient" (${cols}) VALUES (${placeholders}) RETURNING *`,
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
      `UPDATE "ProfilePatient" SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      vals
    );
    return res.rows[0];
  },
  async delete(id: string) {
    await query('DELETE FROM "ProfilePatient" WHERE id = $1', [id]);
    return true;
  }
  ,
  async findByUserId(user_id: string) {
    const res = await query('SELECT * FROM "ProfilePatient" WHERE user_id = $1', [user_id]);
    return res.rows[0];
  }
,
  async search(queryStr: string) {
    const res = await query('SELECT p.* FROM "ProfilePatient" p JOIN "User" u ON p.user_id = u.id WHERE u.first_name ILIKE $1 OR u.last_name ILIKE $1', [`%${queryStr}%`]);
    return res.rows;
  }
};
