import { getDb } from '../../config/db.js'

export function createReportModel() {
  return {
    /**
     * Used by PDF / Excel / CSV reports
     * No pagination (reports usually want full dataset)
     */
    async getTaskReport({ search = '', status, priority }) {
      const pool = getDb()
      const conn = await pool.getConnection()

      try {
        let where = 'WHERE 1=1'

        if (search) {
          const safeSearch = conn.escape(`%${search}%`)
          where += `
            AND (
              t.title LIKE ${safeSearch}
              OR t.description LIKE ${safeSearch}
            )
          `
        }

        if (status) {
          where += ` AND t.status = ${conn.escape(status)}`
        }

        if (priority) {
          where += ` AND t.priority = ${conn.escape(priority)}`
        }

        const query = `
          SELECT
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
          FROM tasks t
          LEFT JOIN users u ON t.user_id = u.id
          ${where}
          ORDER BY t.created_at DESC
        `

        const [rows] = await conn.query(query)
        return rows
      } finally {
        conn.release()
      }
    },

    /**
     * Optional summary report (nice for dashboards / headers)
     */
    async getTaskSummary() {
      const db = getDb()

      const [rows] = await db.execute(`
        SELECT
          COUNT(*) AS total,
          SUM(status = 'open') AS open,
          SUM(status = 'in_progress') AS in_progress,
          SUM(status = 'done') AS done
        FROM tasks
      `)

      return rows[0]
    },
  }
}
