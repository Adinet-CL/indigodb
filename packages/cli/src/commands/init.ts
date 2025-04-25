import { Command } from 'commander'
import prompts from 'prompts'
import fs from 'fs'
import path from 'path'

export const initCommand = new Command('init')
  .description('Initialize your IndigoDB project with an interactive wizard')
  .action(async () => {
    const response = await prompts([
      {
        type: 'select',
        name: 'provider',
        message: 'Which database will you use?',
        choices: [
          { title: 'PostgreSQL', value: 'postgresql' },
          { title: 'MongoDB', value: 'mongodb' }
        ]
      },
      {
        type: 'confirm',
        name: 'useEnv',
        message: 'Would you like to use a .env file for the database connection?',
        initial: true
      },
      {
        type: (prev) => prev ? 'text' : null,
        name: 'envUrl',
        message: 'Enter the DATABASE_URL connection string:',
        initial: (prev, values) =>
          values.provider === 'postgresql'
            ? 'postgres://postgres:postgres@localhost:5432/db'
            : 'mongodb://localhost:27017'
      },
      {
        type: 'confirm',
        name: 'enableRealtime',
        message: 'Enable realtime support (via WebSocket server)?',
        initial: true
      },
      {
        type: (prev) => prev ? 'number' : null,
        name: 'realtimePort',
        message: 'WebSocket server port:',
        initial: 4000
      },
      {
        type: (prev) => prev ? 'text' : null,
        name: 'realtimeOrigins',
        message: 'Allowed WebSocket origins (comma separated):',
        initial: '*'
      }
    ])

    // .env file
    if (response.useEnv && response.envUrl) {
      fs.writeFileSync('.env', `DATABASE_URL="${response.envUrl}"\n`)
      console.log('✅ .env file created')
    }

    // schema content
    const schema = `
datasource db {
  provider = "${response.provider}"
  url      = ${response.useEnv ? 'env("DATABASE_URL")' : `"${response.envUrl}"`}
  ${response.provider === 'mongodb' ? 'dbName   = "testdb"' : ''}
}

generator client {
  provider = "indigodb-client"
}

${response.enableRealtime ? `// realtimePort = ${response.realtimePort}\n// realtimeOrigins = ${response.realtimeOrigins}` : ''}

model User {
  id        String   @id
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
}
`

    fs.writeFileSync('indigodb.schema', schema.trimStart())
    console.log('🎉 indigodb.schema file successfully created')
  })
