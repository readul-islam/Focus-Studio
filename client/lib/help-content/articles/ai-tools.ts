import { HelpArticle } from '../types';

export const aiToolsArticles: HelpArticle[] = [
  {
    slug: "ai-clipper-overview",
    title: "AI Clipper Overview",
    description: "What the AI Clipper does and how it works",
    category: "ai-tools",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# AI Clipper Overview

The Focuspilot AI Clipper is a Chrome extension that uses artificial intelligence to automatically extract product information from any website and add it to your Focuspilot library.

## What is the AI Clipper?

The AI Clipper is a browser extension that:

- **Detects products** on web pages
- **Extracts data** (name, price, images, specs)
- **Adds to your library** with one click
- **Works on any site** — retailers, manufacturers, etc.

## How It Works

### 1. You Browse

Visit any product page — furniture retailer, lighting manufacturer, accessory shop, etc.

### 2. AI Detects

The extension detects product information on the page using AI vision.

### 3. One-Click Capture

Click the Focuspilot extension icon. Product data is extracted instantly.

### 4. Review and Save

Review extracted data, make edits if needed, and add to your library or project.

## What the AI Extracts

- **Product name** and description
- **Price** (current price, sale price)
- **Images** (all product photos)
- **Supplier/brand** name
- **SKU/product code**
- **Dimensions** (if listed)
- **Color/finish** options
- **Product URL** (for reordering)

## Where Products Go

After clipping, you can send products to:

- **Library** — Add to your general product library
- **Project Procurement** — Add directly to a project's procurement list
- **AI Inbox** — Review later in your AI inbox

## Benefits

- **Save time** — No manual data entry
- **Accuracy** — AI extracts data precisely
- **Complete data** — Gets all images and specs
- **Works everywhere** — Any website with products

## Use Cases

### Sourcing Products

Browse suppliers online, clip products as you find them.

### Building Mood Boards

Clip products for project mood boards and design concepts.

### Client Presentations

Quickly assemble product selections for client review.

### Procurement

Add products directly to project procurement lists while sourcing.

## Requirements

- **Google Chrome browser**
- **Focuspilot account** (logged in)
- **Extension installed** (see Installing the AI Clipper article)

## Privacy & Security

- The AI Clipper only activates when you click it
- No browsing data is collected passively
- Product data is sent securely to your Focuspilot account
- Your browsing remains private

The AI Clipper is your design sourcing superpower — install it and save hours of manual work.`,
    screenshots: [
      "ai-tools/ai-clipper-icon.png",
      "ai-tools/clipper-action.png",
    ],
    related: ["installing-ai-clipper", "using-ai-clipper", "adding-products"],
  },
  {
    slug: "installing-ai-clipper",
    title: "Installing the AI Clipper",
    description: "Step-by-step Chrome extension installation guide",
    category: "ai-tools",
    readTime: 5,
    lastUpdated: "2026-02-27",
    content: `# Installing the AI Clipper

Install the Focuspilot AI Clipper Chrome extension to start clipping products from any website.

## Requirements

- **Google Chrome browser** (not supported in Safari, Firefox, or Edge)
- **Focuspilot account** (sign up at focuspilot.io if needed)

## Installation Steps

### 1. Download the Extension

Go to the **Help** page in Focuspilot and click **Download Extension**, or visit the Chrome Web Store and search for "Focuspilot AI Clipper".

A ZIP file will download to your computer.

### 2. Extract the ZIP File

Locate the downloaded ZIP file (usually in your Downloads folder) and extract it:

- **Mac:** Double-click the ZIP file
- **Windows:** Right-click → Extract All

You'll have a folder containing the extension files.

### 3. Open Chrome Extensions Page

In Google Chrome, navigate to:

**chrome://extensions/**

Or: Menu (⋮) → **Extensions** → **Manage Extensions**

### 4. Enable Developer Mode

In the top-right corner of the Extensions page, toggle **Developer mode** to ON.

This allows you to load unpublished extensions.

### 5. Load Unpacked Extension

1. Click **Load unpacked** button (top left)
2. Navigate to the extracted folder from step 2
3. Select the folder and click **Select**

The extension installs and appears in your extensions list.

### 6. Pin the Extension

1. Click the **puzzle icon** (🧩) in Chrome toolbar
2. Find **Focuspilot AI Clipper** in the list
3. Click the **pin icon** to pin it to your toolbar

The Focuspilot icon now appears in your Chrome toolbar for easy access.

### 7. Log In

1. Click the Focuspilot extension icon
2. Enter your Focuspilot email and password
3. Click **Log In**

You're now connected and ready to clip products.

## Verifying Installation

To confirm it's working:

1. Visit any product page (e.g., furniture retailer)
2. Click the Focuspilot extension icon
3. You should see product data detected

If the extension detects the product, you're all set.

## Troubleshooting

### Extension Not Appearing

- Ensure Developer mode is enabled
- Try reloading the extension (toggle off/on in Extensions page)
- Restart Chrome

### Login Issues

- Verify your Focuspilot credentials
- Ensure you have an active Focuspilot account
- Try logging in at focuspilot.io first, then retry extension login

### Product Not Detected

- Ensure you're on a product page (not a category or homepage)
- Try refreshing the page
- Some sites may not be compatible (rare)

### Chrome Only

The extension is **only compatible with Google Chrome**. It does not work in Safari, Firefox, Edge, or mobile browsers.

## Updating the Extension

When a new version is released:

1. Download the latest version from Focuspilot
2. Extract the new ZIP file
3. In Chrome Extensions page, click **Remove** on the old version
4. Load the new unpacked extension
5. Log in again

## Uninstalling

To remove the extension:

1. Go to **chrome://extensions/**
2. Find **Focuspilot AI Clipper**
3. Click **Remove**
4. Confirm removal

Your library products remain; only the extension is removed.

Once installed, the AI Clipper becomes an indispensable sourcing tool — happy clipping!`,
    screenshots: [
      "ai-tools/extension-download.png",
      "ai-tools/developer-mode.png",
      "ai-tools/load-unpacked.png",
      "ai-tools/pin-extension.png",
    ],
    related: ["ai-clipper-overview", "using-ai-clipper"],
  },
  {
    slug: "using-ai-clipper",
    title: "Using the AI Clipper",
    description: "How to clip a product and send it to your studio",
    category: "ai-tools",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Using the AI Clipper

Once installed, the AI Clipper makes product sourcing effortless.

## Clipping a Product

### Step 1: Browse to a Product Page

Visit any website with a product you want to capture:

- Furniture retailers (e.g., West Elm, CB2, Design Within Reach)
- Lighting brands (e.g., Lumens, Y Lighting)
- Accessories and decor sites
- Manufacturer websites

Make sure you're on an **individual product page** (not a category or search results page).

### Step 2: Click the Extension Icon

Click the **Focuspilot icon** in your Chrome toolbar.

The AI Clipper activates and scans the page.

### Step 3: AI Extracts Product Data

The AI automatically detects and extracts:

- Product name
- Price (current and sale price)
- All product images
- Description
- SKU/product code
- Supplier/brand
- Dimensions (if available)

You'll see a popup showing the extracted data.

### Step 4: Review and Edit

Review the extracted data:

- Confirm product name is correct
- Verify price
- Check images (select which to include)
- Add notes if needed

Edit any field if the AI missed something or you want to customise.

### Step 5: Choose Destination

Select where to send the product:

- **Add to Library** — Save to your general product library
- **Add to Project** — Send directly to a project's procurement list (select project from dropdown)
- **Send to Inbox** — Review later in your AI inbox

### Step 6: Clip

Click **Clip Product** button.

The product is instantly added to your selected destination.

You'll see a confirmation notification.

## Clipping Multiple Products

Source multiple products in one session:

1. Clip a product
2. Open a new tab or navigate to another product
3. Clip again
4. Repeat

All clipped products accumulate in your library or project.

## Reviewing Clipped Products

### In Library

Go to **Library** → **Products** to see all clipped products.

### In Project Procurement

Go to the project → **Procurement** tab to see products added to that project.

### In AI Inbox

Go to **AI** → **Inbox** to review products sent there.

## Editing Clipped Products

After clipping:

1. Go to the product in Library or Procurement
2. Click to open
3. Edit any details
4. Save

Refine AI-captured data as needed.

## Best Practices

- **Clip as you browse** — Don't wait; capture products immediately
- **Add notes** — Include lead time, rep contact, installation notes
- **Organize with tags** — Tag products by project, style, or room
- **Review in batches** — Clip many products, then review and refine

## Tips for Best Results

- **Use on desktop Chrome** — Mobile browsers not supported
- **Ensure you're logged in** — Check extension shows your studio name
- **Navigate to product detail pages** — AI works best on individual product pages
- **Refresh if needed** — If AI doesn't detect product, refresh the page and try again

## What If AI Misses Something?

If the AI doesn't capture a field:

- Manually add it in the review step
- Edit the product after clipping

The AI learns over time and improves accuracy.

The AI Clipper is your fastest path from product discovery to library — use it constantly.`,
    screenshots: [
      "ai-tools/clipper-popup.png",
      "ai-tools/clipper-review.png",
      "ai-tools/clipper-success.png",
    ],
    related: [
      "ai-clipper-overview",
      "installing-ai-clipper",
      "adding-products",
    ],
  },
  {
    slug: "ai-daily-brief",
    title: "AI Daily Brief",
    description: "Understanding your AI-generated daily project updates",
    category: "ai-tools",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# AI Daily Brief

The AI Daily Brief is an automatically generated summary of your studio's activity, priorities, and upcoming deadlines.

## What is the Daily Brief?

Each morning, Focuspilot AI scans your:

- Projects and tasks
- Calendar events
- Team activity
- Financial data
- Upcoming deadlines

It generates a personalized brief highlighting what matters most today.

## Where to Find It

The Daily Brief appears:

- **Top of your Dashboard** (first thing you see)
- **AI** → **Daily Brief** page (for historical briefs)

## What's in the Brief?

### Today's Priorities

Top 3-5 tasks or items needing your attention today:

- Overdue tasks
- Tasks due today
- Urgent client follow-ups
- Budget alerts

### Project Updates

Recent changes across your active projects:

- Tasks completed
- New messages
- Documents uploaded
- Status changes

### Upcoming This Week

Key dates and milestones in the next 7 days:

- Project deadlines
- Client meetings
- Procurement deliveries
- Contractor start dates

### Financial Summary

Quick financial snapshot:

- Outstanding invoices
- This week's revenue
- Budget alerts

### Team Activity

What your team accomplished yesterday:

- Tasks completed by team members
- Projects updated
- Key activities

## How the AI Works

The AI analyzes:

- **Task urgency** — Due dates, overdue items, priorities
- **Project momentum** — Active vs. stalled projects
- **Your role** — Items assigned to you or requiring your approval
- **Historical patterns** — What you typically work on

It prioritizes the most relevant information for your day.

## Customizing Your Brief

Control what appears in your brief:

1. Go to **Settings** → **User** → **Appearance**
2. Scroll to **Daily Brief Preferences**
3. Toggle sections on/off:
   - Tasks
   - Projects
   - Finance
   - Team Activity
4. Save

Your brief updates to show only what you want.

## Viewing Past Briefs

Access previous daily briefs:

1. Go to **AI** → **Daily Brief**
2. Select a date from the calendar
3. View that day's brief

Useful for reviewing what was prioritized on a past date.

## Best Practices

- **Start your day with the brief** — Review before diving into work
- **Act on priorities** — Address top items first
- **Check upcoming items** — Plan your week proactively
- **Customize for relevance** — Turn off sections that don't add value

The Daily Brief is your AI-powered morning routine — let it focus your day.`,
    screenshots: ["ai-tools/daily-brief.png", "ai-tools/brief-priorities.png"],
    related: ["dashboard-overview", "ai-activity", "my-tasks"],
  },
  {
    slug: "ai-activity",
    title: "AI Activity",
    description: "Reviewing AI actions and suggestions",
    category: "ai-tools",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# AI Activity

The AI Activity page shows a log of all actions taken by Focuspilot AI on your behalf.

## What is AI Activity?

Focuspilot AI works behind the scenes to:

- Generate daily briefs
- Extract product data (via AI Clipper)
- Suggest task priorities
- Detect budget alerts
- Identify overdue items

AI Activity is a transparent log of everything the AI does.

## Accessing AI Activity

Go to **AI** → **Activity** in the sidebar.

## What You See

### Activity Feed

Chronological list of AI actions:

- **Daily Brief Generated** — Each morning's brief
- **Product Clipped** — Products added via AI Clipper
- **Task Suggested** — AI recommended task creation
- **Budget Alert Triggered** — AI detected budget threshold reached
- **Automation Run** — Any automated workflow executed

### Activity Details

Click any activity to see:

- **Timestamp** — When it happened
- **Action Type** — What the AI did
- **Details** — Full description
- **Related Items** — Links to projects, tasks, products affected

## Reviewing AI Actions

Use AI Activity to:

- **Verify AI accuracy** — Ensure AI captured product data correctly
- **Understand suggestions** — See why AI prioritized something
- **Audit automations** — Confirm automated actions ran as expected

## Undoing AI Actions

If the AI did something unintended:

1. Open the activity
2. Click **Undo** (if available)
3. Action is reversed

Note: Not all actions are reversible (e.g., daily briefs can't be "undone").

## Filtering Activity

Filter the activity feed:

- **By Date** — Show actions from specific date range
- **By Type** — Show only product clips, briefs, etc.
- **By Project** — Actions related to specific project

## Privacy and Control

- AI never takes destructive actions without confirmation (e.g., deleting projects)
- AI doesn't share data outside your studio
- You can disable AI features in **Settings** → **User** → **AI Preferences**

## Best Practices

- **Review weekly** — Check AI activity to ensure accuracy
- **Provide feedback** — If AI makes mistakes, let support know
- **Leverage insights** — Use AI suggestions to improve workflows

AI Activity keeps Focuspilot transparent — you're always in control.`,
    screenshots: ["ai-tools/ai-activity.png", "ai-tools/activity-detail.png"],
    related: ["ai-daily-brief", "ai-clipper-overview"],
  },
  {
    slug: "design-studio",
    title: "Design Studio",
    description: "Generate interior and exterior design renders from sketches with AI",
    category: "ai-tools",
    readTime: 5,
    lastUpdated: "2026-05-21",
    content: `# Design Studio

The **Design** tab in the studio sidebar is an AI workspace for architecture and interior design teams.

## What you can do

- Upload **sketches, diagrams, or reference photos**
- Choose **Interior** or **Exterior** design mode
- Describe style, materials, and layout in natural language
- **Generate** photorealistic design renders (OpenAI vision + image generation)
- **Attach** renders to a project's Files tab
- **Share** with project team chat or contractors (after attaching to a project)

## Getting started

1. Open **Design** from the sidebar (requires Design • view permission).
2. Click **New design** to start a session.
3. Upload a sketch (optional) and enter a prompt, or pick a suggested prompt.
4. Click **Generate** when you have sketches attached, or press Enter to chat for advice.
5. Use **Share or attach** on any generated image to send it to a project or team.

## 3D design

**3D Design** is marked **Coming soon** — spatial walkthroughs and 3D models are planned for a future release.

## Permissions

- **Design • view** — access the Design tab and view sessions
- **Design • edit** — generate images and share outputs

Configure these under **Settings** → **Studio** → **Roles & permissions**.

## Requirements

Your studio must have a valid \`OPENAI_API_KEY\` configured on the server. Without it, generation will return an error.

## Tips

- Combine a clear sketch with a detailed written brief for best results
- Review AI renders before client presentations
- Attach to a project before sharing with contractors (portal requires a project file)`,
    related: ["ai-daily-brief", "ai-activity"],
  },
];
