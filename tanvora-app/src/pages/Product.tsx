import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Ruler } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { ProductVisual } from '../components/ProductVisual'
import { categoryNames, money } from '../data/sample'
import { useCatalog } from '../features/catalog/catalog'
import { whatsappUrl } from '../features/enquiries/whatsapp'

export function Product() {
  const { slug } = useParams()
  const { products, loading, error, demo } = useCatalog()
  const product = products.find(p => p.slug === slug)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  useEffect(() => { setSelectedId(null) }, [slug])
  useEffect(() => { document.title = product ? `${product.name} | TANVORA` : 'TANVORA — Objects for everyday life'; return () => { document.title = 'TANVORA — Objects for everyday life' } }, [product])
  if (loading) return <div className="state-panel page-state">Loading product…</div>
  if (error) return <div className="state-panel page-state">{error}</div>
  if (!product) return <div className="state-panel page-state"><h1>Piece not found</h1><Link className="text-link" to="/collections">Explore the collection <ArrowRight size={18}/></Link></div>
  const variant = product.variants.find(v => v.id === selectedId) ?? product.variants.find(v => v.available) ?? product.variants[0]
  const enquiry = variant ? whatsappUrl(product, variant) : null
  const selectedImage = product.images?.some(image => image.variantId === variant?.id)
  const imagePending = variant && !selectedImage && variant.id !== product.variants[0]?.id
  const related = products.filter(p => p.id !== product.id && (p.category === product.category || p.featured)).slice(0, 3)
  return <>
    <div className="container-wide page-breadcrumb product-breadcrumb"><Link to="/">Home</Link><span>/</span><Link to={`/collections/${product.category}`}>{categoryNames[product.category]}</Link><span>/</span><span>{product.name}</span></div>
    <div className="product-layout container-wide"><div className="product-gallery"><div className="product-main-image"><ProductVisual product={product} variant={variant} demo={demo}/></div><p>{imagePending ? `Image for ${variant.colour} is pending.` : demo ? 'Imagery is illustrative for this prototype.' : selectedImage ? 'Image shows the selected colour.' : 'Product imagery may not show the selected colour.'}</p></div>
      <div className="product-info"><span className="eyebrow">TANVORA / {categoryNames[product.category].toUpperCase()}</span><h1>{product.name}</h1><p className="product-subtitle">{product.material}</p><div className="product-price">{variant ? money(variant.priceBdt) : 'Enquire for price'} {demo && <span>Illustrative price</span>}</div><div className="fine-rule"/><p className="product-description">{product.description}</p>
        {variant && <div className="variant-picker"><span className="field-label">Colour <strong>— {variant.colour}</strong></span><div className="swatch-row">{product.variants.map(v => <button key={v.id} type="button" className={`swatch ${v.id === variant.id ? 'selected' : ''}`} aria-label={`${v.colour}${!v.available ? ' — unavailable' : ''}`} aria-pressed={v.id === variant.id} disabled={!v.available} onClick={() => setSelectedId(v.id)}><span style={{ backgroundColor: v.hex }} /></button>)}</div></div>}
        <div className="availability">{!demo && variant?.available && <Check size={16}/>} {demo ? 'Preview only · availability unconfirmed' : variant?.available ? 'Available for enquiry' : 'Currently unavailable'}</div>
        {demo ? <div className="product-preview-callout"><strong>Online orders opening later</strong><span>Products, stock and Dhaka delivery details are still being confirmed.</span></div> : variant?.available && enquiry ? <a className="button button-dark product-cta" href={enquiry} target="_blank" rel="noopener noreferrer">Enquire on WhatsApp <ArrowUpRight size={19}/></a> : <div className="product-preview-callout"><strong>{variant?.available ? 'Online ordering is not open yet' : 'Currently unavailable'}</strong><span>Explore the collection while these details are confirmed.</span></div>}
        <p className="cta-help">Product reference <strong>{variant?.sku ?? 'TANVORA'}</strong></p>
        <div className="detail-accordion"><details open><summary><Ruler size={17}/> Product details <ChevronDown size={17}/></summary><dl><div><dt>Dimensions</dt><dd>{product.dimensions}</dd></div><div><dt>Material</dt><dd>{product.material}</dd></div><div><dt>Reference</dt><dd>{variant?.sku ?? '—'}</dd></div></dl>{product.features.length > 0 && <ul>{product.features.map(f => <li key={f}>{f}</li>)}</ul>}</details><details><summary>Delivery and care <ChevronDown size={17}/></summary><p>Delivery options and times will be confirmed before launch. See our <Link to="/care">care guide</Link> and <Link to="/policies/shipping">delivery information</Link>.</p></details></div>
      </div></div>
    <section className="related-section container-wide"><div className="section-heading"><div><span className="eyebrow">KEEP EXPLORING</span><h2>More to <em>discover</em></h2></div><Link className="text-link" to="/collections">All pieces <ArrowRight size={18}/></Link></div><div className="product-grid">{related.map(p => <ProductCard key={p.id} product={p}/>)}</div></section>
    <div className="container-wide back-link"><Link to={`/collections/${product.category}`}><ArrowLeft size={18}/> Back to {categoryNames[product.category]}</Link></div>
  </>
}
