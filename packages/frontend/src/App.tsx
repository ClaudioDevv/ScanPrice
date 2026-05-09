import './App.css'
import Button from './components/Button/Button'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import SearchBar from './components/SearchBar/SearchBar'
import Carousel from './components/Carousel/Carousel'

function App() {
  return (
    <>
      <Header />
      <section className='main'>
        <Carousel />
        <SearchBar />
        <div className="how-it-works">
          <h2 className="how-title">¿Cómo funciona?</h2>
          <div className="steps">
            <div className="step">
              <div className="step-icon">📷</div>
              <h3>Escanea</h3>
              <p>Apunta la cámara al código de barras del producto</p>
            </div>
            <div className="step">
              <div className="step-icon">🔍</div>
              <h3>Compara</h3>
              <p>Ve el precio en Mercadona y Carrefour al instante</p>
            </div>
            <div className="step">
              <div className="step-icon">💰</div>
              <h3>Ahorra</h3>
              <p>Elige el supermercado más barato para tu compra</p>
            </div>
          </div>
        </div>
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
