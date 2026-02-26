import { getDb } from '../../config/dbswitch.js'
import { MongoUserRepo } from './user.mongo.js'
import { MySQLUserRepo } from './user.mysql.js'

import { PostgresUserRepo } from './user.postgres.js'

const DB_TYPE = process.env.DB_TYPE || 'mysql'
const Repo = DB_TYPE === 'mongo' ? MongoUserRepo : DB_TYPE === 'postgres' ? PostgresUserRepo : MySQLUserRepo

const userModel = {
  // Users
  getUsers: options => Repo.getUsers(getDb(), options),

  getAllUsers: () => Repo.getAllUsers(getDb()),

  findByUsername: username => Repo.findByUsername(getDb(), username),

  findById: id => Repo.findById(getDb(), id),

  insertUser: userData =>
    Repo.createUser
      ? Repo.createUser(getDb(), userData) // Mongo-style / MySQL-style create
      : Repo.insertUser(getDb(), userData), // fallback if MySQL uses insertUser

  patchUser: (id, updates) => Repo.patchUser(getDb(), id, updates),

  deleteUser: id => Repo.deleteUser(getDb(), id),

  // Refresh tokens
  findRefreshToken: token =>
    Repo.findRefreshToken ? Repo.findRefreshToken(getDb(), token) : undefined, // in case MySQL repo does not have it

  insertRefreshToken: (userId, token, expiresAt) =>
    Repo.insertRefreshToken(getDb(), userId, token, expiresAt),

  // Logs
  logAction: (userId, action) => Repo.logAction(getDb(), userId, action),
}

export default userModel
