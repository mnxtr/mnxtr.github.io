export type Category = 'mens-bags' | 'womens-bags' | 'wallets'

export interface Variant {
  id: string
  sku: string
  colour: string
  hex: string
  priceBdt: number
  available: boolean
}

export interface ProductImage {
  url: string
  alt: string
  variantId: string | null
}

export interface Product {
  id: string
  slug: string
  name: string
  category: Category
  material: string
  description: string
  dimensions: string
  features: string[]
  imageIndex: number
  images?: ProductImage[]
  featured: boolean
  variants: Variant[]
}
