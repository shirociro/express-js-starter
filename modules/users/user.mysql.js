import { getDb } from '../../config/dbswitch.js'
export const MySQLUserRepo = {
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

  async patchUser(id, updates) {
    if (!id || !updates || Object.keys(updates).length === 0) {
      throw new Error('No fields provided for update')
    }

    const pool = getDb()
    const conn = await pool.getConnection()

    try {
      console.log('PATCH START:', id, updates)

      // Start transaction
      await conn.beginTransaction()

      // Build dynamic SET clause
      const fields = []
      const values = []
      for (const [key, value] of Object.entries(updates)) {
        fields.push(`${key} = ?`)
        values.push(value)
      }
      fields.push('updated_at = NOW()')
      values.push(id)

      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
      console.log('Executing SQL:', sql)
      console.log('Values:', values)

      const [result] = await conn.query(sql, values)
      console.log('Update result:', result)

      if (result.affectedRows === 0) {
        console.log('No rows updated, rolling back')
        await conn.rollback()
        return null
      }

      // Select updated user using the same connection
      const [rows] = await conn.query(
        'SELECT id, firstname, lastname, username, role_id, position_id, profile, status, updated_at FROM users WHERE id = ?',
        [id]
      )
      console.log('Selected rows:', rows)

      // Commit transaction
      await conn.commit()
      console.log('PATCH END')
      return rows[0] || null
    } catch (err) {
      console.error('PATCH ERROR:', err)
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

  async createUser(userData) {
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
}
