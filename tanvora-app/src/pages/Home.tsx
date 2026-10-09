import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Collection } from './Collection'

export function Home() {
  return <>
    <section className="gallery-hero" aria-labelledby="home-title">
      <div className="gallery-hero-image" role="img" aria-label="Illustrative leather shoulder bag on a stone plinth" />
      <div className="gallery-hero-inner container-wide">
        <div className="gallery-hero-copy">
          <h1 id="home-title">Objects for<br/>everyday life</h1>
          <span className="eyebrow">CRAFTED TO GO FURTHER</span>
          <Link className="button button-accent" to="/collections">View collection <ArrowRight size={18}/></Link>
        </div>
      </div>
    </section>
    <Collection embedded />
    <section className="gallery-story container-wide">
      <div className="gallery-story-visual" role="img" aria-label="Illustrative leather goods detail" />
      <div className="gallery-story-copy"><span className="eyebrow">THE TANVORA STORY</span><h2>Considered pieces for the everyday.</h2><p>A growing collection shaped around useful details, timeless forms and the way we move.</p><Link className="text-link" to="/story">Discover our story <ArrowRight size={18}/></Link></div>
    </section>
  </>
}
