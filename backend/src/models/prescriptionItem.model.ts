import { query, pool } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const prescriptionItemModel = {
  async findAll() {
    const res = await query('SELECT * FROM "PrescriptionItem"');
    return res.rows;
  },
  async findById(id: string) {
    const res = await query('SELECT * FROM "PrescriptionItem" WHERE id = $1', [id]);
    return res.rows[0];
  },
  async create(data: any) {
    const id = data.id || uuidv4();
    const keys = Object.keys(data).filter(k => k !== 'id');
    const cols = ['id', ...keys].map(k => `"${k}"`).join(', ');
    const vals = [id, ...keys.map(k => data[k])];
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
    
    const res = await query(
      `INSERT INTO "PrescriptionItem" (${cols}) VALUES (${placeholders}) RETURNING *`,
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
      `UPDATE "PrescriptionItem" SET ${setClause} WHERE id = $1 RETURNING *`,
      vals
    );
    return res.rows[0];
  },
  async delete(id: string) {
    await query('DELETE FROM "PrescriptionItem" WHERE id = $1', [id]);
    return true;
  }

,
  async createMany(items: any[]) {
    // simplified: just create one by one
    const res = [];
    for (const item of items) {
      res.push(await this.create(item));
    }
    return res;
  }
,
  async findByPrescriptionId(prescription_id: string) {
    const res = await query('SELECT * FROM "PrescriptionItem" WHERE prescription_id = $1', [prescription_id]);
    return res.rows;
  }
};
