import Button from '../Button/Button'
import type { Product } from '../../types/product'
import { capitalize } from '../../utils/helper'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
  onBack: () => void
}

export default function ProductCard({ product, onBack }: ProductCardProps) {
  return (
    <div className="product-card">
      <h2>{product.name}</h2>
      <p className="product-brand">{product.brand}</p>
      <p className="product-category">{product.category}</p>
      <p className="product-price">{product.price}€</p>
      <p className="product-supermarket">{capitalize(product.supermarket)}</p>
      <Button text="Volver" onClick={onBack} />
    </div>
  )
}