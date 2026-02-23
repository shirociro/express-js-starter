import { getDb } from '../../config/db.js'

export function createKnowledgebaseModel() {
  return {
    async getKnowledgebase({ page = 1, limit = 10, search = '', offset = 0 }) {
      const db = getDb()

      const { rows } = await db.query(
        `SELECT id, title, description, created_at, updated_at
         FROM knowledgebase
         WHERE title ILIKE $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [`%${search}%`, limit, offset]
      )

      return rows
    },

    async countKnowledgebase({ search = '' }) {
      const db = getDb()

      const { rows } = await db.query(
        `SELECT COUNT(*)::int AS total
         FROM knowledgebase
         WHERE title ILIKE $1`,
        [`%${search}%`]
      )

      return rows[0].total
    },

    async createKnowledgebase({ title, description }) {
      const db = getDb()

      const { rows } = await db.query(
        `INSERT INTO knowledgebase (title, description, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id, title, description, created_at, updated_at`,
        [title, description]
      )

      return rows[0]
    },

    async getKnowledgebaseById(id) {
      const db = getDb()

      const { rows } = await db.query(
        `SELECT id, title, description, created_at, updated_at
         FROM knowledgebase
         WHERE id = $1`,
        [id]
      )

      return rows[0] || null
    },

    async patchKnowledgebase(id, updates) {
      const db = getDb()

      const keys = Object.keys(updates)
      if (!keys.length) return null

      // Build dynamic SET clause safely
      const setClause = keys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ')

      const values = keys.map(key => updates[key])

      const { rows } = await db.query(
        `UPDATE knowledgebase
         SET ${setClause}, updated_at = NOW()
         WHERE id = $${keys.length + 1}
         RETURNING id, title, description, created_at, updated_at`,
        [...values, id]
      )

      return rows[0] || null
    },

    async deleteKnowledgebase(id) {
      const db = getDb()

      const result = await db.query(
        `DELETE FROM knowledgebase WHERE id = $1`,
        [id]
      )

      return result.rowCount > 0
    },
  }
}