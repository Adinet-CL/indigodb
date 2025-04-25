import fs from 'fs'
import path from 'path'

export function updateSchemaBase() {
  const schemaPath = path.resolve('src/db/indigodb.schema')
  const basePath = path.resolve('src/db/schema.base')

  try {
    if (!fs.existsSync(basePath)) {
      fs.copyFileSync(schemaPath, basePath)
      console.log('📄 schema.base initialized.')
    } else {
      fs.copyFileSync(schemaPath, basePath)
      console.log('📄 schema.base updated.')
    }
  } catch (err) {
    console.error('⚠️ Failed to update schema.base:', err)
  }
}
