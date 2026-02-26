import { getDb } from '../../config/db.js'

export function createTaskModel() {
  return {
    async getTasks({ page = 1, limit = 10, search = '' }) {
      const pool = getDb()

      page = Number(page) || 1
      limit = Number(limit) || 10
      const offset = (page - 1) * limit

      const conn = await pool.getConnection()
      try {
        let where = 'WHERE 1=1'

        if (search) {
          const safeSearch = conn.escape(`%${search}%`)
          where += ` AND (t.title LIKE ${safeSearch} OR t.description LIKE ${safeSearch})`
        }

        const baseQuery = `
      FROM tbl_tasks t
      LEFT JOIN tbl_users u ON t.user_id = u.id
      ${where}
    `

        // 1️⃣ COUNT
        const [countRows] = await conn.query(`SELECT COUNT(*) AS total ${baseQuery}`)
        const total = countRows[0]?.total || 0

        // 2️⃣ DATA
        const [rows] = await conn.query(`
      SELECT 
        t.id, t.user_id, u.firstname, u.lastname,
        t.title, t.description, t.status, t.priority,
        t.created_at, t.updated_at
      ${baseQuery}
      ORDER BY t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `)

        return { rows, total }
      } finally {
        conn.release()
      }
    },
    async countTasks({ search = '' }) {
      const pool = getDb()
      const conn = await pool.getConnection()

      try {
        let where = 'WHERE 1=1'

        if (search) {
          const safeSearch = conn.escape(`%${search}%`)
          where += ` AND (t.title LIKE ${safeSearch} OR t.description LIKE ${safeSearch})`
        }

        const [rows] = await conn.query(`
      SELECT COUNT(*) AS total
      FROM tbl_tasks t
      ${where}
    `)

        return rows[0]?.total || 0
      } finally {
        conn.release()
      }
    },
    async createTask({ title, description, priority, status, user_id }) {
      const db = getDb()
      const [result] = await db.execute(
        `INSERT INTO tasks
          (title, description, priority, status, created_at, user_id)
         VALUES (?, ?, ?, ?, NOW(), ?)`,
        [title, description, priority, status, user_id || null]
      )
      return result
    },

    async createNotification(user_id, title) {
      const db = getDb()
      await db.execute(
        `INSERT INTO notifications (user_id, message, is_read)
         VALUES (?, ?, 0)`,
        [user_id, `Task:${title} assigned to you`]
      )
    },

    async patchTask(id, updates) {
      if (!id) throw new Error('Task ID is required')

      const keys = Object.keys(updates)
      if (!keys.length) return null // nothing to update

      const db = getDb()
      const conn = await db.getConnection()

      try {
        // Build SET clause dynamically with escaped values
        const setClause = keys.map(k => `\`${k}\` = ${conn.escape(updates[k])}`).join(', ')

        const query = `
      UPDATE tasks
      SET ${setClause}, updated_at = NOW()
      WHERE id = ${conn.escape(id)}
    `

        const [result] = await conn.query(query)
        return result
      } finally {
        conn.release()
      }
    },
    async getTaskById(id) {
      const db = getDb()
      const [rows] = await db.execute(
        `SELECT 
          t.id,
          t.user_id,
          u.firstname,
          u.lastname,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.created_at,
          t.updated_at
         FROM tbl_tasks t
         LEFT JOIN tbl_users u ON t.user_id = u.id
         WHERE t.id = ?`,
        [id]
      )
      return rows[0]
    },

    async deleteTask(id) {
      if (!id) throw new Error('Task ID is required')

      const db = getDb()
      const conn = await db.getConnection()
      try {
        // Escape the id to avoid injection
        const safeId = conn.escape(id)
        const [result] = await conn.query(`DELETE FROM tbl_tasks WHERE id = ${safeId}`)

        return result.affectedRows > 0
      } finally {
        conn.release()
      }
    },
  }
}
