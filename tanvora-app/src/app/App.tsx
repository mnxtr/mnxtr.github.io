import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { CatalogProvider } from '../features/catalog/catalog'
import { SiteShell } from '../components/SiteShell'
import { Home } from '../pages/Home'
import { Collection } from '../pages/Collection'
import { Product } from '../pages/Product'
import { Care, Contact, NotFound, Policy, Story } from '../pages/Editorial'

export default function App() {
  const Router = import.meta.env.BASE_URL === '/' ? BrowserRouter : HashRouter
  return <Router><CatalogProvider><Routes><Route element={<SiteShell />}><Route path="/" element={<Home />} /><Route path="/collections" element={<Collection />} /><Route path="/collections/:category" element={<Collection />} /><Route path="/products/:slug" element={<Product />} /><Route path="/story" element={<Story />} /><Route path="/care" element={<Care />} /><Route path="/contact" element={<Contact />} /><Route path="/policies/shipping" element={<Policy type="shipping" />} /><Route path="/policies/returns" element={<Policy type="returns" />} /><Route path="/policies/privacy" element={<Policy type="privacy" />} /><Route path="*" element={<NotFound />} /></Route></Routes></CatalogProvider></Router>
}
