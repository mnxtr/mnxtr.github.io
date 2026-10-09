import type { Product, Variant } from '../../types'

const number = (import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
export const whatsappReady = number.length >= 10 && number.length <= 15

export function whatsappUrl(product: Product, variant: Variant) {
  if (!whatsappReady) return null
  const text = `Hello TANVORA, I’m interested in ${product.name} (${variant.sku}, ${variant.colour}). ${window.location.href}`
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
