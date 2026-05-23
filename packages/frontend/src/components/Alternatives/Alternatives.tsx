import type { Product } from '../../types/product'
import { capitalize } from '../../utils/helper'
import './Alternatives.css'

interface AlternativesProps {
  alternatives: Product[]
}

export default function Alternatives({ alternatives }: AlternativesProps) {
  if (alternatives.length === 0) return null

  return (
    <div className="alternatives">
      <h3>Alternativas</h3>
      {alternatives.map((alt, i) => (
        <div key={i} className="alternative-card">
          <p>{alt.name}</p>
          <p>{alt.price}€ — {capitalize(alt.supermarket)}</p>
        </div>
      ))}
    </div>
  )
}