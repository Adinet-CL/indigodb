import { Command } from 'commander'
import prompts from 'prompts'
import { generateProject } from '../generators/generateProject'

export const createProjectCommand = new Command('create project')
  .description('Scaffold a new IndigoDB project')
  .action(async () => {
    const response = await prompts([
      { type: 'text', name: 'name', message: 'Project name:', initial: 'my-app' },
      {
        type: 'select', name: 'framework', message: 'HTTP framework:',
        choices: [{ title: 'Express', value: 'express' }, { title: 'Fastify', value: 'fastify' }]
      },
      {
        type: 'select', name: 'provider', message: 'Database:',
        choices: [{ title: 'PostgreSQL', value: 'postgresql' }, { title: 'MongoDB', value: 'mongodb' }]
      },
      { type: 'confirm', name: 'useEnv', message: 'Use .env?', initial: true },
      {
        type: (prev) => prev ? 'text' : null,
        name: 'envUrl',
        message: 'Connection string:',
        initial: (prev, values) =>
          values.provider === 'postgresql'
            ? 'postgres://postgres:postgres@localhost:5432/db'
            : 'mongodb://localhost:27017'
      },
      { type: 'confirm', name: 'realtime', message: 'Enable realtime?', initial: true },
      {
        type: (prev) => prev ? 'number' : null,
        name: 'realtimePort',
        message: 'Realtime port:',
        initial: 4000
      }
    ])

    await generateProject(response)

    console.log(`🎉 Project ${response.name} created!`)
    console.log(`📂 cd ${response.name} && pnpm install && indigodb dev`)
  })
