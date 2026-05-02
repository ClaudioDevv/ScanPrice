import './App.css'
import Button from './components/Button/Button'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import SearchBar from './components/SearchBar/SearchBar'

function App() {
  return (
    <>
      <Header />
      <section className='main'>
        <img
          src="/perosnaSonriendo.png"
          alt="escanea tu producto"
          style={{ width: '100%', borderRadius: '16px' }}
        />
        <SearchBar />
        <div className='btn-group'>
          <Button text="Escanear código de barras" />
          <Button text="Introducir código manual" />
        </div>
      </section>
      <Footer />
    </>
  )
}

export default App
