import fs from 'fs'
import path from 'path'
import type { Db } from 'mongodb'
import type { MigrationAdapter } from './types'
import { MongoMigrationAdapter } from './mongo.adapter'
import { PostgresMigrationAdapter } from './postgres.adapter'

const MIGRATION_FILE = path.resolve(process.cwd(), 'src/db/migrations/indigodb.migrations.json')

export function getMigrationAdapter(provider: string, client: any): MigrationAdapter {
  switch (provider) {
    case 'mongodb':
      if (!client.mongo?.db) throw new Error('MongoDB client missing .mongo.db')
      return new MongoMigrationAdapter(client.mongo.db as Db)
    case 'postgresql':
      return new PostgresMigrationAdapter(client)
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}


export function loadMigrationHistory(): Record<string, string[]> {
  if (!fs.existsSync(MIGRATION_FILE)) return { createdTables: [], createdCollections: [] }
  return JSON.parse(fs.readFileSync(MIGRATION_FILE, 'utf-8'))
}

export function saveMigrationHistory(history: Record<string, string[]>) {
  fs.mkdirSync(path.dirname(MIGRATION_FILE), { recursive: true })
  fs.writeFileSync(MIGRATION_FILE, JSON.stringify(history, null, 2))
}

