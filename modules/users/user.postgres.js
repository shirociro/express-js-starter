import path from 'path'
import fs from 'fs'

export const PostgresUserRepo = {
  // 1. Fetch all users with filters and pagination
  async getUsers(db, { page, limit, search, position }) {
    const start = limit ? (page - 1) * limit : 0
    const params = []
    let paramIndex = 1

    let baseQuery = `
      FROM tbl_users AS u
      JOIN tbl_user_role AS r ON u.role_id = r.id
      JOIN tbl_user_position AS p ON u.position_id = p.id
      WHERE u.status = 'active'
    `

    if (search) {
      baseQuery += ` AND (u.firstname ILIKE $${paramIndex} OR u.lastname ILIKE $${paramIndex + 1} OR u.username ILIKE $${paramIndex + 2})`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
      paramIndex += 3
      page = 1
    }

    if (position && position !== 0) {
      baseQuery += ` AND u.position_id = $${paramIndex}`
      params.push(position)
      paramIndex++
    }

    // Total count
    const countRes = await db.query(`SELECT COUNT(*) AS total ${baseQuery}`, params)
    const total = parseInt(countRes.rows[0]?.total || 0)

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

    if (limit) {
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
      params.push(limit, start)
    }

    const { rows } = await db.query(query, params)
    return { rows, total, page, limit }
  },

  // 2. Patch/Update user including profile file handling
  async patchUser(db, id, updates, file, removeProfile = false) {
    const fields = []
    const values = []
    let idx = 1

    for (const [key, value] of Object.entries(updates)) {
      if (['profile', 'remove_profile'].includes(key) || value == null) continue
      fields.push(`${key} = $${idx++}`)
      values.push(value)
    }

    if (removeProfile) {
      const { rows } = await db.query('SELECT profile FROM tbl_users WHERE id = $1', [id])
      const profile = rows[0]?.profile

      if (profile) {
        const filename = profile.replace(/^\/?uploads\/profile\//, '')
        const filePath = path.join(process.cwd(), 'uploads', 'profile', filename)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      }
      fields.push(`profile = NULL`)
    }

    if (file) {
      fields.push(`profile = $${idx++}`)
      values.push('/uploads/profile/' + file.filename)
    }

    fields.push(`updated_at = NOW()`)
    values.push(id) // For the WHERE clause

    const sql = `UPDATE tbl_users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`
    const { rows } = await db.query(sql, values)

    return rows[0] || null
  },

  // 3. Create new user with dynamic columns
  async createUser(db, userData, file) {
    const columns = []
    const placeholders = []
    const values = []

    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        columns.push(key)
        values.push(value)
        placeholders.push(`$${values.length}`)
      }
    })

    if (file) {
      columns.push('profile')
      values.push('/uploads/profile/' + file.filename)
      placeholders.push(`$${values.length}`)
    }

    const sql = `
      INSERT INTO tbl_users (${columns.join(', ')}) 
      VALUES (${placeholders.join(', ')}) 
      RETURNING id, firstname, lastname, username, role_id, position_id, profile, status
    `
    const { rows } = await db.query(sql, values)
    return rows[0]
  },

  // 4. Soft delete user (set status to inactive)
  async deleteUser(db, id) {
    const sql = `
      UPDATE tbl_users SET status = 'inactive', updated_at = NOW() 
      WHERE id = $1 
      RETURNING id
    `
    const { rowCount } = await db.query(sql, [id])
    if (rowCount === 0) return null

    const { rows } = await db.query(`
      SELECT u.id, u.firstname, u.lastname, u.username, u.role_id,
             r.name AS role, p.name AS position, u.profile, u.status, u.updated_at
      FROM tbl_users u
      LEFT JOIN tbl_user_role r ON u.role_id = r.id
      LEFT JOIN tbl_user_position p ON u.position_id = p.id
      WHERE u.id = $1
    `, [id])
    
    return rows[0]
  }
}