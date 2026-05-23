import './HowItWorks.css'

export default function HowItWorks () {
  return (
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
          <p>Ve el precio de los supermercados al instante</p>
        </div>
        <div className="step">
          <div className="step-icon">💰</div>
          <h3>Ahorra</h3>
          <p>Elige el supermercado más barato para tu compra</p>
        </div>
      </div>
    </div>
  )
}