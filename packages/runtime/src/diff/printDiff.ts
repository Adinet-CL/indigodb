import type { SchemaDiff } from './types'
import chalk from 'chalk'

export function printDiff(diffs: SchemaDiff[]) {
  if (!diffs.length) {
    console.log(chalk.green('✅ No changes detected between schemas.'))
    return
  }

  const grouped = groupByModel(diffs)

  for (const model of Object.keys(grouped)) {
    console.log(chalk.bold(`📄 Model: ${model}`))

    for (const diff of grouped[model]) {
      const { type, field, details } = diff

      switch (type) {
        case 'model_added':
          console.log(chalk.greenBright(`+ Added model: ${model}`))
          break
        case 'model_removed':
          console.log(chalk.redBright(`- Removed model: ${model}`))
          break
        case 'field_added':
          console.log(chalk.green(`  + Added field: ${field}: ${details?.typeAfter}`))
          break
        case 'field_removed':
          console.log(chalk.red(`  - Removed field: ${field}: ${details?.typeBefore}`))
          break
        case 'field_changed':
          console.log(
            chalk.yellow(
              `  ~ Changed field: ${field}: ${details?.typeBefore} → ${details?.typeAfter}`
            )
          )
          break
      }
    }

    console.log()
  }
}

function groupByModel(diffs: SchemaDiff[]): Record<string, SchemaDiff[]> {
  const grouped: Record<string, SchemaDiff[]> = {}
  for (const diff of diffs) {
    if (!grouped[diff.model]) grouped[diff.model] = []
    grouped[diff.model].push(diff)
  }
  return grouped
}
