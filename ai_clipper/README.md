# Product Clipper Chrome Extension

A modern Chrome extension for clipping products from any website with AI-powered data extraction.

## Quick Start

### Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this folder

### First Use

1. Click the extension icon
2. Login with your credentials
3. Navigate to any product page
4. Click "Smart fill from current page"
5. Review and save the product

## Features

- 🔐 Secure authentication with token management
- 🎯 Smart data extraction from any webpage
- 🖼️ Automatic image detection and selection
- 💾 Direct API integration for product saving
- ⚙️ Settings page with logout functionality

## API Configuration

Base URL: `http://127.0.0.1:8000`

### Endpoints

- `POST /user/login/` - Authentication
- `POST /api/scrape/` - Process scraped data
- `POST /api/products/save/` - Save product

## Development

Built with:
- Manifest V3
- Vanilla JavaScript
- Modern CSS with animations
- Chrome Storage API

## Support

For issues or questions, check the console logs:
- Extension popup: Right-click → Inspect
- Background worker: chrome://extensions/ → Service worker

---

Made with ❤️ for efficient product clipping
