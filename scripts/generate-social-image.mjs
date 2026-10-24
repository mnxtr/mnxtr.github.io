import sharp from 'sharp';
// A deterministic graphic built from the site's text and palette, not a product screenshot.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#030507"/>
<path d="M64 128H1136M64 524H1136" stroke="#34473f"/>
<text x="64" y="86" fill="#edf7f2" font-family="DejaVu Sans Mono,monospace" font-size="32" font-weight="bold">MNXTR<tspan fill="#73f6d2">_</tspan></text>
<text x="1136" y="84" text-anchor="end" fill="#a5b5b0" font-family="DejaVu Sans,sans-serif" font-size="20">AI / AUTOMATION</text>
<text x="64" y="244" fill="#edf7f2" font-family="DejaVu Sans Mono,monospace" font-size="62" font-weight="bold">Practical AI for your</text>
<text x="64" y="328" fill="#73f6d2" font-family="DejaVu Sans Mono,monospace" font-size="62" font-weight="bold">business workflows.</text>
<text x="64" y="416" fill="#a5b5b0" font-family="DejaVu Sans,sans-serif" font-size="25">Workflow automation · Knowledge assistants · AI integrations</text>
<text x="64" y="575" fill="#edf7f2" font-family="DejaVu Sans,sans-serif" font-size="24">Mohammad Mansib Newaz</text>
<text x="1136" y="575" text-anchor="end" fill="#73f6d2" font-family="DejaVu Sans Mono,monospace" font-size="22">mnxtr.github.io</text>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile('public/img/portfolio-social.png');
console.log('Generated 1200 × 630 social preview.');
