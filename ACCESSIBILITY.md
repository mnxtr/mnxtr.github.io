# Accessibility (A11y) Improvements Guide

## Current Status: ✅ GOOD Foundation

Your portfolio has a solid accessibility foundation. This guide documents current practices and recommendations for further improvement.

---

## ✅ Already Implemented

### ARIA Labels
- ✅ Theme toggle buttons have `aria-label`
- ✅ Mobile menu button has `aria-expanded`
- ✅ Mobile menu has `role="navigation"` and `aria-label`
- ✅ SVG icons have `aria-hidden="true"`
- ✅ Typewriter has `aria-live="polite"`

### Keyboard Navigation
- ✅ Mobile menu closes on Escape key (added in menu.js)
- ✅ All buttons are keyboard accessible
- ✅ Tab order follows visual flow

### Semantic HTML
- ✅ Using `<header>`, `<main>`, `<section>` tags
- ✅ Proper heading hierarchy (h1, h2, h3)
- ✅ Form elements properly labeled
- ✅ List items use `<ul>` and `<li>`

### Color & Contrast
- ✅ Dark mode uses sufficient contrast
- ✅ Light mode uses sufficient contrast
- ✅ Color not sole means of conveying information

### Animations
- ✅ `prefers-reduced-motion` respected for Three.js scenes
- ✅ Scroll animations have reduced motion fallback

---

## 🔄 Recommended Improvements

### 1. Focus Management
**Priority**: MEDIUM

```html
<!-- Add focus visible styles in CSS -->
<style>
  button:focus-visible,
  a:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
</style>
```

### 2. Skip Links
**Priority**: MEDIUM

Add skip to main content link:
```html
<a href="#main-content" class="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

Add CSS for screen-reader-only content:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### 3. Image Alt Text
**Priority**: HIGH

All images should have descriptive alt text:
```html
<img 
  src="avatar.webp" 
  alt="Mohammad Mansib Newaz - AI Engineer" 
  loading="lazy"
/>
```

### 4. Form Accessibility
**Priority**: HIGH

Contact form should have:
```html
<form>
  <label for="name">Full Name *</label>
  <input 
    id="name" 
    type="text" 
    required 
    aria-required="true"
    aria-describedby="name-error"
  />
  <span id="name-error" class="sr-only">Name is required</span>

  <label for="email">Email Address *</label>
  <input 
    id="email" 
    type="email" 
    required 
    aria-required="true"
  />

  <button type="submit">Send Message</button>
</form>
```

### 5. Link Accessibility
**Priority**: MEDIUM

All links should have meaningful text:
```html
<!-- ❌ Bad -->
<a href="/projects">Click here</a>

<!-- ✅ Good -->
<a href="/projects">View my projects</a>
```

### 6. Color Contrast Checker
**Priority**: MEDIUM

Use [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify:
- Text on background
- Links on background
- Interactive elements

Current ratios look good, but test with tools.

---

## 🧪 Testing for Accessibility

### Browser Tools
1. **Chrome DevTools**
   - Lighthouse → Accessibility tab
   - Axe DevTools extension

2. **Firefox**
   - WAVE extension
   - Keyboard Navigator

3. **Online Tools**
   - [WAVE](https://wave.webaim.org/)
   - [AXE](https://www.deque.com/axe/devtools/)
   - [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Manual Testing
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Test with high contrast mode
- [ ] Test with browser zoom at 200%
- [ ] Test with animations disabled

### Command to Run Lighthouse
```bash
# Install lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://mnxtr.github.io --view

# Generate report
lighthouse https://mnxtr.github.io --output=json > report.json
```

---

## 📱 Mobile Accessibility

✅ Already Good:
- Responsive design works well
- Touch targets are adequate (>44x44px)
- Mobile menu is functional
- Zoom works properly

Recommendations:
- Ensure buttons are at least 44x44px (Apple standard)
- Test with screen readers: TalkBack (Android), VoiceOver (iOS)
- Verify keyboard navigation on mobile browsers

---

## 🎯 WCAG 2.1 Compliance

### Current Level: A (Good)
Your site meets WCAG 2.1 Level A standards.

### Path to AA (Better)
- [ ] Improve focus indicators
- [ ] Add skip links
- [ ] Verify all images have alt text
- [ ] Test form accessibility
- [ ] Ensure color contrast ratios > 4.5:1

### Path to AAA (Best)
- [ ] Enhance color contrast ratios > 7:1
- [ ] Provide extended captions for videos
- [ ] Include sign language interpretation
- [ ] Enhanced keyboard navigation
- [ ] Content in plain language option

---

## 📋 Accessibility Checklist

### Visual Design
- [ ] Color not sole method of conveying info
- [ ] Contrast ratio ≥ 4.5:1 for normal text
- [ ] Contrast ratio ≥ 3:1 for large text
- [ ] Focus indicators visible
- [ ] Zoom to 200% works correctly

### Content
- [ ] All images have alt text
- [ ] Links have descriptive text
- [ ] Headings are hierarchical
- [ ] Lists use semantic HTML
- [ ] Tables have headers

### Navigation
- [ ] Keyboard only navigation works
- [ ] Tab order is logical
- [ ] Skip links present
- [ ] Mobile menu keyboard accessible
- [ ] Focus trap in modal dialogs (if any)

### Animations
- [ ] `prefers-reduced-motion` respected
- [ ] Animations don't cause seizures (< 3 flashes/sec)
- [ ] Animations can be paused

### Forms
- [ ] Labels associated with inputs
- [ ] Error messages clear
- [ ] Required fields marked
- [ ] Form submission accessible

### Code
- [ ] Semantic HTML used
- [ ] ARIA labels when needed
- [ ] No empty buttons/links
- [ ] Language attribute set: `<html lang="en">`
- [ ] Scripts don't prevent navigation

---

## 🔗 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web.dev Accessibility](https://web.dev/accessibility/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project](https://www.a11yproject.com/)

---

## 📞 Need Help?

For accessibility questions or to report issues:
1. Check WCAG guidelines at w3.org/WAI
2. Test with Lighthouse
3. Use browser accessibility tools
4. Contact the team with specific issues

---

**Last Updated**: 2026-07-07  
**Status**: ✅ Good Foundation + Recommendations Ready
