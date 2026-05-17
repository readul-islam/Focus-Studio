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
