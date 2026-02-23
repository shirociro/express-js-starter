// import { getDb } from '../../config/db.js'

// // Fetch user by username
// export async function findByUsername(username) {
//   const db = getDb()
//   const [rows] = await db.execute('SELECT * FROM users WHERE username = ? LIMIT 1', [username])
//   return rows[0] || null
// }

// // Fetch user by ID
// export async function findById(id) {
//   const db = getDb()
//   const [rows] = await db.execute(
//     'SELECT id, firstname, lastname, username, role_id, position, profile, created_at FROM users WHERE id = ?',
//     [id]
//   )
//   return rows[0] || null
// }

// // Insert new user
// export async function insertUser({ username, hashedPassword, firstname, lastname }) {
//   const db = getDb()
//   const [result] = await db.execute(
//     `INSERT INTO users (username, password, firstname, lastname, created_at)
//      VALUES (?, ?, ?, ?, NOW())`,
//     [username, hashedPassword, firstname, lastname]
//   )
//   return result.insertId
// }

// // Save refresh token
// export async function insertRefreshToken(userId, token, expiresAt) {
//   const db = getDb()
//   await db.execute('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [
//     userId,
//     token,
//     expiresAt,
//   ])
// }

// // Find refresh token
// export async function findRefreshToken(token) {
//   const db = getDb()
//   const [rows] = await db.execute('SELECT * FROM refresh_tokens WHERE token = ?', [token])
//   return rows[0] || null
// }

// // Log user action
// export async function logAction(userId, action) {
//   const db = getDb()
//   await db.execute('INSERT INTO logs (user_id, action, created_at) VALUES (?, ?, NOW())', [
//     userId,
//     action,
//   ])
// }

// // Fetch all users (for listUsers)
// export async function getAllUsers() {
//   const db = getDb()
//   const [rows] = await db.execute(
//     'SELECT id, firstname, lastname, username, role_id, position, profile, created_at FROM users'
//   )
//   return rows
// }

import { getDb } from '../../config/db.js'

// Fetch user by username
export async function findByUsername(username) {
  if (!username) return null
  const db = getDb()
  const conn = await db.getConnection()
  try {
    const safeUsername = conn.escape(username)
    const [rows] = await conn.query(`SELECT * FROM users WHERE username = ${safeUsername} LIMIT 1`)
    return rows[0] || null
  } finally {
    conn.release()
  }
}

// Fetch user by ID
export async function findById(id) {
  if (!id) return null
  const db = getDb()
  const conn = await db.getConnection()
  try {
    const safeId = conn.escape(id)
    const [rows] = await conn.query(
      `SELECT id, firstname, lastname, username, role_id, position, profile, created_at 
       FROM users 
       WHERE id = ${safeId}`
    )
    return rows[0] || null
  } finally {
    conn.release()
  }
}

// Insert new user
export async function insertUser({ username, hashedPassword, firstname, lastname }) {
  const db = getDb()
  const conn = await db.getConnection()
  try {
    const safeUsername = conn.escape(username)
    const safePassword = conn.escape(hashedPassword)
    const safeFirstname = conn.escape(firstname)
    const safeLastname = conn.escape(lastname)
    const [result] = await conn.query(
      `INSERT INTO users (username, password, firstname, lastname, created_at)
       VALUES (${safeUsername}, ${safePassword}, ${safeFirstname}, ${safeLastname}, NOW())`
    )
    return result.insertId
  } finally {
    conn.release()
  }
}

// Save refresh token
export async function insertRefreshToken(userId, token, expiresAt) {
  const db = getDb()
  const conn = await db.getConnection()
  try {
    const safeUserId = conn.escape(userId)
    const safeToken = conn.escape(token)
    const safeExpires = conn.escape(expiresAt)
    await conn.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) 
       VALUES (${safeUserId}, ${safeToken}, ${safeExpires})`
    )
  } finally {
    conn.release()
  }
}

// Find refresh token
export async function findRefreshToken(token) {
  if (!token) return null
  const db = getDb()
  const conn = await db.getConnection()
  try {
    const safeToken = conn.escape(token)
    const [rows] = await conn.query(`SELECT * FROM refresh_tokens WHERE token = ${safeToken}`)
    return rows[0] || null
  } finally {
    conn.release()
  }
}

// Log user action
export async function logAction(userId, action) {
  const db = getDb()
  const conn = await db.getConnection()
  try {
    const safeUserId = conn.escape(userId)
    const safeAction = conn.escape(action)
    await conn.query(
      `INSERT INTO logs (user_id, action, created_at) VALUES (${safeUserId}, ${safeAction}, NOW())`
    )
  } finally {
    conn.release()
  }
}

// Fetch all users (for listUsers)
export async function getAllUsers() {
  const db = getDb()
  const conn = await db.getConnection()
  try {
    const [rows] = await conn.query(
      `SELECT id, firstname, lastname, username, role_id, position, profile, created_at FROM users`
    )
    return rows
  } finally {
    conn.release()
  }
}
