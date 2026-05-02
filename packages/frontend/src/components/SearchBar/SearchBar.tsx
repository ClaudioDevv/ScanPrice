import './SearchBar.css'

export default function SearchBar() {
  return (
    <div className="searchbar-container">
      <div className="searchbar">
        <svg viewBox="0 0 24 24" fill="none" stroke="#7090a8" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Buscar producto por nombre..." />
      </div>
      <p className="supermarkets-title">Supermercados disponibles</p>
      <div className="supermarkets">
        <span className="chip">Mercadona</span>
        <span className="chip">Carrefour</span>
      </div>
    </div>
  )
}