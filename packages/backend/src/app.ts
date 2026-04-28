import express from 'express'
import helmet from 'helmet'
import { errorHandler } from './middlewares/errorHandler'
// import cors from 'cors'
import ProductRouter from './routes/product.routes'

const app = express()

app.use(helmet())
app.disable('x-powered-by')

app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).send('<h1>API funcionando correctamente</h1>')
})

app.use('/api/products', ProductRouter)

app.use(errorHandler)

export default app
