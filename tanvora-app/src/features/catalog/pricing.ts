import type { Product } from '../../types'

export function startingPrice(product: Product): number | null {
  const available = product.variants.filter(variant => variant.available)
  const prices = (available.length ? available : product.variants).map(variant => variant.priceBdt)
  return prices.length ? Math.min(...prices) : null
}

export function hasPriceRange(product: Product): boolean {
  const price = startingPrice(product)
  const available = product.variants.filter(variant => variant.available)
  const variants = available.length ? available : product.variants
  return price !== null && variants.some(variant => variant.priceBdt !== price)
}
