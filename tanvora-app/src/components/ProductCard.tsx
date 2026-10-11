import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categoryNames, money } from '../data/sample'
import { useCatalog } from '../features/catalog/catalog'
import { hasPriceRange, startingPrice } from '../features/catalog/pricing'
import type { Product } from '../types'
import { ProductVisual } from './ProductVisual'

export function ProductCard({ product, number }: { product: Product; number?: string }) {
  const { demo } = useCatalog()
  const lowestPrice = startingPrice(product)
  const priceLabel = lowestPrice === null ? 'Price pending' : `${hasPriceRange(product) ? 'From ' : ''}${money(lowestPrice)}`
  return <article className="product-card">
    <Link to={`/products/${product.slug}`} className="product-card-link" aria-label={`View ${product.name}, ${priceLabel}${demo ? ', illustrative preview' : ''}`}>
      <div className="product-card-image"><ProductVisual product={product} demo={demo} />{number && <span className="image-index">{number}</span>}</div>
      <h3>{product.name}</h3>
      <p className="gallery-card-category">{categoryNames[product.category]}</p>
      <div className="gallery-card-facts"><span>{product.material}</span><strong>{priceLabel}</strong></div>
      {demo && <p className="gallery-card-preview">Illustrative price · preview only</p>}
      <span className="gallery-card-link">View details <ArrowRight size={18}/></span>
    </Link>
  </article>
}
