import mysql from 'mysql2/promise' // Note: using /promise directly is cleaner
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

let dbInstance = null
const DB_TYPE = process.env.DB_TYPE || 'mysql'

export async function initDb() {
  if (dbInstance) return dbInstance

  try {
    if (DB_TYPE === 'mongo') {
      // MongoDB Initialization
      const client = new MongoClient(process.env.MONGO_URI)
      await client.connect()
      dbInstance = client.db(process.env.DB_NAME)
      console.log('🍃 MongoDB connected')
    } else {
      // MySQL Initialization
      dbInstance = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        waitForConnections: true,
        connectionLimit: parseInt(process.env.DB_CONN_LIMIT, 10) || 10,
        queueLimit: 0,
      })

      // Test MySQL connection
      await dbInstance.query('SELECT 1')
      console.log('🐬 MySQL pool initialized')
    }
    return dbInstance
  } catch (err) {
    console.error(`${DB_TYPE.toUpperCase()} initialization failed:`, err)
    throw err
  }
}

export function getDb() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDb() first.')
  }
  return dbInstance
}
