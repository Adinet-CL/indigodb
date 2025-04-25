import fs from 'fs'
import path from 'path'
import type { SchemaModel } from '@adinet/indigodb-runtime'

export function generateModelStructure(models: SchemaModel[]) {
  const basePath = path.resolve(process.cwd(), 'src')

  for (const model of models) {
    const name = model.name.toLowerCase()
    const controllerPath = path.join(basePath, 'interfaces/http', `${name}.controller.ts`)
    const servicePath = path.join(basePath, 'application', `${name}`, `create${model.name}.ts`)
    const repoPath = path.join(basePath, 'infrastructure/db', `${name}.repository.ts`)

    fs.mkdirSync(path.dirname(controllerPath), { recursive: true })
    fs.mkdirSync(path.dirname(servicePath), { recursive: true })
    fs.mkdirSync(path.dirname(repoPath), { recursive: true })

    fs.writeFileSync(controllerPath, `import { Request, Response } from 'express'
import { create${model.name} } from '../../application/${name}/create${model.name}'

export async function ${name}Controller(req: Request, res: Response) {
  try {
    const result = await create${model.name}(req.body)
    res.status(201).json(result)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
`)

    fs.writeFileSync(servicePath, `import { db } from '../../db/generated/client'
import type { ${model.name} } from '../../db/generated/types/${model.name}'

export async function create${model.name}(data: Partial<${model.name}>): Promise<${model.name}> {
  return db.${name}.create(data)
}
`)

    fs.writeFileSync(repoPath, `import { db } from '../../db/generated/client'
import type { ${model.name} } from '../../db/generated/types/${model.name}'

export const ${model.name}Repository = {
  findAll: async (): Promise<${model.name}[]> => db.${name}.find({}),
  findById: async (id: string): Promise<${model.name} | null> => db.${name}.findById(id)
}
`)
  }

  console.log('✅ Structure generated for all models')
}
