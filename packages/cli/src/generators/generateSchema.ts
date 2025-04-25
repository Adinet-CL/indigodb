import { writeFileSafe } from '../utils/fileUtils'
import path from 'path'

export function generateSchema(projectRoot: string, provider: string, useEnv: boolean, envUrl: string) {
  const dbUrl = useEnv ? 'env("DATABASE_URL")' : `"${envUrl}"`
  const dbName = provider === 'mongodb' ? '  dbName   = "testdb"\n' : ''
  const schema = `datasource db {
  provider = "${provider}"
  url      = ${dbUrl}
${dbName}}

generator client {
  provider = "indigodb-client"
}

model User {
  id        String   @id
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
}
`
  writeFileSafe(path.join(projectRoot, 'src/db/indigodb.schema'), schema)
}
