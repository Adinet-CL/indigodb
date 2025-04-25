export function generateExpressMain(): string {
    return `import express from 'express'
  
  const app = express()
  app.get('/ping', (req, res) => {
    res.json({ message: 'Hello IndigoDB!' })
  })
  
  app.listen(3000, () => {
    console.log('🚀 Server running at http://localhost:3000')
  })`
  }
  