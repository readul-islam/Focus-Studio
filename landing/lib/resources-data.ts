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
  category: Exclude<TemplateCategory, "All">
  icon: LucideIcon
  popular: boolean
  downloadPath: string
  includeKeys: readonly string[]
  previewKeys: readonly string[]
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
    category: "Proposals",
    icon: FileText,
    popular: true,
    downloadPath: "/downloads/templates/design-proposal-template.txt",
    includeKeys: ["executiveSummary", "scopeExclusions", "feeOptions", "timelinePayment"],
    previewKeys: ["projectOverview", "phaseBreakdown", "feeDepositTerms"],
  },
  {
    slug: "letter-of-agreement",
    category: "Contracts",
    icon: FileCheck,
    popular: true,
    downloadPath: "/downloads/templates/letter-of-agreement-template.txt",
    includeKeys: ["servicesDeliverables", "feesExpenses", "revisionPolicy", "legalClauses"],
    previewKeys: ["partiesDate", "designerObligations", "paymentMilestones"],
  },
  {
    slug: "project-brief",
    category: "Planning",
    icon: ClipboardList,
    popular: false,
    downloadPath: "/downloads/templates/project-brief-template.txt",
    includeKeys: ["goalsConstraints", "spaceProgram", "budgetBands", "decisionMakers"],
    previewKeys: ["lifestyleReferences", "mustHaves", "approvalProcess"],
  },
  {
    slug: "ffe-schedule",
    category: "Procurement",
    icon: FileSpreadsheet,
    popular: true,
    downloadPath: "/downloads/templates/ffe-schedule-template.txt",
    includeKeys: ["roomArea", "itemSpec", "supplierSku", "statusEta"],
    previewKeys: ["columnHeaders", "procurementStatus", "clientApprovalFlag"],
  },
  {
    slug: "client-questionnaire",
    category: "Discovery",
    icon: MessageSquare,
    popular: false,
    downloadPath: "/downloads/templates/client-questionnaire-template.txt",
    includeKeys: ["householdProfile", "styleInspiration", "budgetSensitivity", "projectLogistics"],
    previewKeys: ["dailyRoutines", "referencePrompts", "contactCadence"],
  },
  {
    slug: "invoice",
    category: "Finance",
    icon: Receipt,
    popular: false,
    downloadPath: "/downloads/templates/invoice-template.txt",
    includeKeys: ["brandingBlock", "lineItemsTax", "paymentTerms", "remittanceDetails"],
    previewKeys: ["projectReference", "invoiceVariants", "latePaymentNotes"],
  },
]

export function getTemplateBySlug(slug: string): StudioTemplate | undefined {
  return studioTemplates.find((t) => t.slug === slug)
}

export type StudioTemplateSerializable = Omit<StudioTemplate, "icon">

export function toSerializableTemplate(template: StudioTemplate): StudioTemplateSerializable {
  const { icon: _icon, ...rest } = template
  return rest
}

export function getTemplateIcon(slug: string): LucideIcon {
  return getTemplateBySlug(slug)?.icon ?? FileText
}
