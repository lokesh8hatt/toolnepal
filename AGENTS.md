# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

ToolNepal is a static website providing free browser-based tools for Nepali users. All tools run client-side with no server uploads. The site uses vanilla HTML/CSS/JavaScript with no build system.

## Development

**Running locally:** Open any `.html` file directly in a browser. No build or server required.

**Testing changes:** Refresh the browser. For theme testing, toggle via the moon icon or `tnToggleTheme()` in console.

## Architecture

### Layout System
The header and footer are injected dynamically by `main.js` via `tnInjectLayout()`. Pages include placeholder divs:
```html
<div id='siteHeader'></div>
<!-- page content -->
<div id='siteFooter'></div>
```

### Path Conventions
- Root pages (`index.html`, `tools.html`): use `assets/css/style.css`
- Tool pages in `/tools/`: use `../assets/css/style.css`
- Nested tools in `/tools/pdf/`: use `../../assets/css/style.css`

The `tnBasePath()` function handles relative paths for navigation links.

### Global Utilities (main.js)
- `tnToast(message, hint)` - Show toast notification
- `tnOpenModal(title, bodyHtml)` / `tnCloseModal()` - Modal dialogs
- `tnToggleTheme()` - Toggle dark/light mode (persisted in localStorage as `tn_theme`)
- `escapeHtml(s)` - XSS protection for user input

### Tool Utilities (tools.js)
Shared functions for calculators and tools: `clamp()`, `fmt2()`, `bytesToSize()`, `tnCopyToClipboard(id)`.

Tool-specific functions are prefixed: `tnCgpa*`, `tnPer*`, `tnWord*`, `tnPassword*`, `tnImg*`.

### CSS Design System (style.css)
Key CSS custom properties in `:root` and `[data-theme="dark"]`:
- Colors: `--bg`, `--panel`, `--text`, `--muted`, `--red-500/600/700`
- Spacing: `--s3` through `--s7`
- Radii: `--radius-sm`, `--radius`, `--radius-lg`

Component classes: `.card`, `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.input`, `.result`, `.tool-card`, `.toast`, `.modal`

### External Libraries
- `assets/js/vendor/qrcode.min.js` - QR code generation (bundled)
- `pdf-lib` loaded from CDN in PDF tool pages

## Adding a New Tool

1. Create HTML file in `tools/` (or `tools/pdf/` for PDF tools)
2. Use correct relative paths for assets
3. Include scripts: `main.js` (required), `tools.js` (if using shared utilities), tool-specific JS
4. Follow existing tool structure: `.split` layout with `.card` main area and `.sidebar` aside
5. Add tool link to `tools.html` grid

## File Structure

```
/
├── index.html, tools.html, about.html, contact.html
├── assets/
│   ├── css/style.css          # All styles
│   ├── js/
│   │   ├── main.js            # Layout, theme, toast, modal
│   │   ├── tools.js           # Shared tool utilities
│   │   ├── qr.js              # QR generator logic
│   │   ├── analytics.js       # Analytics tracking
│   │   └── vendor/            # Third-party libraries
│   └── img/logo.svg
└── tools/
    ├── *.html                 # Individual tools
    └── pdf/*.html             # PDF-related tools
```
