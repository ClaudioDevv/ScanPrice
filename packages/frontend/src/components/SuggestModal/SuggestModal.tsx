import { useState } from 'react'
import Button from '../Button/Button'
import './SuggestModal.css'
import { postSuggestion } from '../../services/productService'

interface SuggestModalProps {
  ean: string
  onSuccess: () => void
  onClose: () => void
}

export default function SuggestModal({ ean, onSuccess, onClose }: SuggestModalProps) {
  const [form, setForm] = useState({ name: '', brand: '', category: '', price: '', supermarket: '' })

  async function handleSubmit() {
    if (!form.name || !form.price || !form.supermarket) return
    try {
      await postSuggestion({
        ean,
        name: form.name,
        brand: form.brand || '',
        category: form.category || '',
        price: parseFloat(form.price),
        supermarket: form.supermarket
      })
      onSuccess()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Añadir producto</h2>
        <div className="input-group">
          <label>Nombre del producto</label>
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div className="input-group">
          <label>Marca (opcional)</label>
          <input type="text" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
        </div>
        <div className="input-group">
          <label>Categoría (opcional)</label>
          <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
        </div>
        <div className="input-group">
          <label>Precio</label>
          <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
        </div>
        <div className="input-group">
          <label>Supermercado</label>
          <select value={form.supermarket} onChange={e => setForm({...form, supermarket: e.target.value})}>
            <option value="">Selecciona supermercado</option>
            <option value="mercadona">Mercadona</option>
            <option value="dia">Dia</option>
            <option value="lidl">Supeco</option>
          </select>
        </div>
        <div className="modal-buttons">
          <Button text="Enviar" onClick={handleSubmit} />
          <Button text="Cancelar" onClick={onClose} />
        </div>
      </div>
    </div>
  )
}