import { getDb } from '../../config/dbswitch.js'
import path from 'path'
import fs from 'fs'

export function createStackModel() {
  return {

    async getStacks({ page = 1, limit = 10, search = '', type = null }) {
      const pool = getDb()
      const start = (page - 1) * limit
      const params = []

      let baseQuery = `
        FROM stacks
        WHERE 1 = 1
      `

      if (search) {
        baseQuery += ` AND (language LIKE ? OR concepts LIKE ?)`
        params.push(`%${search}%`, `%${search}%`)
      }

      if (type !== null) {
        baseQuery += ` AND types = ?`
        params.push(type)
      }

      const conn = await pool.getConnection()
      try {
        const [count] = await conn.execute(
          `SELECT COUNT(*) AS total ${baseQuery}`,
          params
        )

        const total = count[0].total

        const query = `
          SELECT id, language, concepts, logo, types, created_at, updated_at
          ${baseQuery}
          ORDER BY id DESC
          LIMIT ?, ?
        ` 
        console.log(query)

        const [rows] = await conn.execute(
          query,
          [...params, start, limit]
        )

        return { rows, total, page, limit }
      } finally {
        conn.release()
      }
    },

    async createStack(data, file) {
      const pool = getDb()
      const conn = await pool.getConnection()

      try {
        const sql = `
          INSERT INTO stacks (language, concepts, logo, types)
          VALUES (?, ?, ?, ?)
        `
        const [result] = await conn.execute(sql, [
          data.language,
          data.concepts,
          file ? `/uploads/stacks/${file.filename}` : null,
          data.types
        ])

        const [[row]] = await conn.execute(
          `SELECT * FROM stacks WHERE id = ?`,
          [result.insertId]
        )

        return row
      } finally {
        conn.release()
      }
    },

    async patchStack(id, updates, file, removeLogo = false) {
      const pool = getDb()
      const conn = await pool.getConnection()

      try {
        const fields = []
        const values = []

        for (const [key, value] of Object.entries(updates)) {
          if (['language', 'concepts', 'types'].includes(key) && value != null) {
            fields.push(`${key} = ?`)
            values.push(value)
          }
        }

        if (removeLogo) {
          const [[row]] = await conn.execute(
            `SELECT logo FROM stacks WHERE id = ?`,
            [id]
          )

          if (row?.logo) {
            const filename = row.logo.replace(/^\/?uploads\/stacks\//, '')
            const filePath = path.join(
              process.cwd(),
              'uploads',
              'stacks',
              filename
            )

            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
            }
          }

          fields.push(`logo = NULL`)
        }

        // 🟢 NEW LOGO UPLOAD (overrides remove)
        if (file) {
          fields.push(`logo = ?`)
          values.push(`/uploads/stacks/${file.filename}`)
        }

        if (!fields.length) return null

        fields.push(`updated_at = NOW()`)
        values.push(id)

        const sql = `
          UPDATE stacks
          SET ${fields.join(', ')}
          WHERE id = ?
        `

        const [result] = await conn.execute(sql, values)
        if (!result.affectedRows) return null

        const [[updated]] = await conn.execute(
          `SELECT * FROM stacks WHERE id = ?`,
          [id]
        )

        return updated
      } finally {
        conn.release()
      }
    },

    async deleteStack(id) {
      const pool = getDb()
      const conn = await pool.getConnection()

      try {
        const [[row]] = await conn.execute(
          `SELECT logo FROM stacks WHERE id = ?`,
          [id]
        )

        if (row?.logo) {
          const filename = row.logo.replace(/^\/?uploads\/stacks\//, '')
          const filePath = path.join(
            process.cwd(),
            'uploads',
            'stacks',
            filename
          )

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
        }

        const [result] = await conn.execute(
          `DELETE FROM stacks WHERE id = ?`,
          [id]
        )

        return result.affectedRows > 0
      } finally {
        conn.release()
      }
    }

  }
}
