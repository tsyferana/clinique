import { query, pool } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const userModel = {
  async findAll() {
    const res = await query('SELECT * FROM "User"');
    return res.rows;
  },
  async findById(id: string) {
    const res = await query('SELECT * FROM "User" WHERE id = $1', [id]);
    return res.rows[0];
  },
  async create(data: any) {
    const id = data.id || uuidv4();
    const keys = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at');
    const cols = ['id', ...keys, 'created_at', 'updated_at'].map(k => `"${k}"`).join(', ');
    const vals = [id, ...keys.map(k => data[k])];
    const placeholders = [...vals.map((_, i) => `$${i + 1}`), 'NOW()', 'NOW()'].join(', ');
    
    const res = await query(
      `INSERT INTO "User" (${cols}) VALUES (${placeholders}) RETURNING *`,
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
      `UPDATE "User" SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      vals
    );
    return res.rows[0];
  },
  async delete(id: string) {
    await query('DELETE FROM "User" WHERE id = $1', [id]);
    return true;
  }
  ,
  async findByEmail(email: string) {
    const res = await query('SELECT * FROM "User" WHERE email = $1', [email]);
    return res.rows[0];
  }
,
  async findByFilters(filters: any) {
    // simplified filter, return all for now or implement generic filter
    const res = await query('SELECT * FROM "User"');
    return res.rows;
  }
,
  async search(queryStr: string) {
    const res = await query('SELECT * FROM "User" WHERE first_name ILIKE $1 OR last_name ILIKE $1', [`%${queryStr}%`]);
    return res.rows;
  }
};
