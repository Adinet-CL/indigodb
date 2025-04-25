export type ChangeType =
  | 'model_added'
  | 'model_removed'
  | 'field_added'
  | 'field_removed'
  | 'field_changed'

export interface FieldDiff {
  name: string
  typeBefore?: string
  typeAfter?: string
  annotationsBefore?: string[]
  annotationsAfter?: string[]
}

export interface SchemaDiff {
  type: ChangeType
  model: string
  field?: string
  details?: FieldDiff
}
