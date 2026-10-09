import { useState, type FormEvent } from 'react'
import { ArrowRight, ArrowUpRight, Check, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Story() {
  return <div className="editorial-page"><div className="editorial-hero container-wide"><div><span className="eyebrow">TANVORA / OUR STORY</span><h1>Designed to be<br/><em>carried forward.</em></h1><p>A brand taking shape around everyday movement, useful details, and a quiet sense of character.</p></div><div className="editorial-image story-image" role="img" aria-label="Illustrative leather bag design"/></div><section className="editorial-copy container-narrow"><span className="eyebrow">A NEW PERSPECTIVE</span><h2>The pieces we reach for say something about us.</h2><p>TANVORA is developing a considered collection of leather bags and wallets for life in motion. The name takes a subtle cue from leather’s warm tones, while leaving room for the stories its owners will make their own.</p><p>We believe an everyday piece should feel good to use and easy to live with. The final sourcing, material and manufacturing details will be published here once they have been verified.</p><Link className="text-link" to="/collections">Explore the collection <ArrowUpRight size={18}/></Link></section></div>
}

export function Care() {
  return <div className="simple-page container-narrow"><span className="eyebrow">TANVORA / GUIDANCE</span><h1>Care for what<br/><em>you carry.</em></h1><p className="lead">These are general care principles. Always follow the instructions supplied with your actual product and test any treatment on a discreet area first.</p><div className="care-list"><article><span>01</span><div><h2>Clean gently</h2><p>Remove loose dust with a soft dry cloth. Avoid harsh chemicals, soaking, or aggressive rubbing.</p></div></article><article><span>02</span><div><h2>Keep its shape</h2><p>Store bags away from direct sun and heat. Fill them lightly with clean paper while they are not in use.</p></div></article><article><span>03</span><div><h2>Let it breathe</h2><p>If a leather item gets damp, blot it gently and allow it to air dry naturally. Avoid direct heat.</p></div></article></div><Link className="text-link" to="/contact">Ask a care question <ArrowRight size={18}/></Link></div>
}

export function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const enabled = import.meta.env.VITE_ENQUIRY_FORM_ENABLED === 'true'
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    setStatus('sending')
    try {
      const response = await fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(values)) })
      if (!response.ok) throw new Error('Request failed')
      form.reset()
      setStatus('sent')
    } catch { setStatus('error') }
  }
  return <div className="contact-page container-wide"><div className="contact-intro"><span className="eyebrow">TANVORA / GET IN TOUCH</span><h1>Let’s start a<br/><em>conversation.</em></h1><p>For product questions, collaborations, or anything else, send us a note.</p><div className="contact-rule"/><p className="contact-muted">Business contact details and response hours will appear here when confirmed.</p></div><div className="contact-form-panel"><span className="eyebrow">SEND AN ENQUIRY</span>{enabled ? <form onSubmit={submit}><label>Your name <input name="name" required maxLength={100} autoComplete="name" /></label><label>Email address <input name="email" type="email" required maxLength={254} autoComplete="email" /></label><label>Product reference <input name="reference" maxLength={100} placeholder="Optional" /></label><label>Message <textarea name="message" required minLength={10} maxLength={2000} rows={5} /></label><input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" /><button className="button button-dark" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send enquiry'} <ArrowUpRight size={18}/></button><p className="form-status" role="status">{status === 'sent' ? <><Check size={16}/> Your message was received.</> : status === 'error' ? 'We could not send your message. Please try again later.' : 'We will use your details to respond to this enquiry.'}</p></form> : <div className="contact-pending"><Mail size={32} strokeWidth={1.3}/><h2>Contact channel coming soon</h2><p>The enquiry form will be enabled when the business inbox and secure submission service are connected.</p><Link className="text-link" to="/collections">Browse the collection <ArrowRight size={18}/></Link></div>}</div></div>
}

const policies = {
  shipping: { title: 'Delivery', copy: 'Delivery regions, charges, and estimated times will be published after the service is confirmed. Contact us before making a purchase decision.' },
  returns: { title: 'Returns', copy: 'The returns and exchanges policy is being finalised. The applicable terms will be available here before orders are accepted.' },
  privacy: { title: 'Privacy', copy: 'The privacy notice will describe how enquiries and contact details are handled before the website begins collecting personal information.' },
}

export function Policy({ type }: { type: keyof typeof policies }) {
  const policy = policies[type]
  return <div className="simple-page container-narrow"><span className="eyebrow">TANVORA / INFORMATION</span><h1>{policy.title}</h1><p className="lead">{policy.copy}</p><Link className="text-link" to="/contact">Contact TANVORA <ArrowRight size={18}/></Link></div>
}

export function NotFound() { return <div className="simple-page container-narrow"><span className="eyebrow">404 / PAGE NOT FOUND</span><h1>Lost your <em>way?</em></h1><p className="lead">This page does not exist.</p><Link className="button button-dark" to="/">Return home <ArrowRight size={18}/></Link></div> }
