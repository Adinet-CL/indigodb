import { BaseMigrationAction } from './baseMigrationAction'
import { FieldDefinition } from '../types'

export class AddColumnAction extends BaseMigrationAction {
  constructor(table: string, private field: FieldDefinition) {
    super(table)
  }

  toJSON() {
    return {
      type: 'add_column',
      table: this.table,
      name: this.field.name,
      fields: [this.field]
    }
  }
}