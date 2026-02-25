import mysql from 'mysql2/promise'
import { MongoClient } from 'mongodb'
import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

let dbInstance = null
const DB_TYPE = process.env.DB_TYPE || 'mysql'

export async function initDb() {
  if (dbInstance) return dbInstance

  try {
    if (DB_TYPE === 'mongo') {
      // =========================
      // MongoDB
      // =========================
      const client = new MongoClient(process.env.MONGO_URI)
      await client.connect()
      dbInstance = client.db(process.env.DB_NAME)
      console.log('🍃 MongoDB connected')
    }

    else if (DB_TYPE === 'postgres') {
      // =========================
      // PostgreSQL
      // =========================
      dbInstance = new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        max: parseInt(process.env.DB_CONN_LIMIT, 10) || 10,
        ssl: {
          rejectUnauthorized: false, // required for most cloud providers
        },
      })

      // Test connection
      await dbInstance.query('SELECT 1')
      console.log('🐘 PostgreSQL pool initialized')
    }

    else {
      // =========================
      // MySQL
      // =========================
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