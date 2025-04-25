import type { Db } from 'mongodb'
import type { SchemaModel } from '../parser'
import type {
  MigrationAdapter,
  MigrationAction,
  FieldDefinition,
  MigrationEntry,
  RollbackAdapter,
} from "./types";
import { generateMigrationId, saveMigrationStep } from './versionedHistory'

export class MongoMigrationAdapter implements MigrationAdapter {
  constructor(private db: Db) {}

  async migrate(models: SchemaModel[]) {
    const actions: MigrationAction[] = []
    const migratedModels: string[] = []

    for (const model of models) {
      const collectionName = model.name

      const collections = await this.db.listCollections({ name: collectionName }).toArray()
      if (collections.length === 0) {
        console.log(`📄 Creating collection: ${collectionName}`)
        await this.db.createCollection(collectionName)

        actions.push({
          type: 'create_table',
          table: collectionName,
          fields: model.fields.map(f => ({
            name: f.name,
            type: 'dynamic'
          }))
        })
      }

      for (const field of model.fields) {
        if (field.annotations.includes('@unique')) {
          await this.db.collection(collectionName).createIndex({ [field.name]: 1 }, { unique: true })
          console.log(`🔑 Created unique index on ${collectionName}.${field.name}`)

          actions.push({
            type: 'create_index',
            table: collectionName,
            index: {
              fields: [field.name],
              unique: true
            }
          })
        }
      }

      migratedModels.push(collectionName)
    }

    const migration: MigrationEntry = {
      id: generateMigrationId('mongo'),
      provider: 'mongodb',
      appliedAt: new Date().toISOString(),
      models: migratedModels,
      actions
    }

    await saveMigrationStep(migration)
  }
}

export class MongoRollbackAdapter implements RollbackAdapter {
  constructor(private db: Db) {}

  async rollback(entry: MigrationEntry) {
    for (const action of entry.actions.reverse()) {
      if (action.type === 'create_table' && action.table) {
        await this.db.collection(action.table).drop().catch(() => {})
        console.log(`🗑 Dropped collection: ${action.table}`)
      }

      if (action.type === 'create_index' && action.table && action.index?.fields) {
        const indexName = action.index.fields.join('_')
        await this.db.collection(action.table).dropIndex(indexName).catch(() => {})
        console.log(`🗑 Dropped index: ${indexName}`)
      }
    }
  }
}