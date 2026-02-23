import { getDb } from '../config/db.js'

export const MetaModel = {
  getPositions: async () => {
    const db = getDb()

    const { rows } = await db.query(
      'SELECT * FROM user_position ORDER BY name ASC'
    )

    return rows
  },

  getRoles: async () => {
    const db = getDb()

    const { rows } = await db.query(
      'SELECT * FROM user_role ORDER BY name ASC'
    )

    return rows
  },

  getUsers: async () => {
    const db = getDb()

    const { rows } = await db.query(
      'SELECT * FROM users ORDER BY firstname ASC'
    )

    return rows
  },
}