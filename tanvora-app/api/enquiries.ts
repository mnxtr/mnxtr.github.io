import type { IncomingMessage, ServerResponse } from 'node:http'
import { createClient } from '@supabase/supabase-js'

type Request = IncomingMessage & { body?: unknown }
type Payload = { name?: unknown; email?: unknown; reference?: unknown; message?: unknown; website?: unknown }

export default async function handler(req: Request, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }).end(JSON.stringify({ error: 'Method not allowed' })); return }
  if (Number(req.headers['content-length'] ?? 0) > 12000) { res.writeHead(413).end(JSON.stringify({ error: 'Request too large' })); return }
  const url = process.env.VITE_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!url || !secret || process.env.VITE_ENQUIRY_FORM_ENABLED !== 'true') { res.writeHead(503).end(JSON.stringify({ error: 'Enquiries are not available yet' })); return }
  let body: Payload
  try {
    if (req.body && typeof req.body === 'object') body = req.body as Payload
    else if (typeof req.body === 'string') body = JSON.parse(req.body) as Payload
    else { const chunks: Uint8Array[] = []; for await (const chunk of req) chunks.push(chunk); body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as Payload }
  } catch { res.writeHead(400).end(JSON.stringify({ error: 'Invalid request' })); return }
  if (body.website) { res.writeHead(200).end(JSON.stringify({ ok: true })); return }
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const reference = typeof body.reference === 'string' ? body.reference.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (name.length < 2 || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || reference.length > 100 || message.length < 10 || message.length > 2000) {
    res.writeHead(400).end(JSON.stringify({ error: 'Please check the form fields' })); return
  }
  try {
    const client = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } })
    const { error } = await client.from('enquiries').insert({ name, email, reference: reference || null, message })
    if (error) throw error
    res.writeHead(201).end(JSON.stringify({ ok: true }))
  } catch {
    res.writeHead(500).end(JSON.stringify({ error: 'Could not send the enquiry' }))
  }
}
