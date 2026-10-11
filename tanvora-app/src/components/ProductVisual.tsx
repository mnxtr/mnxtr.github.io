import type { Product, Variant } from '../types'

export function ProductVisual({ product, variant, demo = false, className = '' }: { product: Product; variant?: Variant; demo?: boolean; className?: string }) {
  // A generic or sample photo may depict another colour. Only use it for the default variant.
  const isDefault = !variant || variant.id === product.variants[0]?.id
  const image = variant
    ? product.images?.find(candidate => candidate.variantId === variant.id)
      ?? (isDefault ? product.images?.find(candidate => !candidate.variantId) : undefined)
    : product.images?.find(candidate => !candidate.variantId) ?? product.images?.[0]

  if (image) return <img className={`product-visual product-visual-img ${className}`} src={image.url} alt={image.alt} loading="lazy" />
  if (demo && isDefault) return <div className={`product-visual sample-image sample-image-${product.imageIndex % 4} ${className}`} role="img" aria-label={`Illustrative photograph for ${product.name}`} />

  const label = variant ? `${variant.colour} image pending` : `${product.name} image pending`
  return <div className={`product-visual product-visual-placeholder ${className}`} role="img" aria-label={label}>
    {variant && <span className="placeholder-swatch" style={{ backgroundColor: variant.hex }} />}
    <span>{label}</span>
  </div>
}
