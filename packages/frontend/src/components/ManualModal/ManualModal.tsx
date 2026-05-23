import Button from '../Button/Button'
import './ManualModal.css'

interface ManualModalProps {
  ean: string
  supermarket: string
  onEanChange: (value: string) => void
  onSupermarketChange: (value: string) => void
  onSubmit: () => void
  onClose: () => void
}

export default function ManualModal({ ean, supermarket, onEanChange, onSupermarketChange, onSubmit, onClose }: ManualModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Introducir código manual</h2>
        <input
          type="text"
          placeholder="Código de barras (EAN)"
          value={ean}
          onChange={e => onEanChange(e.target.value)}
        />
        <select value={supermarket} onChange={e => onSupermarketChange(e.target.value)}>
          <option value="">Selecciona supermercado</option>
          <option value="mercadona">Mercadona</option>
          <option value="dia">Dia</option>
          <option value="lidl">Supeco</option>
        </select>
        <div className="modal-buttons">
          <Button text="Buscar" onClick={onSubmit} />
          <Button text="Cancelar" onClick={onClose} />
        </div>
      </div>
    </div>
  )
}