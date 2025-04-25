export function generateFastifyMain(): string {
    return `import Fastify from 'fastify'
  
  const app = Fastify()
  app.get('/ping', async () => {
    return { message: 'Hello IndigoDB!' }
  })
  
  app.listen({ port: 3000 }, () => {
    console.log('🚀 Server running at http://localhost:3000')
  })`
  }
  