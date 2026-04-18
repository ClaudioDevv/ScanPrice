import express from 'express'
import helmet from 'helmet'
// import cors from 'cors'

const app = express()

app.use(helmet())
app.disable('x-powered-by')

app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).send('<h1>API funcionando correctamente</h1>')
})

export default app
