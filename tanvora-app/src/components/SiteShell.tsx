import { useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

const links = [
  { label: 'Shop', to: '/collections' },
  { label: 'About', to: '/story' },
  { label: 'Care', to: '/care' },
  { label: 'Contact', to: '/contact' },
]

export function SiteShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return <>
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus() }}>Skip to content</a>
    <header className="site-header">
      <div className="header-inner container-wide">
        <button className="icon-button mobile-menu-button" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)} aria-label="Tanvora home">TANVORA</Link>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          {links.map(link => <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>{link.label}</NavLink>)}
        </nav>
        <div className="header-actions"><Link to="/collections" aria-label="Search collection" className="icon-button"><Search size={19} strokeWidth={1.6} /></Link><span className="header-tagline">TIMELESS LEATHER GOODS<br/>FOR A MORE MEANINGFUL EVERYDAY</span></div>
      </div>
    </header>
    <main id="main" tabIndex={-1} key={location.pathname}><Outlet /></main>
    <footer className="site-footer">
      <div className="container-wide footer-top">
        <div className="footer-brand"><div className="stamp" aria-label="Tanvora leather goods emblem"><span className="stamp-top">TANVORA</span><span className="stamp-t">T</span><span className="stamp-bottom">LEATHER GOODS</span></div><p>Objects for the way you move.</p></div>
        <div className="footer-column"><h2>Explore</h2><Link to="/collections">All pieces</Link><Link to="/collections/womens-bags">Women’s bags</Link><Link to="/collections/mens-bags">Men’s bags</Link><Link to="/collections/wallets">Wallets</Link></div>
        <div className="footer-column"><h2>Discover</h2><Link to="/story">Our story</Link><Link to="/care">Leather care</Link><Link to="/contact">Contact</Link></div>
        <div className="footer-column"><h2>Information</h2><Link to="/policies/shipping">Delivery</Link><Link to="/policies/returns">Returns</Link><Link to="/policies/privacy">Privacy</Link></div>
      </div>
      <div className="container-wide footer-bottom"><span>© {new Date().getFullYear()} TANVORA. An evolving collection.</span><span>Designed for everyday movement</span></div>
    </footer>
  </>
}
