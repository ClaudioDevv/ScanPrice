import { useState, useEffect } from 'react'
import './Carousel.css'

const slides = [
  {
    label: 'Escanea cualquier producto',
    content: <img src="/perosnaSonriendo.png" alt="Escanea tu producto" />
  },
  {
    label: 'Compara precios al instante',
    content: <img src="/comparativa.svg" alt="Comparativa de precios" />
  },
  {
    label: 'Ahorra en cada compra',
    content: <img src="/ahorro.svg" alt="Ahorra en cada compra" />
  }
]

export default function Carousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="carousel">
      <div className="slides-wrapper">
        {slides.map((slide, i) => (
          <div key={i} className={`slide ${i === current ? 'active' : ''}`}>
            {slide.content}
            <div className="slide-label">{slide.label}</div>
          </div>
        ))}
      </div>
      <div className="dots">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  )
}