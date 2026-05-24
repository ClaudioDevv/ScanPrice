import app from './app'
import { pool } from './config/pg'

const PORT = process.env.PORT ?? 3000
const msg = process.env.NODE_ENV === 'develop' ? `Escuchando en http://localhost:${PORT}` : `Escuchando en puerto ${PORT}`

const server = app.listen(PORT, () => {
  console.log(msg)
})

const shutdown = async (signal: string) => {
  console.log(`⚠️ ${signal} recibido, cerrando...`)
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
