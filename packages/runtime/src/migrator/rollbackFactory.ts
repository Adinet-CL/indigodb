import type { MigrationEntry, RollbackAdapter } from './types'
import { MongoRollbackAdapter } from './mongo.adapter'
import { PostgresRollbackAdapter } from './postgres.adapter'

export function getRollbackAdapter(provider: string, client: any): RollbackAdapter {
  switch (provider) {
    case 'postgresql':
      return new PostgresRollbackAdapter(client)
    case 'mongodb':
      return new MongoRollbackAdapter(client.mongo.db)
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}
