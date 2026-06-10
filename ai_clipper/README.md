# Focuspilot Product Clipper — Chrome Extension

A Chrome extension for clipping products from any website into **Focuspilot** with AI-powered data extraction.

## Quick Start

### Installation

1. Build the extension (creates a loadable `dist/` folder):

   ```powershell
   cd ai_clipper
   .\build.ps1
   ```

2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the **`ai_clipper/dist`** folder (not the zip in `releases/`)

> **Note:** Load `dist/` — it contains `manifest.json`. The zip in `releases/` is for sharing only.

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

Base URL: `https://api.focuspilot.io` (local dev: `http://127.0.0.1:8000` — uncomment in `api.js`)

The extension sends `X-Client-Platform: mobile` on login so the API returns JWT tokens in the JSON body (the web app uses httpOnly cookies instead, which extensions cannot read).

### Endpoints

- `POST /user/login/` — Authentication (Bearer tokens)
- `POST /user/refresh/` — Token refresh
- `POST /clipper/extract_product_details/` — AI product extraction (requires `OPENAI_API_KEY` on server)
- `POST /clipper/save_product/` — Save product to studio library

### Production requirements (server)

| Requirement | Why |
|-------------|-----|
| Valid studio user email + password | Same credentials as app.focuspilot.io |
| User linked to a **studio** | Products save to `request.user.studio` |
| **`OPENAI_API_KEY`** on API server | Powers “Smart fill from current page” |
| **2FA** (optional) | After password, enter authenticator or backup code in-extension |
| `https://api.focuspilot.io` reachable | Set in `manifest.json` `host_permissions` |

No separate “extension API key” is needed — it uses your normal Focuspilot login.

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

Focuspilot © 2026 · Product clipping for design studios
