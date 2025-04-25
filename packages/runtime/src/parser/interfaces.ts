export interface SchemaField {
    name: string
    type: string
    annotations: string[]
  }
  
  export interface SchemaModel {
    name: string
    fields: SchemaField[]
  }
  
  export interface ParsedSchema {
    datasource: {
      provider: string
      url: string
      dbName?: string
    }
    generator: {
      provider: string
    }
    models: SchemaModel[]
  }
  