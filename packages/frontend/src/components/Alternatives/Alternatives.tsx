import './Alternatives.css'

interface AlternativesProps {
  alternatives: any[]
}

export default function Alternatives({ alternatives }: AlternativesProps) {
  if (alternatives.length === 0) return null

  return (
    <div className="alternatives">
      <h3>Alternativas</h3>
      {alternatives.map((alt, i) => (
        <div key={i} className="alternative-card">
          <p>{alt.name}</p>
          <p>{alt.price}€ — {alt.supermarket}</p>
        </div>
      ))}
    </div>
  )
}