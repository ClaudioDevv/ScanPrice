import './App.css'
import Button from './components/Button/Button'
import Header from './components/Header/Header'

function App() {

  return (
    <>
      <Header />
      <section className='main'>
          <h1>App de prácticas de Ingeniería de Sistemas de Información</h1>
          <h2>Prueba</h2>
          <ul>
            <li className='student'>Claudio Rivas Boza</li>
            <li className='student'>Yeray Ortega Fernández</li>
          </ul>
          <h2>Curso 25-26</h2>
          <Button text="Escanear producto" />
          
      </section>
    </>

  )
}

export default App
