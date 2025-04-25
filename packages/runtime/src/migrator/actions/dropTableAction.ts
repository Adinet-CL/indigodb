import { BaseMigrationAction } from './baseMigrationAction'

export class DropTableAction extends BaseMigrationAction {
  toJSON() {
    return {
      type: 'drop_table',
      table: this.table
    }
  }
}