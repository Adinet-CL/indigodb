import type { SchemaModel } from '../parser'
import type { 
  MigrationAdapter, 
  MigrationAction, 
  FieldDefinition, 
  MigrationEntry, 
  RollbackAdapter 
} from './types'
import { saveMigrationStep, generateMigrationId } from './versionedHistory'

export class PostgresMigrationAdapter implements MigrationAdapter {
  constructor(private client: any) {}

  async migrate(models: SchemaModel[]) {
    const actions: MigrationAction[] = []
    const migratedModels: string[] = []

    for (const model of models) {
      const tableName = model.name
      const fieldsSql = model.fields.map(f => this.buildColumn(f)).join(',\n  ')
      const sql = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${fieldsSql}\n);`

      await this.client.query(sql)
      console.log(`✅ Created table: ${tableName}`)

      // Generar metadata
      const fieldsMeta: FieldDefinition[] = model.fields.map(f => ({
        name: f.name,
        type: this.mapType(f.type),
        primary: f.annotations.includes('@id') || undefined,
        unique: f.annotations.includes('@unique') || undefined,
        default: f.annotations.includes('@default(now())') ? 'NOW()' : undefined
      }))

      actions.push({
        type: 'create_table',
        table: tableName,
        fields: fieldsMeta
      })

      migratedModels.push(tableName)
    }

    await saveMigrationStep({
      id: generateMigrationId('auto'),
      provider: 'postgresql',
      appliedAt: new Date().toISOString(),
      models: migratedModels,
      actions
    })
  }

  private buildColumn(field: { name: string; type: string; annotations: string[] }): string {
    let column = `"${field.name}" ${this.mapType(field.type)}`
    if (field.annotations.includes('@id')) column += ' PRIMARY KEY'
    if (field.annotations.includes('@unique')) column += ' UNIQUE'
    if (field.annotations.includes('@default(now())')) column += ' DEFAULT NOW()'
    return column
  }

  private mapType(type: string): string {
    return {
      String: 'TEXT',
      Int: 'INTEGER',
      Float: 'FLOAT',
      Boolean: 'BOOLEAN',
      DateTime: 'TIMESTAMP',
      UUID: 'UUID'
    }[type] || 'TEXT'
  }
}


export class PostgresRollbackAdapter implements RollbackAdapter {
  constructor(private client: any) {}

  async rollback(entry: MigrationEntry) {
    for (const action of entry.actions.reverse()) {
      if (action.type === 'create_table' && action.table) {
        await this.client.query(`DROP TABLE IF EXISTS "${action.table}" CASCADE`)
        console.log(`🗑 Dropped table: ${action.table}`)
      }
      if (action.type === 'create_index' && action.table && action.index?.fields) {
        const indexName = `${action.table}_${action.index.fields.join('_')}_idx`
        await this.client.query(`DROP INDEX IF EXISTS "${indexName}"`)
        console.log(`🗑 Dropped index: ${indexName}`)
      }
    }
  }
}
