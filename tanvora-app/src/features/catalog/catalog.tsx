import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { sampleProducts } from '../../data/sample'
import { isDemo, supabase } from '../../lib/supabase'
import type { Category, Product } from '../../types'

type CatalogState = { products: Product[]; loading: boolean; error: string | null; demo: boolean }
const CatalogContext = createContext<CatalogState>({ products: [], loading: true, error: null, demo: true })

type DbVariant = { id: string; sku: string; colour: string; hex: string; price_bdt: number; available: boolean; is_active: boolean }
type DbImage = { url: string; sort_order: number }
type DbProduct = { id: string; slug: string; name: string; category_slug: Category; material: string; description: string; dimensions: string; features: string[]; image_index: number; is_featured: boolean; product_variants: DbVariant[]; product_images: DbImage[] }

function mapProduct(row: DbProduct): Product {
  return {
    id: row.id, slug: row.slug, name: row.name, category: row.category_slug, material: row.material,
    description: row.description, dimensions: row.dimensions, features: row.features ?? [],
    imageIndex: row.image_index ?? 0, imageUrl: row.product_images?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url,
    featured: row.is_featured,
    variants: (row.product_variants ?? []).filter(v => v.is_active).map(v => ({ id: v.id, sku: v.sku, colour: v.colour, hex: v.hex, priceBdt: v.price_bdt, available: v.available })),
  }
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CatalogState>({ products: isDemo ? sampleProducts : [], loading: !isDemo, error: null, demo: isDemo })

  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    supabase.from('products')
      .select('id,slug,name,category_slug,material,description,dimensions,features,image_index,is_featured,product_variants(id,sku,colour,hex,price_bdt,available,is_active),product_images(url,sort_order)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setState({ products: [], loading: false, error: 'The collection could not be loaded. Please try again later.', demo: false })
        else setState({ products: (data as DbProduct[]).map(mapProduct), loading: false, error: null, demo: false })
      })
    return () => { cancelled = true }
  }, [])

  return <CatalogContext.Provider value={state}>{children}</CatalogContext.Provider>
}

export const useCatalog = () => useContext(CatalogContext)
