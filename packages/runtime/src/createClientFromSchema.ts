import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { parseIndigoSchema } from './parser'
import { createClient } from './createClient'
import type { DatabaseConfig } from '@adinet/indigodb-core'

export async function createClientFromSchema(schemaPath: string) {
  const fullPath = path.resolve(process.cwd(), schemaPath)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Schema file not found: ${fullPath}`)
  }

  if (fs.existsSync('.env')) {
    dotenv.config()
  }

  const schema = fs.readFileSync(fullPath, 'utf-8')
  const parsed = parseIndigoSchema(schema)
  const db = parsed.datasource

  const url = db.url.startsWith('env(')
    ? process.env[db.url.replace(/^env\("(.+?)"\)$/, '$1')] || ''
    : db.url

  if (!db.provider || !url) {
    throw new Error('Missing provider or url in datasource')
  }

  const config: DatabaseConfig = {
    provider: db.provider as 'postgresql' | 'mongodb',
    url,
    options: db.dbName ? { dbName: db.dbName } : undefined,
    realtime: true,
    debug: true
  }

  return await createClient(config)
}
