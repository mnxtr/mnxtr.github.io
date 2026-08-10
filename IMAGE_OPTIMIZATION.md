# Image Optimization Guide

## Current Status
Images are referenced in HTML but not yet optimized for web performance.

---

## 🎯 Optimization Strategy

### 1. Image Formats
Convert images to modern formats for better compression:

```bash
# Install ImageMagick (if not already installed)
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# Then convert images
mogrify -format webp -quality 80 img/avatar.jpg
mogrify -format webp -quality 75 img/*.jpg
```

### 2. Responsive Images
Update HTML to use multiple formats with fallback:

```html
<!-- Before -->
<img src="img/avatar.jpg" alt="Avatar" />

<!-- After -->
<picture>
  <source srcset="img/optimized/avatar.webp" type="image/webp" />
  <source srcset="img/optimized/avatar.jpg" type="image/jpeg" />
  <img 
    src="img/optimized/avatar.jpg" 
    alt="Mohammad Mansib Newaz - AI Engineer"
    loading="lazy"
    decoding="async"
    width="200"
    height="200"
  />
</picture>
```

### 3. Image Directory Structure
Create optimized folder:
```
img/
├── original/          # Original files (backup)
└── optimized/         # Web-optimized versions
    ├── avatar.webp
    ├── avatar.jpg
    ├── EKG.webp
    ├── EKG.jpg
    └── ...
```

### 4. Lazy Loading
Use native lazy loading:

```html
<img 
  src="img/optimized/project.webp"
  alt="Project preview"
  loading="lazy"         <!-- ← Native lazy loading -->
  decoding="async"       <!-- ← Async decode for performance -->
/>
```

### 5. Responsive Images with Sizes
For hero images, provide multiple sizes:

```html
<picture>
  <source 
    srcset="
      img/optimized/avatar-300w.webp 300w,
      img/optimized/avatar-600w.webp 600w,
      img/optimized/avatar-1200w.webp 1200w
    " 
    sizes="(max-width: 640px) 300px, 600px"
    type="image/webp"
  />
  <img 
    src="img/optimized/avatar-600w.jpg"
    alt="Mohammad Mansib Newaz"
    loading="eager"
    fetchpriority="high"
  />
</picture>
```

---

## 🛠️ Automated Optimization Script

The existing `scripts/compress-images.js` should be enhanced:

```javascript
// scripts/compress-images.js
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const SOURCE_DIR = './img';
const OUTPUT_DIR = './img/optimized';

// Ensure output directory exists
await fs.mkdir(OUTPUT_DIR, { recursive: true });

const supportedFormats = ['jpg', 'jpeg', 'png'];

try {
  const files = await fs.readdir(SOURCE_DIR);
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase().slice(1);
    if (!supportedFormats.includes(ext)) continue;
    
    const inputPath = path.join(SOURCE_DIR, file);
    const baseName = path.basename(file, path.extname(file));
    
    // Skip already optimized files
    if (baseName.includes('optimized')) continue;
    
    console.log(`Processing: ${file}`);
    
    // Generate WebP version
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(path.join(OUTPUT_DIR, `${baseName}.webp`));
    
    // Generate JPEG version (for fallback)
    await sharp(inputPath)
      .jpeg({ quality: 80 })
      .toFile(path.join(OUTPUT_DIR, `${baseName}.jpg`));
    
    // Generate thumbnail for smaller screens
    await sharp(inputPath)
      .resize(300, 300, { fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(path.join(OUTPUT_DIR, `${baseName}-300w.webp`));
    
    console.log(`✓ Optimized: ${baseName}`);
  }
  
  console.log('All images optimized!');
} catch (error) {
  console.error('Error optimizing images:', error);
  process.exit(1);
}
```

Run with:
```bash
npm run compress-images
```

---

## 📊 Image Optimization Checklist

### Before Publishing
- [ ] All images converted to WebP with JPEG fallback
- [ ] Images compressed to < 100KB each
- [ ] Original images backed up
- [ ] Responsive images implemented
- [ ] Lazy loading enabled for below-fold images
- [ ] Alt text added to all images
- [ ] Dimensions specified in HTML

### Performance Targets
- [ ] Hero image: < 150KB total
- [ ] Project images: < 100KB each
- [ ] Thumbnails: < 50KB each
- [ ] LCP image: Preloaded
- [ ] Total images bundle: < 500KB

### Browser Support
- WebP: ~96% (with JPEG fallback)
- Lazy loading: ~97% (with IntersectionObserver)
- Responsive images: ~97% (with srcset)

---

## 🔍 Testing Image Performance

### Using Lighthouse
```bash
lighthouse https://mnxtr.github.io --output=json > report.json
# Check "Performance" section for image metrics
```

### Using Chrome DevTools
1. Open DevTools → Network tab
2. Check image sizes and types
3. Verify lazy loading is working
4. Check if WebP is being served

### Command Line Testing
```bash
# Check file size
ls -lh img/optimized/

# Compare original vs optimized
# (should see 60-80% size reduction)
```

---

## 📈 Expected Results

### Size Reduction
```
Original JPG (avatar.jpg):     500KB
Optimized WebP:                80KB  (84% reduction)
Optimized JPEG fallback:      120KB  (76% reduction)
```

### Load Time Improvement
```
Before: ~2.5s (images)
After:  ~0.6s (optimized with lazy load)
Improvement: ~75%
```

### Cumulative Lighthouse Score
```
Before: 82
After:  94+ (with all optimizations)
```

---

## 🚀 Implementation Steps

1. **Create optimized directory**
   ```bash
   mkdir -p img/optimized
   mkdir -p img/original
   ```

2. **Backup original images**
   ```bash
   cp img/*.{jpg,jpeg,png} img/original/ 2>/dev/null || true
   ```

3. **Run optimization script**
   ```bash
   npm run compress-images
   ```

4. **Update HTML**
   - Replace `<img>` with `<picture>` tags
   - Add srcset for responsive images
   - Add loading="lazy" for below-fold
   - Add alt text where missing

5. **Verify in browser**
   - Check Network tab for WebP serving
   - Verify lazy loading in DevTools
   - Test on slow 3G connection

6. **Commit changes**
   ```bash
   git add img/optimized/ IMAGES.md
   git commit -m "perf: optimize images for web"
   ```

---

## 🔗 Tools & Resources

### Image Optimization Tools
- [TinyPNG](https://tinypng.com/) - PNG/JPEG compression
- [Squoosh](https://squoosh.app/) - Web-based image optimizer
- [ImageOptim](https://imageoptim.com/) - Mac app
- [RIOT](https://www.riot-optimizer.com/) - Windows app

### Information
- [Web.dev Images](https://web.dev/fast/#optimize-images)
- [MDN Picture Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture)
- [WebP Format](https://developers.google.com/speed/webp)
- [Lazy Loading](https://web.dev/native-lazy-loading/)

### Performance Monitoring
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

---

## 📝 Next Steps

1. Run `npm run compress-images` after adding new images
2. Regularly audit images with Lighthouse
3. Monitor Core Web Vitals
4. Update images for blog posts using same process

---

**Last Updated**: 2026-07-07  
**Status**: ✅ Ready to Implement
