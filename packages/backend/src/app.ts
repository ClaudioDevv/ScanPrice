import express from 'express'
import helmet from 'helmet'
import { errorHandler } from './middlewares/errorHandler'
import cors from 'cors'
import ProductRouter from './routes/product.routes'
import SuggestionRouter from './routes/suggestion.routes'

const app = express()

app.use(helmet())
app.disable('x-powered-by')
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN : 'http://localhost:5173',
  methods: ['GET', 'POST'],
}))
app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).send('<h1>API funcionando correctamente</h1>')
})

app.use('/api/products', ProductRouter)
app.use('/api/suggestions', SuggestionRouter)

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() })
})

app.use(errorHandler)

export default app
