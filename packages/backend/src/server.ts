import app from './app'

const PORT = process.env.PORT ?? 3000
const msg = process.env.NODE_ENV === 'develop' ? `Escuchando en http://localhost:${PORT}` : `Escuchando en puerto ${PORT}`

app.listen(PORT, () => {
  console.log(msg)
})
