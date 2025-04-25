import { generateExpressMain } from './expressMain'
import { generateFastifyMain } from './fastifyMain'

export function getMainContent(framework: string): string {
  switch (framework) {
    case 'express':
      return generateExpressMain()
    case 'fastify':
      return generateFastifyMain()
    default:
      throw new Error(`Unsupported framework: ${framework}`)
  }
}
