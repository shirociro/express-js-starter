import { ObjectId } from 'mongodb'

// Private helper to map _id to id
const mapId = doc => {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: _id.toString(), ...rest }
}

export const MongoUserRepo = {
  /**
   * Get paginated users with optional search and position filter
   */
  async getUsers(db, { page = 1, limit = 10, search, position }) {
    const filter = {
      // status: 'active'
    }

    if (search) {
      filter.$or = [
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ]
      page = 1 // reset page if searching
    }

    if (position) {
      filter.position_id = position
    }

    const total = await db.collection('users').countDocuments(filter)

    let cursor = db.collection('users').find(filter).sort({ _id: -1 })

    if (limit) {
      cursor = cursor.skip((page - 1) * limit).limit(limit)
    }
    const users = await cursor.toArray()
    console.log(users)

    return { rows: users.map(mapId), total, page, limit }
  },

  /**
   * Create a new user
   */
  async createUser(db, userData) {
    if (!userData) throw new Error('No user data provided')

    const now = new Date()
    const doc = {
      ...userData,
      status: 'active',
      created_at: now,
      updated_at: now,
    }

    const result = await db.collection('users').insertOne(doc)
    const user = await db.collection('users').findOne({ _id: result.insertedId })
    return mapId(user)
  },

  /**
   * Update a user by id
   */
  async patchUser(db, id, updates) {
    if (!id || !updates || Object.keys(updates).length === 0) {
      throw new Error('No fields provided for update')
    }

    const now = new Date()
    const result = await db
      .collection('users')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updated_at: now } },
        { returnDocument: 'after' }
      )

    return mapId(result.value)
  },

  /**
   * Soft-delete a user
   */
  async deleteUser(db, id) {
    const now = new Date()
    const result = await db
      .collection('users')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status: 'inactive', updated_at: now } },
        { returnDocument: 'after' }
      )

    return mapId(result.value)
  },

  /**
   * Find by username
   */
  async findByUsername(db, username) {
    const user = await db.collection('users').findOne({ username })
    return mapId(user)
  },

  /**
   * Find by id
   */
  async findById(db, id) {
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) })
    return mapId(user)
  },

  /**
   * Insert refresh token
   */
  async insertRefreshToken(db, userId, token, expiresAt) {
    await db.collection('refresh_tokens').insertOne({
      user_id: new ObjectId(userId),
      token,
      expires_at: expiresAt,
      created_at: new Date(),
    })
  },

  /**
   * Log user action
   */
  async logAction(db, userId, action) {
    await db.collection('logs').insertOne({
      user_id: new ObjectId(userId),
      action,
      created_at: new Date(),
    })
  },

  /**
   * Get all users
   */
  async getAllUsers(db) {
    const users = await db.collection('users').find({}).toArray()
    return users.map(mapId)
  },
}
