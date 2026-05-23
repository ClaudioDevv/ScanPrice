import Button from '../Button/Button'
import './ProductCard.css'

interface ProductCardProps {
  product: any
  onBack: () => void
}

export default function ProductCard({ product, onBack }: ProductCardProps) {
  return (
    <div className="product-card">
      <h2>{product.name}</h2>
      <p className="product-brand">{product.brand}</p>
      <p className="product-category">{product.category}</p>
      <p className="product-price">{product.price}€</p>
      <p className="product-supermarket">{product.supermarket}</p>
      <Button text="Volver" onClick={onBack} />
    </div>
  )
}