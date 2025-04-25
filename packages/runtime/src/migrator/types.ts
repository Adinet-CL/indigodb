import type { SchemaModel } from '../parser'
import type { SerializedMigrationAction } from './actions/baseMigrationAction'

export interface MigrationAdapter {
  migrate(models: SchemaModel[]): Promise<void>
}

export interface RollbackAdapter {
  rollback(entry: MigrationEntry): Promise<void>
}

export interface MigrationAction {
  type: 'create_table' | 'drop_table' | 'add_column' | 'drop_column' | 'create_index'
  table?: string
  name?: string
  fields?: FieldDefinition[]
  index?: IndexDefinition
}

export interface FieldDefinition {
  name: string
  type: string
  primary?: boolean
  unique?: boolean
  default?: string
}

export interface IndexDefinition {
  fields: string[]
  unique?: boolean
}

export interface MigrationEntry {
  id: string
  provider: string
  appliedAt: string
  models: string[]
  actions: SerializedMigrationAction[]
}
