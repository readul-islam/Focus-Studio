import { HelpArticle } from '../types';

export const libraryArticles: HelpArticle[] = [
  {
    slug: "library-overview",
    title: "Library Overview",
    description: "Understanding your products and materials library",
    category: "library",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Library Overview

Your Focuspilot Library is your curated collection of products and materials — the design resources you use across projects.

## What's in the Library?

### Products

Physical items you specify for projects:

- Furniture
- Lighting
- Hardware
- Accessories
- Fixtures

### Materials

Surface finishes and materials:

- Fabrics
- Wallcoverings
- Flooring
- Paint colours
- Tile and stone

## Why Use the Library?

- **Centralized catalog** — All your go-to products in one place
- **Quick access** — Search and add to projects instantly
- **Consistent data** — Product details, pricing, lead times stored
- **AI-powered** — Use AI Clipper to add products from any website
- **Procurement integration** — Add library items to project procurement

## Accessing the Library

Click **Library** in the sidebar to access:

- **Products** — Your product catalog
- **Materials** — Your materials database

## Library Views

### Grid View

Visual grid showing product images. Best for browsing.

### List View

Detailed list with product data (name, supplier, price, etc.). Best for searching.

### Favorites

Star products you use frequently to access them quickly.

## Adding to Library

### Manually

1. Click **+ Add Product** or **+ Add Material**
2. Enter details (name, supplier, price, etc.)
3. Upload image
4. Save

### Via AI Clipper

Use the Chrome extension:

1. Browse a product page online
2. Click Focuspilot extension icon
3. Click **Clip Product**
4. Product is added to your library automatically

The AI extracts product details, pricing, and images.

### Import from Spreadsheet

Bulk import products:

1. Click **Import**
2. Upload CSV with product data
3. Map columns
4. Import

## Using Library Items in Projects

Add library items to projects:

### To Procurement

1. Go to project → **Procurement** tab
2. Click **Add from Library**
3. Select products
4. Enter quantities
5. Add to procurement list

### To Project Docs

Attach product spec sheets to project documents for reference.

## Best Practices

- **Curate regularly** — Add new discoveries to library
- **Keep data current** — Update pricing and availability
- **Use tags** — Tag products by style, room type, price range
- **Add notes** — Document lead times, rep contacts, installation notes
- **Leverage AI Clipper** — Save time with automated product capture

Your library is your design toolkit — build it thoughtfully.`,
    screenshots: ["library/library-overview.png"],
    related: ["adding-products", "materials", "ai-clipper-overview"],
  },
  {
    slug: "adding-products",
    title: "Adding Products",
    description: "Manual product entry and using the AI Clipper",
    category: "library",
    readTime: 5,
    lastUpdated: "2026-02-27",
    content: `# Adding Products

Build your product library manually or use the AI Clipper for instant product capture.

## Manual Product Entry

### Step-by-Step

1. Go to **Library** → **Products**
2. Click **+ Add Product**
3. Fill in product details:
   - **Product Name**
   - **Supplier/Brand**
   - **Category** (Furniture, Lighting, etc.)
   - **Price** — Unit price
   - **Currency**
   - **Lead Time** — Days/weeks to delivery
   - **SKU** — Supplier product code
   - **Description** — Product details
   - **URL** — Link to product page
4. **Upload Image** — Drag and drop product photo
5. Click **Save**

Product is now in your library.

### Product Categories

Organize products by category:

- Furniture
- Lighting
- Accessories
- Hardware
- Textiles
- Fixtures
- Appliances
- Custom

Assign categories to make products searchable.

### Tags

Add tags for further organization:

- Style tags (Modern, Traditional, Industrial)
- Room tags (Living Room, Kitchen, Bedroom)
- Price range tags (Budget, Mid-range, High-end)
- Client tags (Client-approved, Sample requested)

Filter library by tags.

## Using AI Clipper

The AI Clipper Chrome extension automates product capture from any website.

### Installing AI Clipper

1. Go to **Help** page (or directly to Chrome Web Store)
2. Download Focuspilot AI Clipper extension
3. Install in Chrome
4. Log in with your Focuspilot account

### Clipping a Product

1. Browse to any product page online (e.g., retailer, manufacturer website)
2. Click the **Focuspilot extension icon** in Chrome toolbar
3. AI automatically detects:
   - Product name
   - Price
   - Images
   - Description
   - Supplier
4. Review extracted data
5. Click **Add to Library**

Product is added to your Focuspilot library instantly.

### What the AI Captures

The AI extracts:

- Product title and description
- All product images
- Pricing (current price, original price if on sale)
- Supplier/brand name
- Product URL
- SKU/product code (if available)
- Dimensions (if listed)
- Color/finish options

### Editing Clipped Products

After clipping:

1. Go to **Library** → **Products**
2. Find the clipped product
3. Click to open
4. Edit any details as needed
5. Save

You can refine AI-captured data.

## Product Images

### Uploading Images

- Drag and drop images into the product form
- Multiple images supported (add lifestyle shots, detail shots)
- First image becomes the primary image

### Image Requirements

- **Format:** JPG, PNG, or WebP
- **Size:** Max 5MB per image
- **Recommended resolution:** 1000px × 1000px or larger

## Product Details

### Essential Fields

- **Name** — Clear, descriptive
- **Supplier** — Brand or retailer
- **Price** — Current unit price
- **Category** — For filtering

### Optional Fields

- **SKU** — Helpful for ordering
- **Lead Time** — Know when it can arrive
- **Description** — Specifications, materials, features
- **Dimensions** — Width × Depth × Height
- **Color/Finish** — Available options
- **Installation Notes** — Special requirements

## Bulk Import

Import many products at once:

1. Prepare a CSV file with columns:
   - Product Name
   - Supplier
   - Category
   - Price
   - SKU
   - URL
   - Image URL (if hosted online)
2. Go to **Library** → **Products**
3. Click **Import**
4. Upload CSV
5. Map CSV columns to Focuspilot fields
6. Review and import

Great for migrating from spreadsheets or old systems.

## Best Practices

- **Use AI Clipper** — Save time vs. manual entry
- **Add lead times** — Critical for project planning
- **Upload multiple images** — Context photos help team understand products
- **Tag thoughtfully** — Good tagging makes products findable
- **Keep prices current** — Update when prices change
- **Link to source** — Always save product URL for reordering

Your product library grows over time — build it consistently.`,
    screenshots: [
      "library/add-product.png",
      "library/ai-clipper-action.png",
      "library/product-detail.png",
    ],
    related: ["library-overview", "ai-clipper-overview", "project-procurement"],
  },
  {
    slug: "materials",
    title: "Materials",
    description: "Managing your materials library",
    category: "library",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# Materials

The Materials section of your library stores finishes, fabrics, and surface materials you use in projects.

## What are Materials?

Materials are surface finishes and textiles:

- **Fabrics** — Upholstery, drapery, pillows
- **Wallcoverings** — Wallpaper, wall panels
- **Flooring** — Carpet, hardwood, tile, LVP
- **Paint** — Paint colours and finishes
- **Tile & Stone** — Countertops, backsplashes, flooring
- **Other** — Leather, metal finishes, etc.

## Adding a Material

1. Go to **Library** → **Materials**
2. Click **+ Add Material**
3. Fill in details:
   - **Material Name** (e.g., "Benjamin Moore White Dove OC-17")
   - **Type** (Fabric, Paint, Tile, etc.)
   - **Supplier/Brand**
   - **Color/Finish**
   - **Price per Unit** (per yard, per sq ft, per gallon, etc.)
   - **SKU** — Product code
   - **Description** — Composition, care instructions
   - **Image** — Upload swatch photo
4. Save

## Material Types

Organize by type:

- Fabric
- Wallcovering
- Paint
- Flooring
- Tile
- Stone
- Metal
- Wood
- Other

## Material Details

### Essential Info

- **Name** — Descriptive (include colour, code)
- **Supplier** — Where to order
- **Type** — Category
- **Price** — Cost per unit

### Optional Info

- **Color Code** — Manufacturer colour code
- **Composition** — Material makeup (e.g., "100% Linen")
- **Width** — Fabric width (e.g., 54")
- **Pattern Repeat** — For wallcoverings and fabrics
- **Care Instructions** — Cleaning and maintenance
- **Lead Time** — Order to delivery time
- **Minimum Order** — MOQ if applicable

## Uploading Swatches

Add images of material swatches:

- Photograph physical samples
- Upload supplier images
- Multiple images supported (close-up, context shot)

Good imagery helps visualize materials in project planning.

## Using Materials in Projects

### Add to Procurement

1. Go to project → **Procurement**
2. Add material
3. Enter quantity (yards, sq ft, etc.)
4. Track ordering and delivery

### Attach to Docs

Add material spec sheets to project documents for contractor reference.

## Creating Material Collections

Group related materials:

1. Create a **Collection** (e.g., "Modern Neutral Palette")
2. Add materials to the collection
3. Use collections as quick palettes for projects

Collections are like mood boards for materials.

## Best Practices

- **Include colour codes** — Essential for accurate reordering
- **Photograph swatches** — Visual reference is critical
- **Note pattern repeat** — For calculating fabric/wallpaper quantities
- **Track lead times** — Plan procurement timelines
- **Organize by project or style** — Use collections for curation

Your materials library is your design palette — curate it with care.`,
    screenshots: ["library/materials-list.png", "library/material-detail.png"],
    related: ["library-overview", "adding-products", "project-procurement"],
  },
  {
    slug: "product-preview",
    title: "Product Preview",
    description: "How to use the product preview feature",
    category: "library",
    readTime: 2,
    lastUpdated: "2026-02-27",
    content: `# Product Preview

The Product Preview feature lets you view detailed product information quickly.

## Accessing Product Preview

### From Library

1. Go to **Library** → **Products**
2. Click any product card
3. Product preview panel opens

### From Procurement

1. Go to project → **Procurement**
2. Click any product
3. Preview opens with product details

## What's in the Preview?

### Product Images

- Primary image (large display)
- Additional images (thumbnail gallery)
- Click to zoom
- Navigate with arrows

### Product Details

- **Name** and **Supplier**
- **Price** and currency
- **SKU/Product Code**
- **Category** and **Tags**
- **Lead Time**
- **Description**
- **Dimensions**
- **Product URL** (link to source)

### Actions

- **Add to Procurement** — Add to project procurement
- **Edit Product** — Update product details
- **Duplicate** — Create a copy (useful for variants)
- **Delete** — Remove from library

## Quick Add to Procurement

From product preview:

1. Click **Add to Procurement**
2. Select project
3. Enter quantity
4. Confirm

Product is added to project procurement list.

## Editing from Preview

Click **Edit** to update:

- Product details
- Images
- Pricing
- Tags

Changes save to your library.

## Sharing Products

Share product details with team or clients:

1. Open product preview
2. Click **Share** icon
3. Copy link or send via email

Recipients can view product details (if they have access).

## Best Practices

- **Use preview for quick reference** — No need to open full edit mode
- **Add to procurement directly** — Streamline workflow
- **Review details before ordering** — Double-check SKU, price, lead time

Product preview keeps you efficient — use it to move fast.`,
    screenshots: ["library/product-preview.png"],
    related: ["adding-products", "project-procurement", "library-overview"],
  },
];
