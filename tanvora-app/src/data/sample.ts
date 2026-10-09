import type { Product } from '../types'

// Editorial placeholders. Replace with verified inventory before a public launch.
export const sampleProducts: Product[] = [
  {
    id: 'sample-1', slug: 'the-atelier-tote', name: 'The Atelier Tote', category: 'womens-bags',
    material: 'Leather concept', description: 'A considered everyday silhouette, pictured here as a design concept. Final materials and construction are to be confirmed.',
    dimensions: 'Sample dimensions pending', features: ['Spacious main compartment', 'Everyday carry silhouette'],
    imageIndex: 0, featured: true,
    variants: [{ id: 'sample-1-a', sku: 'SAMPLE-TOTE-CGN', colour: 'Cognac', hex: '#9e592d', priceBdt: 7800, available: true }, { id: 'sample-1-b', sku: 'SAMPLE-TOTE-ESP', colour: 'Espresso', hex: '#3b261e', priceBdt: 7800, available: true }],
  },
  {
    id: 'sample-2', slug: 'the-commuter-brief', name: 'The Commuter Brief', category: 'mens-bags',
    material: 'Leather concept', description: 'A clean lined brief for the working day. This photograph and specification are illustrative, pending a real product catalogue.',
    dimensions: 'Sample dimensions pending', features: ['Structured profile', 'Carry handles'],
    imageIndex: 1, featured: true,
    variants: [{ id: 'sample-2-a', sku: 'SAMPLE-BRIEF-ESP', colour: 'Espresso', hex: '#32231e', priceBdt: 11200, available: true }],
  },
  {
    id: 'sample-3', slug: 'the-fold-wallet', name: 'The Fold Wallet', category: 'wallets',
    material: 'Leather concept', description: 'An uncomplicated wallet concept designed for a slim daily carry. Final details to be confirmed.',
    dimensions: 'Sample dimensions pending', features: ['Bifold shape', 'Compact silhouette'],
    imageIndex: 2, featured: true,
    variants: [{ id: 'sample-3-a', sku: 'SAMPLE-FOLD-CHO', colour: 'Chocolate', hex: '#633923', priceBdt: 2800, available: true }],
  },
  {
    id: 'sample-4', slug: 'the-arc-crossbody', name: 'The Arc Crossbody', category: 'womens-bags',
    material: 'Leather concept', description: 'A softly curved crossbody concept with a practical, compact form. Final product details to be verified.',
    dimensions: 'Sample dimensions pending', features: ['Adjustable strap concept', 'Compact day bag'],
    imageIndex: 3, featured: true,
    variants: [{ id: 'sample-4-a', sku: 'SAMPLE-ARC-TAN', colour: 'Tan', hex: '#b66d35', priceBdt: 6900, available: true }],
  },
]

export const categoryNames = { 'mens-bags': "Men’s Bags", 'womens-bags': "Women’s Bags", wallets: 'Wallets' } as const
export const money = (value: number) => `৳${new Intl.NumberFormat('en-BD').format(value)}`
