import { useMemo } from 'react'
import { ArrowRight, Search, X } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { categoryNames } from '../data/sample'
import { useCatalog } from '../features/catalog/catalog'
import type { Category } from '../types'

const categories: { label: string; value?: Category }[] = [
  { label: 'All' },
  { label: 'Women’s bags', value: 'womens-bags' },
  { label: 'Men’s bags', value: 'mens-bags' },
  { label: 'Wallets', value: 'wallets' },
]

export function Collection({ embedded = false }: { embedded?: boolean }) {
  const { category } = useParams()
  const [params, setParams] = useSearchParams()
  const { products, loading, error, demo } = useCatalog()
  const selected = categories.find(item => item.value === category)?.value
  const query = params.get('q') ?? ''
  const sort = params.get('sort') ?? 'featured'
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    const result = products.filter(p => (!selected || p.category === selected) && (!term || [p.name, p.material, categoryNames[p.category]].join(' ').toLowerCase().includes(term)))
    if (sort === 'price-low') return result.sort((a, b) => (a.variants[0]?.priceBdt ?? 0) - (b.variants[0]?.priceBdt ?? 0))
    if (sort === 'price-high') return result.sort((a, b) => (b.variants[0]?.priceBdt ?? 0) - (a.variants[0]?.priceBdt ?? 0))
    return result.sort((a, b) => Number(b.featured) - Number(a.featured))
  }, [products, selected, query, sort])
  const update = (key: string, value: string) => setParams(old => { const next = new URLSearchParams(old); if (value && !(key === 'sort' && value === 'featured')) next.set(key, value); else next.delete(key); return next }, { replace: true })

  return <section id={embedded ? 'collection' : undefined} className={`gallery-collection container-wide${embedded ? ' is-home' : ''}`} aria-labelledby="collection-heading">
    {!embedded && <div className="page-breadcrumb"><Link to="/">Home</Link><span>/</span><span>{selected ? categoryNames[selected] : 'The Collection'}</span></div>}
    <div className="gallery-collection-heading"><div><h2 id="collection-heading">{selected ? categoryNames[selected] : 'The Collection'}</h2><p>Pieces for wherever the day takes you.</p></div>{demo && <span className="gallery-preview-label">Preview collection · illustrative products</span>}</div>
    <div className="gallery-toolbar">
      <label className="gallery-search"><Search size={18} strokeWidth={1.5}/><span className="sr-only">Search products</span><input value={query} onChange={e => update('q', e.target.value)} placeholder="Search products, materials, styles…" type="search" /></label>
      <nav className="gallery-filters" aria-label="Product categories">{categories.map(item => <Link key={item.label} to={item.value ? `/collections/${item.value}` : embedded ? '/' : '/collections'} className={selected === item.value ? 'selected' : ''}>{item.label}</Link>)}</nav>
      <label className="gallery-sort"><span className="sr-only">Sort products</span><select value={sort} onChange={e => update('sort', e.target.value)}><option value="featured">Sort by: Featured</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option></select></label>
    </div>
    {query && <div className="gallery-results"><span>{filtered.length} {filtered.length === 1 ? 'result' : 'results'}</span><button type="button" onClick={() => update('q', '')}>Clear search <X size={15}/></button></div>}
    {loading ? <div className="state-panel">Loading the collection…</div> : error ? <div className="state-panel">{error}</div> : filtered.length ? <div className="product-grid gallery-grid">{filtered.map(p => <ProductCard key={p.id} product={p} />)}</div> : <div className="state-panel"><h2>No pieces found</h2><p>Try a different search or view the whole collection.</p><button className="text-link" type="button" onClick={() => setParams({})}>Show all pieces <ArrowRight size={18}/></button></div>}
    {embedded && <Link className="gallery-view-all" to="/collections">Explore the collection <ArrowRight size={17}/></Link>}
  </section>
}
