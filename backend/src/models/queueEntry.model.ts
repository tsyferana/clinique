import { query, pool } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const queueEntryModel = {
  async findAll() {
    const res = await query('SELECT * FROM "QueueEntry"');
    return res.rows;
  },
  async findById(id: string) {
    const res = await query('SELECT * FROM "QueueEntry" WHERE id = $1', [id]);
    return res.rows[0];
  },
  async create(data: any) {
    const id = data.id || uuidv4();
    const keys = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at');
    const cols = ['id', ...keys, 'created_at', 'updated_at'].map(k => `"${k}"`).join(', ');
    const vals = [id, ...keys.map(k => data[k])];
    const placeholders = [...vals.map((_, i) => `$${i + 1}`), 'NOW()', 'NOW()'].join(', ');
    
    const res = await query(
      `INSERT INTO "QueueEntry" (${cols}) VALUES (${placeholders}) RETURNING *`,
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
      `UPDATE "QueueEntry" SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      vals
    );
    return res.rows[0];
  },
  async delete(id: string) {
    await query('DELETE FROM "QueueEntry" WHERE id = $1', [id]);
    return true;
  }

,
  async findTodayEntries() {
    const res = await query('SELECT * FROM "QueueEntry" WHERE DATE(created_at) = CURRENT_DATE');
    return res.rows;
  }
,
  async findByAppointmentId(appointment_id: string) {
    const res = await query('SELECT * FROM "QueueEntry" WHERE appointment_id = $1', [appointment_id]);
    return res.rows[0];
  }
};
