import { useState } from 'react'
import './App.css'
import Button from './components/Button/Button'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import SearchBar from './components/SearchBar/SearchBar'
import Carousel from './components/Carousel/Carousel'
import Scanner from './components/Scanner/Scanner'

export default function App() {
  const [showScanner, setShowScanner] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [ean, setEan] = useState('')
  const [supermarket, setSupermarket] = useState('')
  const [product, setProduct] = useState<any>(null)
  const [alternatives, setAlternatives] = useState<any[]>([])
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuggestModal, setShowSuggestModal] = useState(false)
  const [suggestSuccess, setSuggestSuccess] = useState(false)
  const [suggestForm, setSuggestForm] = useState({ name: '', brand: '', category: '', price: '', supermarket: ''})

  async function handleSuggestSubmit() {
    if (!suggestForm.name || !suggestForm.price || !suggestForm.supermarket) return
    try {
      await fetch('http://localhost:3000/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ean: ean,
          name: suggestForm.name,
          brand: suggestForm.brand || '',
          category: suggestForm.category || '',
          price: parseFloat(suggestForm.price),
          supermarket: suggestForm.supermarket
        })
      })
      setShowSuggestModal(false)
      setSuggestSuccess(true)
    } catch (e) {
      console.error(e)
    }
  }

  async function searchProduct(eanCode: string, supermarketName: string) {
    setLoading(true)
    setNotFound(false)
    setProduct(null)
    setAlternatives([])

    try {
      const res = await fetch(`http://localhost:3000/api/products/${eanCode}?supermarket=${supermarketName}`)
      const data = await res.json()

      if (data.success && data.data) {
        setProduct(data.data)
        const altRes = await fetch(`http://localhost:3000/api/products/${eanCode}/alternatives?supermarket=${supermarketName}`)
        const altData = await altRes.json()
        if (altData.success) setAlternatives(altData.data)
      } else {
        setNotFound(true)
      }
    } catch (e) {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  function handleManualSubmit() {
    if (!ean || !supermarket) return
    setShowManualModal(false)
    searchProduct(ean, supermarket)
  }

  return (
    <>
      <Header />
      <section className='main'>

        {!product && !notFound && (
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
            {showScanner && (
              <Scanner
                onScan={(eanCode) => {
                  setEan(eanCode)
                  setShowScanner(false)
                  setShowManualModal(true)
                }}
                onClose={() => setShowScanner(false)}
              />
            )}
          </>
        )}

        {loading && <p className="loading-text">Buscando producto...</p>}

        {product && (
          <div className="product-card">
            <h2>{product.name}</h2>
            <p className="product-brand">{product.brand}</p>
            <p className="product-category">{product.category}</p>
            <p className="product-price">{product.price}€</p>
            <p className="product-supermarket">{product.supermarket}</p>
            <Button text="Volver" onClick={() => { setProduct(null); setAlternatives([]) }} />
          </div>
        )}

        {alternatives.length > 0 && (
          <div className="alternatives">
            <h3>Alternativas</h3>
            {alternatives.map((alt, i) => (
              <div key={i} className="alternative-card">
                <p>{alt.name}</p>
                <p>{alt.price}€ — {alt.supermarket}</p>
              </div>
            ))}
          </div>
        )}

        {notFound && (
          <div className="not-found">
            <p>Producto no encontrado</p>
            <Button text="Añadir producto" onClick={() => setShowSuggestModal(true)} />
            <Button text="Volver" onClick={() => setNotFound(false)} />
          </div>
        )}

        {showSuggestModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Añadir producto</h2>
              
              <div className="input-group">
                <label>Nombre del producto</label>
                <input type="text" value={suggestForm.name} onChange={e => setSuggestForm({...suggestForm, name: e.target.value})} />
              </div>

              <div className="input-group">
                <label>Marca (opcional)</label>
                <input type="text" value={suggestForm.brand} onChange={e => setSuggestForm({...suggestForm, brand: e.target.value})} />
              </div>

              <div className="input-group">
                <label>Categoría (opcional)</label>
                <input type="text" value={suggestForm.category} onChange={e => setSuggestForm({...suggestForm, category: e.target.value})} />
              </div>

              <div className="input-group">
                <label>Precio</label>
                <input type="number" value={suggestForm.price} onChange={e => setSuggestForm({...suggestForm, price: e.target.value})} />
              </div>

              <div className="input-group">
                <label>Supermercado</label>
                <select value={suggestForm.supermarket} onChange={e => setSuggestForm({...suggestForm, supermarket: e.target.value})}>
                  <option value="">Selecciona supermercado</option>
                  <option value="mercadona">Mercadona</option>
                  <option value="dia">Dia</option>
                  <option value="lidl">Lidl</option>
                </select>
              </div>

              <div className="modal-buttons">
                <Button text="Enviar" onClick={handleSuggestSubmit} />
                <Button text="Cancelar" onClick={() => setShowSuggestModal(false)} />
              </div>
            </div>
          </div>
        )}

        {suggestSuccess && (
          <div className="success-message">
            <p>✅ Producto añadido correctamente, ¡gracias!</p>
            <Button text="Volver al inicio" onClick={() => { setSuggestSuccess(false); setNotFound(false) }} />
          </div>
        )}

      </section>

      {/* Modal introducir código manual */}
      {showManualModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Introducir código manual</h2>
            <input
              type="text"
              placeholder="Código de barras (EAN)"
              value={ean}
              onChange={e => setEan(e.target.value)}
            />
            <select value={supermarket} onChange={e => setSupermarket(e.target.value)}>
              <option value="">Selecciona supermercado</option>
              <option value="mercadona">Mercadona</option>
              <option value="dia">Dia</option>
              <option value="lidl">Lidl</option>
            </select>
            <div className="modal-buttons">
              <Button text="Buscar" onClick={handleManualSubmit} />
              <Button text="Cancelar" onClick={() => setShowManualModal(false)} />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
