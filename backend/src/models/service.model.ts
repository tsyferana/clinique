import { query, pool } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export const serviceModel = {
  async findAll() {
    const res = await query('SELECT * FROM "MedicalService"');
    return res.rows;
  },
  async findById(id: string) {
    const res = await query('SELECT * FROM "MedicalService" WHERE id = $1', [id]);
    return res.rows[0];
  },
  async create(data: any) {
    const id = data.id || uuidv4();
    const res = await query(
      `INSERT INTO "MedicalService" (
        id, name, description, duration_minutes, price, is_active, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW(), NOW()
      ) RETURNING *`,
      [
        id,
        data.name,
        data.description,
        data.duration_minutes || 30,
        data.price || 50,
        data.is_active !== undefined ? data.is_active : true
      ]
    );
    return res.rows[0];
  },
  async update(id: string, data: any) {
    // Filtrer les valeurs undefined
    const cleanData = Object.entries(data).reduce((acc: any, [k, v]) => {
      if (v !== undefined) acc[k] = v;
      return acc;
    }, {});

    const keys = Object.keys(cleanData);
    if (keys.length === 0) return this.findById(id);
    
    const setClause = keys.map((k, i) => `"${k}" = $${i + 2}`).join(', ');
    const vals = [id, ...keys.map(k => cleanData[k])];
    
    const res = await query(
      `UPDATE "MedicalService" SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      vals
    );
    return res.rows[0];
  },
  async delete(id: string) {
    await query('DELETE FROM "MedicalService" WHERE id = $1', [id]);
    return true;
  }

};
