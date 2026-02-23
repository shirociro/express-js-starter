import { getDb } from '../../config/db.js'

export function createKnowledgebaseModel() {
  return {
    async getKnowledgebase({ page = 1, limit = 10, search = '', offset = 0 }) {
      const db = getDb()
      const [rows] = await db.execute(
        `SELECT id, title, description, created_at, updated_at
         FROM knowledgebase
         WHERE title LIKE ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [`%${search}%`, limit, offset]
      )
      return rows
    },

    async countKnowledgebase({ search = '' }) {
      const db = getDb()
      const [[{ total }]] = await db.execute(
        `SELECT COUNT(*) AS total
         FROM knowledgebase
         WHERE title LIKE ?`,
        [`%${search}%`]
      )
      return total
    },

    async createKnowledgebase({ title, description }) {
      const db = getDb()
      const [result] = await db.execute(
        `INSERT INTO knowledgebase (title, description, created_at, updated_at)
         VALUES (?, ?, NOW(), NOW())`,
        [title, description]
      )
      return result
    },

    async getKnowledgebaseById(id) {
      const db = getDb()
      const [rows] = await db.execute(
        `SELECT id, title, description, created_at, updated_at
         FROM knowledgebase
         WHERE id = ?`,
        [id]
      )
      return rows[0]
    },

    async patchKnowledgebase(id, updates) {
      const db = getDb()
      const keys = Object.keys(updates)
      if (!keys.length) return null

      const setClause = keys.map(k => `\`${k}\` = ?`).join(', ')
      const values = keys.map(k => updates[k])
      values.push(id)

      const [result] = await db.execute(
        `UPDATE knowledgebase SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        values
      )
      return result
    },

    async deleteKnowledgebase(id) {
      const db = getDb()
      const [result] = await db.execute(`DELETE FROM knowledgebase WHERE id = ?`, [id])
      return result.affectedRows > 0
    },
  }
}
