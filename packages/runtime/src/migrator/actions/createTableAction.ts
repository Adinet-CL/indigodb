import { BaseMigrationAction } from './baseMigrationAction'
import { FieldDefinition } from '../types'

export class CreateTableAction extends BaseMigrationAction {
  constructor(table: string, private fields: FieldDefinition[]) {
    super(table)
  }

  toJSON() {
    return {
      type: 'create_table',
      table: this.table,
      fields: this.fields
    }
  }
}