import { getDb } from '../../config/db.js'

export function createReportModel() {
  return {
    /**
     * Used by PDF / Excel / CSV reports
     * No pagination
     */
    async getTaskReport({ search = '', status, priority }) {
      const db = getDb()

      const conditions = []
      const values = []
      let index = 1

      if (search) {
        conditions.push(`
          (
            t.title ILIKE $${index}
            OR t.description ILIKE $${index}
          )
        `)
        values.push(`%${search}%`)
        index++
      }

      if (status) {
        conditions.push(`t.status = $${index}`)
        values.push(status)
        index++
      }

      if (priority) {
        conditions.push(`t.priority = $${index}`)
        values.push(priority)
        index++
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

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
        ${whereClause}
        ORDER BY t.created_at DESC
      `

      const { rows } = await db.query(query, values)

      return rows
    },

    /**
     * Summary report for dashboard
     */
    async getTaskSummary() {
      const db = getDb()

      const { rows } = await db.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'open')::int AS open,
          COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
          COUNT(*) FILTER (WHERE status = 'done')::int AS done
        FROM tasks
      `)

      return rows[0]
    },
  }
}