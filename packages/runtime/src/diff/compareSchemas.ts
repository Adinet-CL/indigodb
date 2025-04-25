import type { SchemaModel } from '../parser'
import type { SchemaDiff, FieldDiff } from './types'

export class SchemaComparator {
  private baseMap: Map<string, SchemaModel>
  private currentMap: Map<string, SchemaModel>
  private diffs: SchemaDiff[] = []

  constructor(
    private baseModels: SchemaModel[],
    private currentModels: SchemaModel[]
  ) {
    this.baseMap = new Map(baseModels.map(m => [m.name, m]))
    this.currentMap = new Map(currentModels.map(m => [m.name, m]))
  }

  public compare(): SchemaDiff[] {
    this.compareModelAdditions()
    this.compareModelRemovals()
    this.compareModelFields()
    return this.diffs
  }

  private compareModelAdditions() {
    for (const [name] of this.currentMap.entries()) {
      if (!this.baseMap.has(name)) {
        this.diffs.push({ type: 'model_added', model: name })
      }
    }
  }

  private compareModelRemovals() {
    for (const [name] of this.baseMap.entries()) {
      if (!this.currentMap.has(name)) {
        this.diffs.push({ type: 'model_removed', model: name })
      }
    }
  }

  private compareModelFields() {
    for (const [modelName, currentModel] of this.currentMap.entries()) {
      if (!this.baseMap.has(modelName)) continue

      const baseFields = new Map(this.baseMap.get(modelName)!.fields.map(f => [f.name, f]))
      const currentFields = new Map(currentModel.fields.map(f => [f.name, f]))

      for (const [fieldName, field] of currentFields.entries()) {
        if (!baseFields.has(fieldName)) {
          this.diffs.push({
            type: 'field_added',
            model: modelName,
            field: fieldName,
            details: {
              name: field.name,
              typeAfter: field.type,
              annotationsAfter: field.annotations
            }
          })
        }
      }

      for (const [fieldName, field] of baseFields.entries()) {
        if (!currentFields.has(fieldName)) {
          this.diffs.push({
            type: 'field_removed',
            model: modelName,
            field: fieldName,
            details: {
              name: field.name,
              typeBefore: field.type,
              annotationsBefore: field.annotations
            }
          })
        }
      }

      for (const [fieldName, currentField] of currentFields.entries()) {
        const baseField = baseFields.get(fieldName)
        if (
          baseField &&
          (baseField.type !== currentField.type ||
            JSON.stringify(baseField.annotations) !== JSON.stringify(currentField.annotations))
        ) {
          this.diffs.push({
            type: 'field_changed',
            model: modelName,
            field: fieldName,
            details: {
              name: fieldName,
              typeBefore: baseField.type,
              typeAfter: currentField.type,
              annotationsBefore: baseField.annotations,
              annotationsAfter: currentField.annotations
            }
          })
        }
      }
    }
  }
}
