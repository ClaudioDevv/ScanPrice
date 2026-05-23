import { useState } from 'react'
import './App.css'
import { useProductSearch } from './hooks/useProductSearch'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import SearchBar from './components/SearchBar/SearchBar'
import Carousel from './components/Carousel/Carousel'
import Button from './components/Button/Button'
import Scanner from './components/Scanner/Scanner'
import ManualModal from './components/ManualModal/ManualModal'
import SuggestModal from './components/SuggestModal/SuggestModal'
import ProductCard from './components/ProductCard/ProductCard'
import Alternatives from './components/Alternatives/Alternatives'

export default function App() {
  const { ean, setEan, supermarket, setSupermarket, product, alternatives, notFound, loading, searchProduct, reset } = useProductSearch()
  const [showScanner, setShowScanner] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [showSuggestModal, setShowSuggestModal] = useState(false)
  const [suggestSuccess, setSuggestSuccess] = useState(false)

  function handleManualSubmit() {
    if (!ean || !supermarket) return
    setShowManualModal(false)
    searchProduct(ean, supermarket)
  }

  return (
    <>
      <Header />
      <section className='main'>

        {!product && !notFound && !suggestSuccess && (
          <>
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
              <Button text="Escanear código de barras" onClick={() => setShowScanner(true)} />
              <Button text="Introducir código manual" onClick={() => setShowManualModal(true)} />
            </div>
          </>
        )}

        {loading && <p className="loading-text">Buscando producto...</p>}

        {product && <ProductCard product={product} onBack={reset} />}

        <Alternatives alternatives={alternatives} />

        {notFound && (
          <div className="not-found">
            <p>Producto no encontrado</p>
            <Button text="Añadir producto" onClick={() => setShowSuggestModal(true)} />
            <Button text="Volver" onClick={reset} />
          </div>
        )}

        {suggestSuccess && (
          <div className="success-message">
            <p>  Producto añadido correctamente, ¡gracias!</p>
            <Button text="Volver al inicio" onClick={() => { setSuggestSuccess(false); reset() }} />
          </div>
        )}

      </section>

      {showScanner && (
        <Scanner
          onScan={(eanCode) => { setEan(eanCode); setShowScanner(false); setShowManualModal(true) }}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showManualModal && (
        <ManualModal
          ean={ean}
          supermarket={supermarket}
          onEanChange={setEan}
          onSupermarketChange={setSupermarket}
          onSubmit={handleManualSubmit}
          onClose={() => setShowManualModal(false)}
        />
      )}

      {showSuggestModal && (
        <SuggestModal
          ean={ean}
          onSuccess={() => { setShowSuggestModal(false); setSuggestSuccess(true) }}
          onClose={() => setShowSuggestModal(false)}
        />
      )}

      <Footer />
    </>
  )
}
