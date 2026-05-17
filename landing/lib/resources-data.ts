import type { LucideIcon } from "lucide-react"
import {
  ClipboardList,
  FileCheck,
  FileSpreadsheet,
  FileText,
  MessageSquare,
  Receipt,
} from "lucide-react"

export type TemplateCategory =
  | "All"
  | "Proposals"
  | "Contracts"
  | "Planning"
  | "Procurement"
  | "Discovery"
  | "Finance"

export type StudioTemplate = {
  slug: string
  title: string
  description: string
  category: Exclude<TemplateCategory, "All">
  icon: LucideIcon
  popular: boolean
  downloadPath: string
  format: string
  includes: string[]
  preview: string[]
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "All",
  "Proposals",
  "Contracts",
  "Planning",
  "Procurement",
  "Discovery",
  "Finance",
]

export const studioTemplates: StudioTemplate[] = [
  {
    slug: "design-proposal",
    title: "Design Proposal Template",
    description:
      "Professional proposal with scope, phased deliverables, fee structure, and terms—ready for residential or commercial kickoffs.",
    category: "Proposals",
    icon: FileText,
    popular: true,
    downloadPath: "/downloads/templates/design-proposal-template.txt",
    format: "Plain text outline",
    includes: ["Executive summary", "Scope & exclusions", "Fee options", "Timeline & payment schedule"],
    preview: [
      "Project overview and design intent",
      "Phase breakdown: Concept → DD → Procurement → Install",
      "Fixed-fee and hourly options with deposit terms",
    ],
  },
  {
    slug: "letter-of-agreement",
    title: "Letter of Agreement",
    description:
      "Contract template covering services, fees, revisions, liability, and termination—structured for UK interior design studios.",
    category: "Contracts",
    icon: FileCheck,
    popular: true,
    downloadPath: "/downloads/templates/letter-of-agreement-template.txt",
    format: "Plain text outline",
    includes: ["Services & deliverables", "Fees & expenses", "Revision policy", "Legal clauses"],
    preview: [
      "Parties, project address, and effective date",
      "Designer obligations and client responsibilities",
      "Payment milestones tied to project phases",
    ],
  },
  {
    slug: "project-brief",
    title: "Project Brief Template",
    description:
      "Capture budget, timeline, style direction, and functional requirements before concept work begins.",
    category: "Planning",
    icon: ClipboardList,
    popular: false,
    downloadPath: "/downloads/templates/project-brief-template.txt",
    format: "Plain text outline",
    includes: ["Goals & constraints", "Space program", "Budget bands", "Decision-makers"],
    preview: [
      "Lifestyle and aesthetic references",
      "Must-haves vs nice-to-haves",
      "Approval process and key dates",
    ],
  },
  {
    slug: "ffe-schedule",
    title: "FF&E Schedule Template",
    description:
      "Track specifications, suppliers, lead times, and room assignments in a studio-standard procurement sheet.",
    category: "Procurement",
    icon: FileSpreadsheet,
    popular: true,
    downloadPath: "/downloads/templates/ffe-schedule-template.txt",
    format: "Plain text outline",
    includes: ["Room / area", "Item spec", "Supplier & SKU", "Status & ETA"],
    preview: [
      "Column headers for qty, dimensions, finish, and cost",
      "Procurement status: specified → ordered → delivered",
      "Client approval flag per line item",
    ],
  },
  {
    slug: "client-questionnaire",
    title: "Client Questionnaire",
    description:
      "Discovery questions for lifestyle, budget comfort, and communication preferences—use before the first workshop.",
    category: "Discovery",
    icon: MessageSquare,
    popular: false,
    downloadPath: "/downloads/templates/client-questionnaire-template.txt",
    format: "Plain text outline",
    includes: ["Household profile", "Style & inspiration", "Budget sensitivity", "Project logistics"],
    preview: [
      "Daily routines and entertaining needs",
      "Pinterest / reference image prompts",
      "Preferred contact cadence and channels",
    ],
  },
  {
    slug: "invoice",
    title: "Invoice Template",
    description:
      "Invoice layout with line items, VAT notes, payment terms, and bank details—aligned with Focuspilot finance workflows.",
    category: "Finance",
    icon: Receipt,
    popular: false,
    downloadPath: "/downloads/templates/invoice-template.txt",
    format: "Plain text outline",
    includes: ["Studio branding block", "Line items & tax", "Payment terms", "Remittance details"],
    preview: [
      "Project reference and milestone description",
      "Deposit vs progress vs final invoice variants",
      "Late payment and currency notes",
    ],
  },
]

export function getTemplateBySlug(slug: string): StudioTemplate | undefined {
  return studioTemplates.find((t) => t.slug === slug)
}

export type PlaybookChapter = {
  id: string
  title: string
  summary: string
  steps: { title: string; body: string }[]
  prompts: { label: string; text: string }[]
}

