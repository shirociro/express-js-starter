import { getDb } from '../../config/dbswitch.js'
import path from 'path'
import fs from 'fs'
export function createUserModel() {
  return {
    async getUsers({ page, limit, search, position }) {
      const pool = getDb()
      const start = limit ? (page - 1) * limit : 0
      const params = []

      let baseQuery = `
        FROM users AS u
        JOIN user_role AS r ON u.role_id = r.id
        JOIN user_position AS p ON u.position_id = p.id
        WHERE u.status='active'
      `

      // Search filter
      if (search) {
        baseQuery += ` AND (u.firstname LIKE ? OR u.lastname LIKE ? OR u.username LIKE ?)`
        params.push(`%${search}%`, `%${search}%`, `%${search}%`)
        page = 1 // reset page if searching
      }

      // Position filter
      if (position && position !== 0) {
        baseQuery += ` AND u.position_id = ?`
        params.push(position)
      }

      const conn = await pool.getConnection()
      try {
        // Total count
        const [countResult] = await conn.execute(`SELECT COUNT(*) AS total ${baseQuery}`, params)
        const total = countResult[0]?.total || 0

        // Main query
        let query = `
          SELECT 
            u.id, u.firstname, u.lastname, u.username,
            r.name AS role, r.id AS role_id,
            p.name AS position, p.id AS position_id,
            u.profile, u.updated_at
          ${baseQuery}
          ORDER BY u.id DESC
        `
        const finalParams = [...params]

        // Pagination
        if (limit) {
          query += ' LIMIT ?, ?'
          finalParams.push(start, limit)
        }

        const [rows] = await conn.execute(query, finalParams)

        return { rows, total, page, limit }
      } finally {
        conn.release()
      }
    },

    async patchUser(id, updates, file, removeProfile = false) {
      const pool = getDb()
      const conn = await pool.getConnection()

      try {
        await conn.beginTransaction()

        const fields = []
        const values = []

        // Normal updates
        for (const [key, value] of Object.entries(updates)) {
          if (['profile', 'remove_profile'].includes(key)) continue
          if (value == null) continue

          fields.push(`${key} = ?`)
          values.push(value)
        }

        // 🔴 REMOVE PROFILE
        if (removeProfile) {
          const profile = await conn.query(
            'SELECT profile FROM users WHERE id = ?',
            [id]
          )
          console.log('Removing profile for user:', id )

          if (profile) {
            // strip "/uploads/profile/" if stored
            const filename = profile.toString().replace(/^\/?uploads\/profile\//, '')

            const filePath = path.join(
              process.cwd(),
              'uploads',
              'profile',
              filename
            )

            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
            }
          }

          fields.push('profile = NULL')
        }

        // 🟢 NEW FILE UPLOAD (overrides delete)
        if (file) {
          fields.push('profile = ?')
          values.push('/uploads/profile/'+file.filename)
        }

        fields.push('updated_at = NOW()')
        values.push(id)

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
        const [result] = await conn.query(sql, values)

        if (!result.affectedRows) {
          await conn.rollback()
          return null
        }

        await conn.commit()

        const [[user]] = await conn.query(
          'SELECT id, firstname, lastname, profile, updated_at FROM users WHERE id = ?',
          [id]
        )

        return user
      } catch (err) {
        await conn.rollback()
        throw err
      } finally {
        conn.release()
      }
    },
    // async createUser(userData, file) {
    //   if (!userData) throw new Error('No user data provided')

    //   const pool = getDb()
    //   const conn = await pool.getConnection()

    //   try {
    //     await conn.beginTransaction()

    //     // Build insert query dynamically
    //     const columns = []
    //     const placeholders = []
    //     const values = []

    //     for (const [key, value] of Object.entries(userData)) {
    //       if (value !== undefined && value !== null) {
    //         columns.push(key)
    //         placeholders.push('?')
    //         values.push(value)
    //       }
    //     }

    //     const sql = `INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`
    //     const [result] = await conn.execute(sql, values)
    //     // Fetch the newly created user
    //     const [rows] = await conn.execute(
    //       'SELECT id, firstname, lastname, username, role_id, position_id, profile, status FROM users WHERE id = ?',
    //       [result.insertId]
    //     )

    //     await conn.commit()
    //     return rows[0] || null
    //   } catch (err) {
    //     await conn.rollback()
    //     throw err
    //   } finally {
    //     conn.release()
    //   }
    // },
    async createUser(userData, file) {
      if (!userData) throw new Error('No user data provided')

      const pool = getDb()
      const conn = await pool.getConnection()

      try {
        await conn.beginTransaction()

        // Build insert query dynamically
        const columns = []
        const placeholders = []
        const values = []

        for (const [key, value] of Object.entries(userData)) {
          if (value !== undefined && value !== null) {
            columns.push(key)
            placeholders.push('?')
            values.push(value)
          }
        }

        // 🟢 NEW FILE UPLOAD
        if (file) {
          columns.push('profile')
          placeholders.push('?')
          values.push('/uploads/profile/' + file.filename)
        }

        const sql = `INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`
        const [result] = await conn.execute(sql, values)

        // Fetch the newly created user
        const [rows] = await conn.execute(
          'SELECT id, firstname, lastname, username, role_id, position_id, profile, status FROM users WHERE id = ?',
          [result.insertId]
        )

        await conn.commit()
        return rows[0] || null
      } catch (err) {
        await conn.rollback()
        throw err
      } finally {
        conn.release()
      }
    },
    async deleteUser(id) {
      if (!id) throw new Error('User ID is required')

      const pool = getDb()
      const conn = await pool.getConnection()
      try {
        const sql = `UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = ?`
        const [result] = await conn.execute(sql, [id])
        if (result.affectedRows === 0) return null

        const [rows] = await conn.execute(
          `SELECT u.id, u.firstname, u.lastname, u.username, u.role_id,
              r.name AS role, p.name AS position, u.profile, u.status, u.updated_at
            FROM users u
            LEFT JOIN user_role r ON u.role_id = r.id
            LEFT JOIN user_position p ON u.position_id = p.id
            WHERE u.id = ?`,
          [id]
        )
        return rows[0] || null
      } finally {
        conn.release()
      }
    },

  
  }
}
