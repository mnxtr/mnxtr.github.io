import { useMemo } from 'react'
import { ArrowRight, Search, X } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { categoryNames } from '../data/sample'
import { useCatalog } from '../features/catalog/catalog'
import { startingPrice } from '../features/catalog/pricing'
import type { Category } from '../types'

const categories: { label: string; value?: Category }[] = [
  { label: 'All' },
  { label: 'Women’s bags', value: 'womens-bags' },
  { label: 'Men’s bags', value: 'mens-bags' },
  { label: 'Wallets', value: 'wallets' },
]

export function Collection({ embedded = false }: { embedded?: boolean }) {
  const { category } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { products, loading, error, demo } = useCatalog()
  const selected = categories.find(item => item.value === category)?.value
  const query = params.get('q') ?? ''
  const sort = params.get('sort') ?? 'featured'
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    const result = products.filter(p => (!selected || p.category === selected) && (!term || [p.name, p.material, categoryNames[p.category]].join(' ').toLowerCase().includes(term)))
    if (sort === 'price-low' || sort === 'price-high') return result.sort((a, b) => {
      const priceA = startingPrice(a)
      const priceB = startingPrice(b)
      if (priceA === null) return priceB === null ? 0 : 1
      if (priceB === null) return -1
      return sort === 'price-low' ? priceA - priceB : priceB - priceA
    })
    return result.sort((a, b) => Number(b.featured) - Number(a.featured))
  }, [products, selected, query, sort])
  const update = (key: string, value: string) => setParams(old => { const next = new URLSearchParams(old); if (value && !(key === 'sort' && value === 'featured')) next.set(key, value); else next.delete(key); return next }, { replace: true })
  const Heading = embedded ? 'h2' : 'h1'
  const currentSearch = params.toString()

  return <section id={embedded ? 'collection' : undefined} className={`gallery-collection container-wide${embedded ? ' is-home' : ''}`} aria-labelledby="collection-heading">
    {!embedded && <div className="page-breadcrumb"><Link to="/">Home</Link><span>/</span><span>{selected ? categoryNames[selected] : 'The Collection'}</span></div>}
    <div className="gallery-collection-heading"><div><Heading id="collection-heading">{selected ? categoryNames[selected] : 'The Collection'}</Heading><p>Pieces for wherever the day takes you.</p></div>{demo && <span className="gallery-preview-label">Preview collection · illustrative products</span>}</div>
    <div className="gallery-toolbar">
      <label className="gallery-search"><Search size={18} strokeWidth={1.5}/><span className="sr-only">Search products</span><input value={query} onChange={e => update('q', e.target.value)} placeholder="Search products, materials, styles…" type="search" /></label>
      <nav className="gallery-filters" aria-label="Product categories">{categories.map(item => <Link key={item.label} to={{ pathname: item.value ? `/collections/${item.value}` : embedded ? '/' : '/collections', search: currentSearch ? `?${currentSearch}` : '' }} className={selected === item.value ? 'selected' : ''} aria-current={!embedded && selected === item.value ? 'page' : undefined}>{item.label}</Link>)}</nav>
      <label className="gallery-sort"><span className="sr-only">Sort products</span><select value={sort} onChange={e => update('sort', e.target.value)}><option value="featured">Sort by: Featured</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option></select></label>
    </div>
    {!loading && !error && <div className="gallery-results" role="status" aria-live="polite" aria-atomic="true"><span>{filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}</span>{query && <button type="button" onClick={() => update('q', '')}>Clear search <X size={15}/></button>}</div>}
    {loading ? <div className="state-panel" role="status">Loading the collection…</div> : error ? <div className="state-panel" role="alert">{error}</div> : filtered.length ? <div className="product-grid gallery-grid">{filtered.map(p => <ProductCard key={p.id} product={p} />)}</div> : <div className="state-panel"><h2>No pieces found</h2><p>Try a different search or view the whole collection.</p><button className="text-link" type="button" onClick={() => navigate('/collections')}>Show all pieces <ArrowRight size={18}/></button></div>}
    {embedded && <Link className="gallery-view-all" to="/collections">Explore the collection <ArrowRight size={17}/></Link>}
  </section>
}
