import { getDb } from '../../config/dbswitch.js'
import path from 'path'
import fs from 'fs'

export function createStackModel() {
  return {

    async getStacks({ page = 1, limit = 10, search = '', type = null }) {
      const db = getDb()
      const offset = (page - 1) * limit

      const conditions = []
      const values = []
      let index = 1

      if (search) {
        conditions.push(`(language ILIKE $${index} OR concepts ILIKE $${index})`)
        values.push(`%${search}%`)
        index++
      }

      if (type !== null) {
        conditions.push(`types = $${index}`)
        values.push(type)
        index++
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Count
      const countQuery = `
        SELECT COUNT(*)::int AS total
        FROM stacks
        ${whereClause}
      `
      const { rows: countRows } = await db.query(countQuery, values)
      const total = countRows[0].total

      // Data
      const dataQuery = `
        SELECT id, language, concepts, logo, types, created_at, updated_at
        FROM stacks
        ${whereClause}
        ORDER BY id DESC
        LIMIT $${index} OFFSET $${index + 1}
      `

      const { rows } = await db.query(
        dataQuery,
        [...values, limit, offset]
      )

      return { rows, total, page, limit }
    },

    async createStack(data, file) {
      const db = getDb()

      const { rows } = await db.query(
        `
        INSERT INTO stacks (language, concepts, logo, types)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
          data.language,
          data.concepts,
          file ? `/uploads/stacks/${file.filename}` : null,
          data.types
        ]
      )

      return rows[0]
    },

    async patchStack(id, updates, file, removeLogo = false) {
      const db = getDb()

      const fields = []
      const values = []
      let index = 1

      // Allowed fields whitelist (important)
      for (const [key, value] of Object.entries(updates)) {
        if (['language', 'concepts', 'types'].includes(key) && value != null) {
          fields.push(`${key} = $${index}`)
          values.push(value)
          index++
        }
      }

      // Remove logo
      if (removeLogo) {
        const { rows } = await db.query(
          `SELECT logo FROM stacks WHERE id = $1`,
          [id]
        )

        const row = rows[0]

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

      // New logo upload overrides
      if (file) {
        fields.push(`logo = $${index}`)
        values.push(`/uploads/stacks/${file.filename}`)
        index++
      }

      if (!fields.length) return null

      fields.push(`updated_at = NOW()`)

      const updateQuery = `
        UPDATE stacks
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
      `

      const { rows } = await db.query(updateQuery, [...values, id])

      return rows[0] || null
    },

    async deleteStack(id) {
      const db = getDb()

      const { rows } = await db.query(
        `SELECT logo FROM stacks WHERE id = $1`,
        [id]
      )

      const row = rows[0]

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

      const result = await db.query(
        `DELETE FROM stacks WHERE id = $1`,
        [id]
      )

      return result.rowCount > 0
    }
  }
}