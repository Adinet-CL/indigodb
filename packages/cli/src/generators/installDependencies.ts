import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

export function installDependencies(projectRoot: string, framework: 'express' | 'fastify') {
  // 1. npm init
  execSync('npm init -y', { cwd: projectRoot, stdio: 'inherit' })

  // 2. Dependencias base
  const baseDeps = ['dotenv']
  const expressDeps = ['express']
  const fastifyDeps = ['fastify']
  const deps = [...baseDeps, ...(framework === 'express' ? expressDeps : fastifyDeps)]

  execSync(`pnpm add ${deps.join(' ')}`, { cwd: projectRoot, stdio: 'inherit' })

  // 3. Dependencias de desarrollo
  const devDeps = [
    'typescript',
    'ts-node',
    '@types/node',
    ...(framework === 'express' ? ['@types/express'] : [])
  ]

  execSync(`pnpm add -D ${devDeps.join(' ')}`, { cwd: projectRoot, stdio: 'inherit' })

  // 4. Editar package.json
  const pkgPath = path.join(projectRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

  pkg.scripts = {
    dev: 'ts-node src/main.ts',
    start: 'node dist/main.js'
  }
  pkg.type = 'module'

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
}
