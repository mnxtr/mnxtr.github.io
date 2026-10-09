import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categoryNames } from '../data/sample'
import type { Product } from '../types'
import { ProductVisual } from './ProductVisual'

export function ProductCard({ product, number }: { product: Product; number?: string }) {
  return <article className="product-card">
    <Link to={`/products/${product.slug}`} className="product-card-link" aria-label={`View ${product.name}`}>
      <div className="product-card-image"><ProductVisual product={product} />{number && <span className="image-index">{number}</span>}</div>
      <h3>{product.name}</h3>
      <p className="gallery-card-category">{categoryNames[product.category]}</p>
      <span className="gallery-card-link">View details <ArrowRight size={18}/></span>
    </Link>
  </article>
}