export const aiPlaybookChapters: PlaybookChapter[] = [
  {
    id: "start",
    title: "Start here",
    summary:
      "Set guardrails before you automate—define what AI may draft, what humans must approve, and where project data lives.",
    steps: [
      {
        title: "Name one source of truth",
        body: "Keep briefs, selections, and approvals in your project tool. AI outputs should reference that record, not a loose chat thread.",
      },
      {
        title: "Default to human review",
        body: "Use AI for first drafts: emails, task lists, spec summaries. A principal or PM approves anything client-facing.",
      },
      {
        title: "Log decisions on the project",
        body: "When AI suggests an alternate product or timeline shift, capture the decision in the project so procurement and finance stay aligned.",
      },
    ],
    prompts: [
      {
        label: "Project context block",
        text: "You are assisting an interior design studio. Project: [name]. Phase: [concept/DD/procurement]. Budget band: [range]. Style: [keywords]. Only use facts from the notes below.",
      },
    ],
  },
  {
    id: "email",
    title: "Email & client comms",
    summary: "Turn inbox noise into routed actions—summaries, reply drafts, and approval reminders tied to the right project.",
    steps: [
      {
        title: "Route by project",
        body: "Tag supplier threads separately from client threads. AI summaries should state which milestone or room they affect.",
      },
      {
        title: "Draft, don't send",
        body: "Generate empathetic, concise replies with clear next steps and dates. Designer edits tone before send.",
      },
      {
        title: "Surface blockers",
        body: "Ask AI to list open questions, missing selections, and overdue approvals from the last week of email.",
      },
    ],
    prompts: [
      {
        label: "Client update email",
        text: "Draft a weekly client update for [project]. Tone: calm, professional. Include: completed this week, decisions needed, procurement status, next site date. Max 180 words.",
      },
      {
        label: "Chase approval",
        text: "Write a polite follow-up asking the client to approve [item] in the portal by [date]. Mention the impact on lead time if delayed.",
      },
    ],
  },
  {
    id: "procurement",
    title: "Procurement & specs",
    summary: "Use AI to compare alternates, sanity-check lead times, and keep FF&E schedules current without duplicate data entry.",
    steps: [
      {
        title: "Spec from supplier pages",
        body: "Paste a product URL or cut sheet text; extract dimensions, finish, lead time, and compliance notes into your schedule format.",
      },
      {
        title: "Alternate when delayed",
        body: "When lead time slips, request two alternates with cost and aesthetic trade-offs in the same message to the client.",
      },
      {
        title: "Batch PO prep",
        body: "Group line items by vendor and flag minimum order values before generating purchase orders.",
      },
    ],
    prompts: [
      {
        label: "Alternate product",
        text: "Original: [product]. Constraint: must ship within [weeks], similar scale and finish. Suggest 2 alternates with pros/cons for a client email.",
      },
    ],
  },
  {
    id: "tasks",
    title: "Tasks & timelines",
    summary: "Convert briefs and meeting notes into phased tasks with owners—then let AI keep the timeline honest as dates slip.",
    steps: [
      {
        title: "Kickoff → task map",
        body: "Feed kickoff notes; output phases, tasks, owners, and due dates using your studio’s standard phase names.",
      },
      {
        title: "Weekly replan",
        body: "Each Monday, list slipped tasks, dependencies at risk, and one recommended client communication.",
      },
    ],
    prompts: [
      {
        label: "Kickoff tasks",
        text: "From these kickoff notes, create tasks for Concept, DD, Procurement, and Install. Each task: owner role, due date (+buffer), dependency. Notes: [paste].",
      },
    ],
  },
  {
    id: "proposals",
    title: "Proposals & fees",
    summary: "Accelerate fee proposals and scope letters while keeping commercial terms consistent with your templates.",
    steps: [
      {
        title: "Scope from brief",
        body: "Turn a client brief into phased deliverables, exclusions, and assumptions before you price.",
      },
      {
        title: "Align with template",
        body: "Merge AI scope output into your Letter of Agreement and Proposal templates so legal language stays consistent.",
      },
    ],
    prompts: [
      {
        label: "Scope outline",
        text: "Create a scope outline for a [residential/commercial] interior project. Include deliverables per phase, client responsibilities, and explicit exclusions. Brief: [paste].",
      },
    ],
  },
  {
    id: "governance",
    title: "Governance & quality",
    summary: "Protect client trust—privacy, accuracy, and brand voice matter more than speed.",
    steps: [
      {
        title: "No confidential uploads",
        body: "Do not paste client financials or personal data into public models. Use your studio’s integrated AI where data stays in your workspace.",
      },
      {
        title: "Verify numbers",
        body: "AI must not invent dimensions, prices, or lead times. Confirm against supplier quotes and your library.",
      },
      {
        title: "Brand voice checklist",
        body: "Before send: warm but precise, no over-promising on dates, British English if that is your studio default.",
      },
    ],
    prompts: [
      {
        label: "Tone pass",
        text: "Rewrite this email to match a premium interior design studio: concise, confident, no jargon. Keep facts identical: [paste].",
      },
    ],
  },
]

export const aiPlaybookQuickWins = [
  {
    title: "Summarise yesterday’s inbox",
    body: "Get a bulleted list of client decisions, supplier delays, and tasks—grouped by project.",
    href: "/platform/features/ai-email",
  },
  {
    title: "Draft a phased proposal",
    body: "Turn a brief into scope sections you can paste into your proposal template in minutes.",
    href: "/platform/crm",
  },
  {
    title: "Refresh the FF&E schedule",
    body: "Extract specs from URLs and flag long-lead items before they block install.",
    href: "/platform/procurement",
  },
]
