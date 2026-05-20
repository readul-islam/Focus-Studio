import type { BlogCategoryId } from "@/lib/blog-categories"
import { getCategoryLabel } from "@/lib/blog-categories"

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    role: string
    avatar: string
  }
  publishedAt: string
  readTime: string
  category: BlogCategoryId
  tags: string[]
  featuredImage: string
  featured?: boolean
}

export function getCategoryDisplay(post: BlogPost): string {
  return getCategoryLabel(post.category)
}

const AUTHORS = {
  maya: { name: "Maya Okonkwo", role: "Head of Product", avatar: "/placeholder.svg" },
  james: { name: "James Whitfield", role: "Studio Operations Lead", avatar: "/placeholder.svg" },
  elena: { name: "Elena Vasquez", role: "Senior Interior Designer", avatar: "/placeholder.svg" },
  priya: { name: "Priya Nair", role: "Client Experience", avatar: "/placeholder.svg" },
}

export const blogPosts: BlogPost[] = [
  // —— Regional SEO (UK & US) ——
  {
    slug: "best-interior-design-software-uk",
    title: "Best Interior Design Project Management Software for UK Studios (2026)",
    excerpt:
      "What UK interior designers should look for in studio software: Xero sync, VAT-ready invoicing, RIBA-friendly phases, client portals, and procurement—without spreadsheet chaos.",
    category: "studio-management",
    tags: ["UK", "Interior Design Software UK", "Xero", "VAT", "RIBA", "Studio Management"],
    publishedAt: "2026-05-20",
    readTime: "10 min",
    featured: true,
    featuredImage: "/blog/studio-financial-visibility.jpg",
    author: AUTHORS.james,
    content: `
      <p>British interior design studios operate in a specific commercial context: VAT on fees and FF&E, client expectations shaped by RIBA-aligned delivery, and accounting that often runs through <strong>Xero</strong>. Generic project tools rarely reflect that reality—so "UK interior design software" is not just a search phrase; it describes a real gap in the market.</p>
      <p>This guide explains what to prioritise when you evaluate <strong>interior design project management software in the UK</strong>, and how a connected workspace like Focuspilot supports residential and commercial practices from first brief to final invoice.</p>
      <h2>Why UK studios need more than a task board</h2>
      <p>Most design practices juggle the same pressure points: fragmented email threads, procurement spreadsheets, client approval delays, and finance data that lives in a different system from the project plan. A tool built only for tasks leaves VAT, purchase orders, and client sign-off as manual side projects.</p>
      <p>Strong UK-focused studio software should connect:</p>
      <ul>
        <li><strong>Project phases and tasks</strong> aligned to how you actually deliver (concept, design development, procurement, install)</li>
        <li><strong>FF&E and procurement</strong> with lead times, suppliers, and status visible to the team and client</li>
        <li><strong>Client approvals</strong> in a branded portal—not buried in email attachments</li>
        <li><strong>Invoicing and profitability</strong> with figures that sync to your accountant's system</li>
      </ul>
      <h2>Xero integration is non-negotiable for many UK firms</h2>
      <p>Xero dominates small and mid-size UK creative businesses. If your project tool cannot push invoices and payment status into Xero automatically, your studio pays for double entry every month.</p>
      <p>Look for two-way sync: project-level invoices created in the studio system, payments reconciled, and expenses visible without CSV exports. That is how you keep cash flow honest while designers stay focused on delivery—not bookkeeping archaeology.</p>
      <h2>VAT, deposits, and client-facing clarity</h2>
      <p>UK projects often mix design fees, procurement mark-ups, and pass-through costs. Your software should support clear line items, staged invoices, and documentation clients can understand. When approvals and financial milestones sit beside selections in one portal, "just checking the VAT" emails decrease sharply.</p>
      <h2>Procurement and long-lead items</h2>
      <p>Custom joinery, stone, and lighting frequently define the critical path on UK installs. Timeline software that treats procurement as equal to design tasks—not an afterthought spreadsheet—prevents the classic bank-holiday slip that compresses snagging into one weekend.</p>
      <p>Studios that track supplier status, delivery dates, and alternates in the same system they use for tasks report fewer site surprises and calmer client conversations.</p>
      <h2>Client portal and professional presentation</h2>
      <p>High-end residential and boutique commercial clients in the UK expect polish. A white-label portal for approvals, documents, and messages signals organisation without forcing clients into generic file-sharing links. That presentation layer is part of why studios outgrow email-only workflows.</p>
      <h2>AI that respects how UK studios communicate</h2>
      <p>Email remains central to UK client relationships. Tools that summarise threads, draft replies in your tone, and surface decisions as tasks reduce the risk of missing a scope change buried in paragraph four—without replacing human judgment.</p>
      <h2>How to evaluate vendors in practice</h2>
      <p>When you shortlist <strong>interior design software for UK studios</strong>, run a two-week pilot on a live project:</p>
      <ol>
        <li>Import or recreate one active job with real phases and FF&E</li>
        <li>Send one client approval through the portal</li>
        <li>Raise a deposit or stage invoice and confirm it appears in Xero</li>
        <li>Ask your team whether they would willingly open the tool daily</li>
      </ol>
      <p>If any step fails, the tool is not "almost there"—it will become another abandoned login.</p>
      <h2>Where Focuspilot fits UK studios</h2>
      <p><a href="https://focuspilot.io">Focuspilot</a> is built for interior designers and architects who need projects, procurement, client collaboration, and finance in one workspace—with native Xero integration, multi-currency support, VAT-ready workflows, and AI assistance for email and sourcing. It is used by growing UK practices that want an operating system, not a patchwork of spreadsheets and inbox threads.</p>
      <p>Explore <a href="https://focuspilot.io/compare/programa">how Focuspilot compares to Programa</a>, <a href="https://focuspilot.io/compare/houzz-pro">Houzz Pro</a>, and other tools, or start a free trial and map your next live project inside the platform.</p>
    `,
  },
  {
    slug: "best-interior-design-software-us",
    title: "Best Interior Design Project Management Software for US Firms (2026)",
    excerpt:
      "A practical guide for US interior design studios: QuickBooks-ready workflows, client portals, procurement, profitability tracking, and software that scales from solo to multi-office teams.",
    category: "studio-management",
    tags: ["US", "Interior Design Software", "QuickBooks", "FF&E", "Client Portal", "Studio Management"],
    publishedAt: "2026-05-18",
    readTime: "10 min",
    featured: true,
    featuredImage: "/blog/studio-operating-system.jpg",
    author: AUTHORS.maya,
    content: `
      <p>American interior design firms face a familiar stack: QuickBooks or similar for books, email for client decisions, spreadsheets for FF&E, and a project tool that never quite connects to how work really flows. Searching for <strong>interior design project management software in the US</strong> is usually the moment a studio admits the patchwork is costing margin—not just time.</p>
      <p>Here is what US design businesses should demand from modern studio software, and how to choose a platform that supports residential, hospitality, and commercial work without forcing you into generic construction PM tools.</p>
      <h2>What US studios actually need from software</h2>
      <p>US firms range from solo designers to multi-city teams with dedicated procurement staff. Regardless of size, the operational spine is similar:</p>
      <ul>
        <li><strong>Clear project phases</strong> from concept through install close-out</li>
        <li><strong>FF&E specification and ordering</strong> with vendor lead times and client approvals</li>
        <li><strong>Document control</strong> for drawings, finishes, and contracts</li>
        <li><strong>Financial visibility</strong> per project—fees, COGS, mark-ups, and cash timing</li>
        <li><strong>Client experience</strong> that feels premium, not like a generic ticket system</li>
      </ul>
      <p>Software marketed only to "creative agencies" often lacks procurement depth. Software built for builders often overwhelms designers with RFIs and submittals you will never use. The right fit sits in the middle: <strong>design-native project management</strong>.</p>
      <h2>Accounting integration: QuickBooks and beyond</h2>
      <p>Many US studios run on <strong>QuickBooks Online</strong>. Your project platform should create invoices, track payments, and align project profitability with what finance sees—without weekly CSV rituals.</p>
      <p>Also confirm support for <strong>Stripe</strong> if you collect deposits or approval-related payments through a client portal. US clients increasingly expect card options; reconciling those payments manually defeats the purpose of integrated software.</p>
      <h2>Procurement and vendor management at US scale</h2>
      <p>US projects often pull from national vendors, trade accounts, and custom fabricators across time zones. Your system should track:</p>
      <ul>
        <li>Specification status and alternates</li>
        <li>Purchase orders and deposits</li>
        <li>Freight and delivery windows</li>
        <li>Install sequencing dependencies</li>
      </ul>
      <p>When procurement lives in email, the PM becomes the human integration layer—expensive and error-prone. Centralising status in the same tool as design tasks is how multi-project studios protect margin.</p>
      <h2>Client portal and approvals</h2>
      <p>US clients may tolerate email at small scale; they rarely tolerate chaos at $200k+ FF&E scope. A branded portal for selections, approvals, and files reduces "just circling back" loops and creates a defensible record when scope shifts.</p>
      <p>Look for mobile-friendly portals, comment threads on selections, and clear approval timestamps—essential when disputes arise about who signed off on what.</p>
      <h2>Team collaboration across offices and time zones</h2>
      <p>Growing US firms split work between design, procurement, and project management. Role-based access, @mentions, and activity on the project record beat scattered Slack channels that lose context after ninety days.</p>
      <p>Per-user pricing that scales fairly matters: studios should not be punished for adding a procurement coordinator mid-year.</p>
      <h2>AI for email volume and specification work</h2>
      <p>US inboxes are high-volume. AI-assisted drafting, thread summaries, and product sourcing suggestions save hours weekly when humans stay in the loop for final sends and spec decisions. The goal is faster throughput, not autopilot client communication.</p>
      <h2>Compliance and documentation (practical, not legal advice)</h2>
      <p>While this is not legal guidance, US studios routinely need organised contracts, change-order trails, and approval logs. Software that attaches decisions to the project timeline supports cleaner close-out and fewer "we never approved that" conversations.</p>
      <h2>Evaluation checklist for US firms</h2>
      <p>When comparing <strong>interior design software for US studios</strong>, test against a real active project:</p>
      <ol>
        <li>Build phases and assign owners with due dates</li>
        <li>Run one FF&E approval cycle through the client portal</li>
        <li>Issue a progress invoice and confirm accounting sync</li>
        <li>Review project P&amp;L or budget vs actual in the same UI</li>
      </ol>
      <p>Adoption fails when designers keep shadow spreadsheets "just in case." If the pilot does not replace those sheets, keep looking.</p>
      <h2>How Focuspilot supports US design businesses</h2>
      <p><a href="https://focuspilot.io">Focuspilot</a> unifies CRM, projects, procurement, client portal, and finance for interior designers and architects—with QuickBooks and Xero integration, Stripe payments, AI email and sourcing tools, and workflows built for design delivery rather than generic task lists.</p>
      <p>See <a href="https://focuspilot.io/compare/programa">Focuspilot vs Programa</a> and other comparisons, or start a free trial and run your next US project end-to-end in one workspace.</p>
    `,
  },

  // —— Workflow ——
  {
    slug: "brief-to-task-map-in-minutes",
    title: "From Client Brief to Task Map in Minutes",
    excerpt:
      "Turn messy kickoff notes into phased tasks, owners, and deadlines—without rebuilding your spreadsheet every Monday.",
    category: "workflow",
    tags: ["Workflow", "Tasks", "Kickoff"],
    publishedAt: "2026-05-10",
    readTime: "7 min",
    featured: true,
    featuredImage: "/blog/workflow-brief-to-task-map.jpg",
    author: AUTHORS.maya,
    content: `
      <p>Most studios lose a full day after every kickoff translating notes into tasks. The brief lives in email, decisions in Slack, and the "real" plan in a spreadsheet nobody updates.</p>
      <h2>Start with a single source of truth</h2>
      <p>Capture the brief, budget guardrails, and milestone dates in one project record. Link reference images and supplier lists immediately so the team does not hunt across drives.</p>
      <h2>Phase templates that match how you work</h2>
      <p>Use reusable phase bundles—Concept, Design Development, Procurement, Install—to auto-seed tasks with realistic durations based on past projects of similar scale.</p>
      <h2>Assign owners before you leave the room</h2>
      <p>Every task needs one owner and a due date at kickoff. Shared ownership sounds collaborative but creates silent gaps when everyone assumes someone else will act.</p>
      <h2>Connect procurement early</h2>
      <p>Flag long-lead items in week one. When procurement tasks sit beside design tasks on the same timeline, you surface conflicts before they become site delays.</p>
      <p>Studios that standardize kickoff-to-task mapping report smoother installs, fewer weekend fire drills, and clients who feel organized from day one.</p>
    `,
  },
  {
    slug: "procurement-timelines-that-hold",
    title: "Procurement Timelines That Actually Hold on Site",
    excerpt:
      "How to build FF&E schedules with buffer, supplier accountability, and client-visible status—without living in inbox threads.",
    category: "workflow",
    tags: ["Procurement", "Timeline", "FF&E"],
    publishedAt: "2026-04-28",
    readTime: "8 min",
    featuredImage: "/blog/workflow-procurement-timelines.jpg",
    author: AUTHORS.james,
    content: `
      <p>Procurement is where beautiful drawings meet reality. A single slipped custom sofa can cascade through trades, storage, and client trust.</p>
      <h2>Order by dependency, not alphabetically</h2>
      <p>Sequence purchase orders by what blocks other work: stone before cabinetry, lighting before ceiling closure, window treatments after paint.</p>
      <h2>Build supplier-specific buffers</h2>
      <p>Track historical lead times per vendor. Your timeline should auto-suggest buffer days based on category and season, not a flat two-week guess.</p>
      <h2>Make status visible to clients</h2>
      <p>When clients see ordered, in production, shipped, and delivered states in their portal, approval anxiety drops and "just checking in" emails slow down.</p>
      <h2>Escalate early with options</h2>
      <p>When a delay appears, present alternates with cost and aesthetic trade-offs the same day. Decisive communication protects both schedule and relationship.</p>
      <p>Tight procurement workflow is a competitive advantage—especially for studios managing multiple installs at once.</p>
    `,
  },
  {
    slug: "email-to-action-items",
    title: "Turning Client Email Into Action Items Automatically",
    excerpt:
      "Stop copying paragraphs into task lists. Here's how studios extract decisions, deadlines, and RFIs from inbox noise.",
    category: "workflow",
    tags: ["Email", "AI", "Communication"],
    publishedAt: "2026-04-12",
    readTime: "6 min",
    featuredImage: "/blog/workflow-email-to-tasks.jpg",
    author: AUTHORS.maya,
    content: `
      <p>Client email volume scales faster than headcount. The risk is not missing a message—it is missing the decision buried in paragraph four.</p>
      <h2>Thread context matters</h2>
      <p>Group messages by project and thread before summarizing. A standalone sentence like "let's proceed with Option B" means nothing without the options attached.</p>
      <h2>Separate decisions from FYIs</h2>
      <p>Tag each extracted item as decision needed, approval, or informational. Only decisions become tasks with owners; FYIs attach to the project log.</p>
      <h2>Human review before assign</h2>
      <p>AI drafts the task list; a project lead confirms. This keeps accuracy high while still saving twenty to thirty minutes per long thread.</p>
      <h2>Close the loop in the portal</h2>
      <p>When clients see their request converted into a tracked task with a due date, they trust the studio is organized—even when replies are brief.</p>
      <p>Email will remain central to design relationships. The win is making it fuel your system instead of fighting it.</p>
    `,
  },

  // —— Studio Management ——
  {
    slug: "studio-operating-system-basics",
    title: "Building a Studio Operating System That Scales",
    excerpt:
      "Roles, rituals, and tooling choices that let a twelve-person studio run with the clarity of a larger firm.",
    category: "studio-management",
    tags: ["Operations", "Growth", "Process"],
    publishedAt: "2026-05-02",
    readTime: "9 min",
    featuredImage: "/blog/studio-operating-system.jpg",
    author: AUTHORS.james,
    content: `
      <p>Talent alone does not scale a studio—systems do. Without an operating system, every new hire reinvents how work gets done.</p>
      <h2>Define roles, not heroes</h2>
      <p>Document who owns sales, project delivery, procurement, and finance. Overlap is fine; ambiguity is not.</p>
      <h2>Weekly rituals beat quarterly retreats</h2>
      <p>A sixty-minute pipeline review and a thirty-minute blockers stand-up beat an annual offsite for keeping projects green.</p>
      <h2>One platform for delivery</h2>
      <p>Fragmented tools create duplicate entry. Prefer a core platform for tasks, clients, and procurement, integrating accounting at the edges.</p>
      <h2>Measure leading indicators</h2>
      <p>Track approval turnaround, POs issued on time, and margin by project phase—not only revenue. Fixes become proactive.</p>
      <p>An operating system is not bureaucracy; it is the invisible structure that protects creativity.</p>
    `,
  },
  {
    slug: "client-portals-reduce-approval-delays",
    title: "Client Portals That Reduce Approval Delays",
    excerpt:
      "Give clients one place to approve selections, see budget impact, and understand what's blocking the next milestone.",
    category: "studio-management",
    tags: ["Client Portal", "Approvals", "Experience"],
    publishedAt: "2026-04-18",
    readTime: "7 min",
    featuredImage: "/blog/studio-client-portal.jpg",
    author: AUTHORS.priya,
    content: `
      <p>Approval delays rarely mean clients are indecisive. Often they lack context—budget, lead time, and what happens if they wait.</p>
      <h2>Present options as decisions</h2>
      <p>Limit presentations to two or three vetted options with your recommendation highlighted. Too many choices freeze action.</p>
      <h2>Show schedule impact</h2>
      <p>Pair each approval with a simple line: "Needed by Thursday to hold install week of June 2." Dates motivate faster responses.</p>
      <h2>Centralize files and feedback</h2>
      <p>Versioned PDFs, finish boards, and comment threads in one portal beat scattered email attachments clients cannot find later.</p>
      <h2>Audit the trail</h2>
      <p>Timestamped approvals protect both sides when scope or timing is questioned months later.</p>
      <p>Portals are not cold technology—they are clarity, which clients experience as premium service.</p>
    `,
  },
  {
    slug: "financial-visibility-per-project",
    title: "Financial Visibility on Every Active Project",
    excerpt:
      "Real-time margin, committed spend, and forecasted fees—so you fix profitability during the job, not in hindsight.",
    category: "studio-management",
    tags: ["Finance", "Margin", "Reporting"],
    publishedAt: "2026-03-30",
    readTime: "8 min",
    featuredImage: "/blog/studio-financial-visibility.jpg",
    author: AUTHORS.james,
    content: `
      <p>Studios often discover thin margins at closeout. By then, the levers—scope, materials, hours—are gone.</p>
      <h2>Commit vs. actual spend</h2>
      <p>Separate quoted, committed, and invoiced amounts per category. Committed POs are the leading indicator of margin erosion.</p>
      <h2>Phase-level budgets</h2>
      <p>Align fee breakdowns with project phases so overruns in procurement show up before design hours absorb the hit silently.</p>
      <h2>Time tracking without punishment</h2>
      <p>Track time to learn, not only to bill. Patterns in concept vs. revision hours inform better proposals next quarter.</p>
      <h2>Weekly finance stand-up</h2>
      <p>Fifteen minutes reviewing projects below target margin triggers early client conversations or internal scope resets.</p>
      <p>Financial visibility is a creative tool—it tells you where to invest energy before burnout sets in.</p>
    `,
  },

  // —— Industry Trends ——
  {
    slug: "biophilic-design-commercial-studios",
    title: "Biophilic Design Moves Into Commercial Studios",
    excerpt:
      "Natural light, living materials, and acoustic greenery—why workplace clients are budgeting for wellness-led interiors.",
    category: "industry-trends",
    tags: ["Biophilic", "Commercial", "Wellness"],
    publishedAt: "2026-05-08",
    readTime: "6 min",
    featuredImage: "/blog/trends-biophilic-commercial.jpg",
    author: AUTHORS.elena,
    content: `
      <p>Biophilic design has matured from residential novelty to commercial requirement. Tenants now ask how a space supports focus and recovery, not only headcount.</p>
      <h2>Light as a material</h2>
      <p>Floor-to-ceiling glazing, light shelves, and circadian-tuned fixtures are specified early—not added as value engineering casualties.</p>
      <h2>Living systems with maintenance plans</h2>
      <p>Green walls succeed when irrigation, replacement cycles, and vendor contracts are budgeted upfront.</p>
      <h2>Acoustic comfort</h2>
      <p>Plants, felt, and timber slats address open-plan noise—a top employee complaint in post-pandemic offices.</p>
      <p>Studios that articulate measurable wellness outcomes win corporate programs over studios selling aesthetics alone.</p>
    `,
  },
  {
    slug: "material-palettes-clients-request-2026",
    title: "Material Palettes Clients Are Requesting in 2026",
    excerpt:
      "Warm minerals, tactile plaster, and honest timber—what specification meetings look like this year.",
    category: "industry-trends",
    tags: ["Materials", "Color", "Specification"],
    publishedAt: "2026-04-22",
    readTime: "7 min",
    featuredImage: "/blog/trends-material-palettes.jpg",
    author: AUTHORS.elena,
    content: `
      <p>Minimal cold gray is giving way to layered warmth. Clients want spaces that feel collected over time, not installed in a single afternoon.</p>
      <h2>Texture over flat color</h2>
      <p>Lime wash, limewash plaster, and hand-formed tile lead conversations. Flat paint reads unfinished against these surfaces.</p>
      <h2>Stone with story</h2>
      <p>Travertine, honed marble, and terrazzo with visible aggregate appear in kitchens, baths, and hospitality bars alike.</p>
      <h2>Responsible timber</h2>
      <p>FSC-certified oak and reclaimed accents are default asks—documentation travels with submittals.</p>
      <h2>Metals as jewelry</h2>
      <p>Brushed brass and bronze appear in thin profiles: pulls, shelf edges, and lighting trims—not entire rooms of gold.</p>
      <p>Staying current means curating a material library your team can specify confidently and procure reliably.</p>
    `,
  },
  {
    slug: "ai-assisted-specification-2026",
    title: "AI-Assisted Specification Without Losing Craft",
    excerpt:
      "Use automation for research and documentation while keeping human judgment on aesthetics and client fit.",
    category: "industry-trends",
    tags: ["AI", "Specification", "Technology"],
    publishedAt: "2026-04-05",
    readTime: "8 min",
    featuredImage: "/blog/trends-ai-specification.jpg",
    author: AUTHORS.maya,
    content: `
      <p>AI accelerates the boring parts of specification—comparing lead times, drafting submittal cover sheets, summarizing client feedback. It does not replace taste.</p>
      <h2>Research, not decisions</h2>
      <p>Let tools compile comparable products across price bands; designers shortlist against concept and proportion.</p>
      <h2>Document generation</h2>
      <p>Auto-populate cut sheets and finish schedules from your library to cut admin hours each week.</p>
      <h2>Client-appropriate language</h2>
      <p>Draft portal updates in plain language, then edit for brand voice. Clients respond faster when instructions are clear.</p>
      <h2>Guardrails for IP and privacy</h2>
      <p>Never paste confidential client data into public models. Use enterprise tools or anonymized excerpts.</p>
      <p>The studios winning with AI treat it as junior staff: fast, eager, and always reviewed by a lead.</p>
    `,
  },

  // —— Best Practices ——
  {
    slug: "efficient-remote-design-critiques",
    title: "Running Efficient Remote Design Critiques",
    excerpt:
      "Structured agendas, async feedback, and visual standards that keep critique energizing—not exhausting.",
    category: "best-practices",
    tags: ["Critique", "Remote", "Team"],
    publishedAt: "2026-05-05",
    readTime: "6 min",
    featuredImage: "/blog/practices-design-critiques.jpg",
    author: AUTHORS.elena,
    content: `
      <p>Critique builds studio quality—but unfocused video calls burn hours and morale. Remote teams need tighter formats.</p>
      <h2>Send materials twenty-four hours ahead</h2>
      <p>Reviewers arrive with written questions; live time focuses on decisions, not first impressions.</p>
      <h2>Timebox roles</h2>
      <p>Presenter ten minutes, discussion fifteen, actions five. End on assigned follow-ups.</p>
      <h2>Separate taste from criteria</h2>
      <p>Anchor feedback in brief, budget, and program before personal preference.</p>
      <h2>Record decisions</h2>
      <p>One paragraph in the project log beats a recording nobody watches.</p>
      <p>Great critique feels like coaching—not criticism—and remote studios can absolutely achieve that.</p>
    `,
  },
  {
    slug: "prevent-scope-creep-fixed-fee",
    title: "Preventing Scope Creep on Fixed-Fee Projects",
    excerpt:
      "Change orders, decision windows, and written assumptions that protect margin without damaging trust.",
    category: "best-practices",
    tags: ["Scope", "Contracts", "Profitability"],
    publishedAt: "2026-04-15",
    readTime: "7 min",
    featuredImage: "/blog/practices-scope-creep.jpg",
    author: AUTHORS.priya,
    content: `
      <p>Fixed fees reward efficiency—but only when scope is visible. Friendly "small asks" accumulate into unpaid redesign weeks.</p>
      <h2>Define inclusions explicitly</h2>
      <p>Number of concepts, revision rounds, and site visits belong in the proposal, not footnotes.</p>
      <h2>Change order within forty-eight hours</h2>
      <p>When scope shifts, price and schedule update immediately. Delayed conversations become awkward and costly.</p>
      <h2>Decision windows</h2>
      <p>Client approvals close after agreed dates; reopening adds fee and time. Portals make this feel professional, not punitive.</p>
      <h2>Train the team to flag creep</h2>
      <p>Designers should tag out-of-scope requests in the system, not absorb them to be helpful.</p>
      <p>Boundaries, communicated early, increase respect—not resentment.</p>
    `,
  },
  {
    slug: "onboard-designers-two-weeks",
    title: "Onboarding New Designers in Two Weeks",
    excerpt:
      "A practical ramp plan: tools, templates, shadow days, and a first solo deliverable that builds confidence.",
    category: "best-practices",
    tags: ["Onboarding", "Hiring", "Culture"],
    publishedAt: "2026-03-25",
    readTime: "6 min",
    featuredImage: "/blog/practices-designer-onboarding.jpg",
    author: AUTHORS.james,
    content: `
      <p>Hiring is expensive; slow onboarding wastes it. A structured two-week ramp gets new designers billable without throwing them into fire drills.</p>
      <h2>Week one: observe and document</h2>
      <p>Shadow client calls, learn the PM tool, complete a library tagging exercise. No solo client email yet.</p>
      <h2>Templates before autonomy</h2>
      <p>Finish boards, specification exports, and portal updates using studio templates with mentor review.</p>
      <h2>Week two: owned slice</h2>
      <p>Assign a contained workstream—e.g., secondary bathroom FF&E—with daily check-ins.</p>
      <h2>Culture touchpoints</h2>
      <p>Introduce them in critique, share two "how we do it here" stories, and pair with a peer buddy for informal questions.</p>
      <p>Fast, kind onboarding signals a studio that respects craft and people's time.</p>
    `,
  },
]

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter((post) => post.featured)
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export function getPostsByCategory(categoryId: BlogCategoryId): BlogPost[] {
  return blogPosts
    .filter((post) => post.category === categoryId)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}
