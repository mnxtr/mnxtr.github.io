import type { Product } from '../types'

export function ProductVisual({ product, className = '' }: { product: Product; className?: string }) {
  if (product.imageUrl) return <img className={`product-visual product-visual-img ${className}`} src={product.imageUrl} alt={product.name} loading="lazy" />
  return <div className={`product-visual sample-image sample-image-${product.imageIndex % 4} ${className}`} role="img" aria-label={`Illustrative photograph for ${product.name}`} />
}
