# Viora Favicons

## Overview

Favicon files for Viora application optimized for different screen sizes and devices.

### Files

- **favicon-16x16.png** - Small favicon for browser tabs and small devices
- **favicon-32x32.png** - Medium favicon for browser address bar and favicon displays

### Design

Simple, clean icon concept:
- **Icon**: Circular design with clarity point
- **Colors**: Viora blue (#2563eb) with white accent (#ffffff)
- **Usage**: Mobile screens, browser tabs, bookmarks, shortcuts

### Generation

The favicons are generated from an SVG template using the `sharp` image processing library.

To regenerate favicons (if the design changes), run:

```bash
npm run build:favicons
```

This command:
1. Reads the SVG template from `scripts/generate-favicons.js`
2. Converts to PNG at 16×16 resolution
3. Converts to PNG at 32×32 resolution
4. Saves files to `frontend/public/favicons/`

### Integration

The favicon references are in `frontend/index.html`:

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
```

### Future Variants

If needed, additional favicon sizes can be added:
- **favicon-48x48.png** - Windows taskbar, pinned sites
- **favicon-192x192.png** - Android home screen
- **favicon-512x512.png** - PWA splash screens
- **apple-touch-icon.png** - iOS Safari bookmarks

Update `scripts/generate-favicons.js` to include additional size conversions.

### Notes

- Favicons do **not** support dark mode variants (they're designed to work on any background)
- The blue circle with white point maintains visibility on both light and dark browser interfaces
- File sizes are minimal (< 1KB each due to simple design)
