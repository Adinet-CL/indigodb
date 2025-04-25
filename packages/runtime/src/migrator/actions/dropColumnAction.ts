import { BaseMigrationAction } from './baseMigrationAction'

export class DropColumnAction extends BaseMigrationAction {
  constructor(table: string, private columnName: string) {
    super(table)
  }

  toJSON() {
    return {
      type: 'drop_column',
      table: this.table,
      name: this.columnName
    }
  }
}