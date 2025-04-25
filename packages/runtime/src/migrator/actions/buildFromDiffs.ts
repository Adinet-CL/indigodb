import type { SchemaDiff } from '../../diff/types'
import { CreateTableAction } from './createTableAction'
import { DropTableAction } from './dropTableAction'
import { AddColumnAction } from './addColumnAction'
import { DropColumnAction } from './dropColumnAction'
import { BaseMigrationAction } from './baseMigrationAction'

export function buildMigrationActionsFromDiffs(diffs: SchemaDiff[]): BaseMigrationAction[] {
  const actions: BaseMigrationAction[] = []

  for (const diff of diffs) {
    switch (diff.type) {
      case 'model_added':
        actions.push(new CreateTableAction(diff.model, []))
        break
      case 'model_removed':
        actions.push(new DropTableAction(diff.model))
        break
      case 'field_added':
        actions.push(new AddColumnAction(diff.model, {
          name: diff.field!,
          type: diff.details?.typeAfter ?? 'TEXT'
        }))
        break
      case 'field_removed':
        actions.push(new DropColumnAction(diff.model, diff.field!))
        break
    }
  }

  return actions
}