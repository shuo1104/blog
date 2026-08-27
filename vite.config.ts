import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function engagementApiPlugin(): Plugin {
  const dataFile = path.resolve(__dirname, 'data/engagement.json')

  const readData = (): Record<string, { likes: number; shares: number; views: number }> => {
    try {
      if (fs.existsSync(dataFile)) {
        return JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
      }
    } catch (_) {}
    return {}
  }

  const writeData = (data: unknown) => {
    try {
      const dir = path.dirname(dataFile)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8')
    } catch (_) {}
  }

  return {
    name: 'vite-plugin-engagement-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/engagement')) return next()

        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')

        if (req.method === 'GET') {
          const data = readData()
          res.statusCode = 200
          res.end(JSON.stringify(data))
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => (body += chunk))
          req.on('end', () => {
            try {
              const payload = body ? JSON.parse(body) : {}
              const { slug, delta = 1 } = payload
              if (!slug) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Missing slug' }))
                return
              }

              const data = readData()
              if (!data[slug]) {
                data[slug] = { likes: 0, shares: 0, views: 0 }
              }

              if (req.url === '/api/engagement/like') {
                data[slug].likes = Math.max(0, (data[slug].likes || 0) + Number(delta))
              } else if (req.url === '/api/engagement/share') {
                data[slug].shares = (data[slug].shares || 0) + 1
              } else if (req.url === '/api/engagement/view') {
                data[slug].views = (data[slug].views || 0) + 1
              }

              writeData(data)
              res.statusCode = 200
              res.end(JSON.stringify({ success: true, stats: data[slug] }))
            } catch (err: any) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    engagementApiPlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
