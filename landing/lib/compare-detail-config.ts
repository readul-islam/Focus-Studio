export type CompareSlug = "programa" | "houzz-pro" | "design-manager" | "studio-designer" | "designfiles"

export type FeatureStatus = boolean | "partial"

export type CompareFeatureRow = {
  featureKey: string
  focuspilot: FeatureStatus
  competitor: FeatureStatus
}

export type CompareSection = {
  categoryKey: string
  features: CompareFeatureRow[]
}

export type ComparePageLayout = {
  hasMigration: boolean
  hasExploreLinks: boolean
  ctaVariant: "light" | "dark"
}

export const COMPARE_PAGE_LAYOUT: Record<CompareSlug, ComparePageLayout> = {
  programa: { hasMigration: true, hasExploreLinks: true, ctaVariant: "light" },
  "houzz-pro": { hasMigration: false, hasExploreLinks: false, ctaVariant: "dark" },
  "design-manager": { hasMigration: true, hasExploreLinks: true, ctaVariant: "light" },
  "studio-designer": { hasMigration: false, hasExploreLinks: false, ctaVariant: "dark" },
  designfiles: { hasMigration: false, hasExploreLinks: false, ctaVariant: "dark" },
}

export const COMPARE_COMPETITOR_NAMES: Record<CompareSlug, string> = {
  programa: "Programa",
  "houzz-pro": "Houzz Pro",
  "design-manager": "Design Manager",
  "studio-designer": "Studio Designer",
  designfiles: "DesignFiles",
}

export const COMPARE_TABLE_DATA: Record<CompareSlug, CompareSection[]> = {
  programa: [
    {
      categoryKey: "procurement",
      features: [
        { featureKey: "productLibraryPricing", focuspilot: true, competitor: true },
        { featureKey: "aiProductSourcing", focuspilot: true, competitor: false },
        { featureKey: "purchaseOrderGeneration", focuspilot: true, competitor: true },
        { featureKey: "supplierManagement", focuspilot: true, competitor: true },
        { featureKey: "tradePricingIntegration", focuspilot: true, competitor: "partial" },
        { featureKey: "bulkOrderManagement", focuspilot: true, competitor: false },
      ],
    },
    {
      categoryKey: "clientApprovals",
      features: [
        { featureKey: "clientApprovalPortal", focuspilot: true, competitor: true },
        { featureKey: "commentsRevisions", focuspilot: true, competitor: true },
        { featureKey: "inPortalPayments", focuspilot: true, competitor: false },
        { featureKey: "realtimeStatusUpdates", focuspilot: true, competitor: "partial" },
        { featureKey: "mobileOptimisedPortal", focuspilot: true, competitor: "partial" },
      ],
    },
    {
      categoryKey: "financeInvoicing",
      features: [
        { featureKey: "invoiceGeneration", focuspilot: true, competitor: true },
        { featureKey: "xeroQuickbooksSync", focuspilot: true, competitor: true },
        { featureKey: "stripePayments", focuspilot: true, competitor: false },
        { featureKey: "projectProfitabilityTracking", focuspilot: true, competitor: "partial" },
        { featureKey: "automatedPaymentReminders", focuspilot: true, competitor: false },
        { featureKey: "multiCurrencySupport", focuspilot: true, competitor: true },
      ],
    },
    {
      categoryKey: "projectManagement",
      features: [
        { featureKey: "projectTimelinesPhases", focuspilot: true, competitor: true },
        { featureKey: "taskManagement", focuspilot: true, competitor: true },
        { featureKey: "teamCollaboration", focuspilot: true, competitor: true },
        { featureKey: "aiEmailDrafting", focuspilot: true, competitor: false },
        { featureKey: "documentStorage", focuspilot: true, competitor: true },
        { featureKey: "clientCommunicationLog", focuspilot: true, competitor: "partial" },
      ],
    },
    {
      categoryKey: "crm",
      features: [
        { featureKey: "leadCaptureForms", focuspilot: true, competitor: "partial" },
        { featureKey: "pipelineManagement", focuspilot: true, competitor: true },
        { featureKey: "contactDatabase", focuspilot: true, competitor: true },
        { featureKey: "aiPoweredProposals", focuspilot: true, competitor: false },
        { featureKey: "automatedFollowUps", focuspilot: true, competitor: false },
      ],
    },
  ],
  "houzz-pro": [
    {
      categoryKey: "platformIndependence",
      features: [
        { featureKey: "independentPlatform", focuspilot: true, competitor: false },
        { featureKey: "ownClientRelationships", focuspilot: true, competitor: "partial" },
        { featureKey: "noPlatformCommission", focuspilot: true, competitor: false },
        { featureKey: "anyProductSuppliers", focuspilot: true, competitor: true },
        { featureKey: "whiteLabelClientPortal", focuspilot: true, competitor: "partial" },
      ],
    },
    {
      categoryKey: "financeCompliance",
      features: [
        { featureKey: "nativeXeroIntegration", focuspilot: true, competitor: false },
        { featureKey: "multiCurrencyVat", focuspilot: true, competitor: "partial" },
        { featureKey: "dedicatedSupportTeam", focuspilot: true, competitor: false },
        { featureKey: "gdprCompliant", focuspilot: true, competitor: true },
        { featureKey: "britishSpellingTerminology", focuspilot: true, competitor: false },
      ],
    },
    {
      categoryKey: "aiAutomation",
      features: [
        { featureKey: "aiEmailDrafting", focuspilot: true, competitor: false },
        { featureKey: "aiProductSourcing", focuspilot: true, competitor: false },
        { featureKey: "aiProposalGeneration", focuspilot: true, competitor: false },
        { featureKey: "smartClientThreadSummaries", focuspilot: true, competitor: false },
        { featureKey: "automatedDataExtraction", focuspilot: true, competitor: false },
      ],
    },
    {
      categoryKey: "projectManagement",
      features: [
        { featureKey: "projectTimelinesPhases", focuspilot: true, competitor: true },
        { featureKey: "taskManagement", focuspilot: true, competitor: true },
        { featureKey: "teamCollaboration", focuspilot: true, competitor: true },
        { featureKey: "documentStorage", focuspilot: true, competitor: true },
        { featureKey: "clientCommunicationLog", focuspilot: true, competitor: true },
      ],
    },
    {
      categoryKey: "financePayments",
      features: [
        { featureKey: "invoiceGeneration", focuspilot: true, competitor: true },
        { featureKey: "stripePaymentIntegration", focuspilot: true, competitor: false },
        { featureKey: "projectProfitabilityTracking", focuspilot: true, competitor: "partial" },
        { featureKey: "automatedPaymentReminders", focuspilot: true, competitor: "partial" },
        { featureKey: "accountingSoftwareSync", focuspilot: true, competitor: "partial" },
      ],
    },
  ],
  "design-manager": [
    {
      categoryKey: "userExperience",
      features: [
        { featureKey: "modernCloudInterface", focuspilot: true, competitor: "partial" },
        { featureKey: "mobileResponsiveDesign", focuspilot: true, competitor: false },
        { featureKey: "realtimeCollaboration", focuspilot: true, competitor: "partial" },
        { featureKey: "noInstallationRequired", focuspilot: true, competitor: false },
        { featureKey: "regularFeatureUpdates", focuspilot: true, competitor: "partial" },
      ],
    },
    {
      categoryKey: "aiAutomation",
      features: [
        { featureKey: "aiEmailDrafting", focuspilot: true, competitor: false },
        { featureKey: "aiProductSourcing", focuspilot: true, competitor: false },
        { featureKey: "automatedPaymentReminders", focuspilot: true, competitor: "partial" },
        { featureKey: "smartProposalGeneration", focuspilot: true, competitor: false },
        { featureKey: "workflowAutomation", focuspilot: true, competitor: "partial" },
      ],
    },
    {
      categoryKey: "clientExperience",
      features: [
        { featureKey: "brandedClientPortal", focuspilot: true, competitor: true },
        { featureKey: "inPortalPayments", focuspilot: true, competitor: false },
        { featureKey: "mobileClientAccess", focuspilot: true, competitor: false },
        { featureKey: "realtimeApprovalNotifications", focuspilot: true, competitor: "partial" },
        { featureKey: "clientCommentThreads", focuspilot: true, competitor: true },
      ],
    },
    {
      categoryKey: "financialManagement",
      features: [
        { featureKey: "projectBudgeting", focuspilot: true, competitor: true },
        { featureKey: "invoiceGeneration", focuspilot: true, competitor: true },
        { featureKey: "xeroIntegration", focuspilot: true, competitor: "partial" },
        { featureKey: "stripePayments", focuspilot: true, competitor: false },
        { featureKey: "profitabilityReporting", focuspilot: true, competitor: true },
        { featureKey: "purchaseOrderManagement", focuspilot: true, competitor: true },
      ],
    },
    {
      categoryKey: "procurement",
      features: [
        { featureKey: "productLibrary", focuspilot: true, competitor: true },
        { featureKey: "supplierDatabase", focuspilot: true, competitor: true },
        { featureKey: "tradePricingManagement", focuspilot: true, competitor: true },
        { featureKey: "aiAlternativeFinder", focuspilot: true, competitor: false },
        { featureKey: "orderTracking", focuspilot: true, competitor: true },
      ],
    },
  ],
  "studio-designer": [
    {
      categoryKey: "aiAutomation",
      features: [
        { featureKey: "aiEmailDrafting", focuspilot: true, competitor: false },
        { featureKey: "aiProductSourcing", focuspilot: true, competitor: false },
        { featureKey: "aiProposalGeneration", focuspilot: true, competitor: false },
        { featureKey: "automatedDataExtraction", focuspilot: true, competitor: false },
        { featureKey: "smartReminders", focuspilot: true, competitor: "partial" },
      ],
    },
    {
      categoryKey: "procurementProducts",
      features: [
        { featureKey: "productLibrary", focuspilot: true, competitor: true },
        { featureKey: "purchaseOrderGeneration", focuspilot: true, competitor: true },
        { featureKey: "supplierManagement", focuspilot: true, competitor: true },
        { featureKey: "deliveryTracking", focuspilot: true, competitor: "partial" },
        { featureKey: "tradePricingIntegration", focuspilot: true, competitor: "partial" },
      ],
    },
    {
      categoryKey: "financeCompliance",
      features: [
        { featureKey: "nativeXeroIntegration", focuspilot: true, competitor: false },
        { featureKey: "multiCurrencyPricing", focuspilot: true, competitor: "partial" },
        { featureKey: "vatTaxHandling", focuspilot: true, competitor: "partial" },
        { featureKey: "dedicatedSupport", focuspilot: true, competitor: false },
        { featureKey: "britishEnglishInterface", focuspilot: true, competitor: false },
      ],
    },
    {
      categoryKey: "clientManagement",
      features: [
        { featureKey: "clientPortal", focuspilot: true, competitor: true },
        { featureKey: "selectionApprovals", focuspilot: true, competitor: true },
        { featureKey: "inPortalPayments", focuspilot: true, competitor: false },
        { featureKey: "realtimeUpdates", focuspilot: true, competitor: "partial" },
        { featureKey: "whiteLabelBranding", focuspilot: true, competitor: true },
      ],
    },
    {
      categoryKey: "finance",
      features: [
        { featureKey: "invoiceGeneration", focuspilot: true, competitor: true },
        { featureKey: "stripePayments", focuspilot: true, competitor: false },
        { featureKey: "projectProfitability", focuspilot: true, competitor: true },
        { featureKey: "budgetTracking", focuspilot: true, competitor: true },
        { featureKey: "accountingSync", focuspilot: true, competitor: "partial" },
      ],
    },
  ],
  designfiles: [
    {
      categoryKey: "aiAutomation",
      features: [
        { featureKey: "aiEmailDrafting", focuspilot: true, competitor: false },
        { featureKey: "aiProductSourcing", focuspilot: true, competitor: false },
        { featureKey: "aiProposalGeneration", focuspilot: true, competitor: false },
        { featureKey: "automatedWorkflows", focuspilot: true, competitor: "partial" },
        { featureKey: "smartDataExtraction", focuspilot: true, competitor: false },
      ],
    },
    {
      categoryKey: "procurementFfe",
      features: [
        { featureKey: "productLibrary", focuspilot: true, competitor: true },
        { featureKey: "purchaseOrderGeneration", focuspilot: true, competitor: "partial" },
        { featureKey: "supplierManagement", focuspilot: true, competitor: "partial" },
        { featureKey: "deliveryTracking", focuspilot: true, competitor: false },
        { featureKey: "tradePricingLookup", focuspilot: true, competitor: false },
      ],
    },
    {
      categoryKey: "financeInvoicing",
      features: [
        { featureKey: "invoiceGeneration", focuspilot: true, competitor: true },
        { featureKey: "xeroQuickbooksSync", focuspilot: true, competitor: false },
        { featureKey: "stripePayments", focuspilot: true, competitor: false },
        { featureKey: "projectProfitability", focuspilot: true, competitor: "partial" },
        { featureKey: "budgetVsActualTracking", focuspilot: true, competitor: "partial" },
      ],
    },
    {
      categoryKey: "clientManagement",
      features: [
        { featureKey: "clientPortal", focuspilot: true, competitor: true },
        { featureKey: "selectionBoards", focuspilot: true, competitor: true },
        { featureKey: "approvalWorkflows", focuspilot: true, competitor: "partial" },
        { featureKey: "inPortalPayments", focuspilot: true, competitor: false },
        { featureKey: "realtimeCollaboration", focuspilot: true, competitor: "partial" },
      ],
    },
    {
      categoryKey: "scalability",
      features: [
        { featureKey: "multiUserTeams", focuspilot: true, competitor: true },
        { featureKey: "roleBasedPermissions", focuspilot: true, competitor: "partial" },
        { featureKey: "multipleStudiosBrands", focuspilot: true, competitor: false },
        { featureKey: "enterpriseFeatures", focuspilot: true, competitor: false },
        { featureKey: "apiAccess", focuspilot: true, competitor: false },
      ],
    },
  ],
}

export const EXPLORE_LINK_KEYS = {
  programa: [
    { key: "procurement", href: "/platform/procurement" },
    { key: "clientPortal", href: "/platform/client-portal" },
    { key: "finance", href: "/platform/finance" },
  ],
  "design-manager": [
    { key: "projectManagement", href: "/platform/projects" },
    { key: "aiFeatures", href: "/platform/ai" },
    { key: "crm", href: "/platform/crm" },
  ],
} as const satisfies Partial<Record<CompareSlug, readonly { key: string; href: string }[]>>

export const MIGRATION_STEP_KEYS = {
  programa: ["productLibrary", "clientContacts", "activeProjects", "accountingSync"],
  "design-manager": ["dataExport", "productSupplier", "clientPortal", "teamOnboarding"],
} as const satisfies Partial<Record<CompareSlug, readonly string[]>>

export const FAQ_KEYS = {
  programa: ["mainDifference", "studioSize", "migration", "accounting", "procurement"],
  "houzz-pro": ["mainDifference", "leads", "xero", "bothPlatforms", "international"],
  "design-manager": ["mainDifference", "largeStudios", "mobile", "accounting", "commercial", "support"],
  "studio-designer": ["mainDifference", "aiFeatures", "procurement", "migration", "international"],
  designfiles: ["mainDifference", "pricing", "accounting", "growingStudio", "migration"],
} as const satisfies Record<CompareSlug, readonly string[]>

export const FOCUS_REASON_KEYS = {
  programa: ["accountingSync", "aiFeatures", "inPortalPayments", "residentialPractice", "perUserPricing"],
  "houzz-pro": ["independentPlatform", "xeroIntegration", "aiAutomation", "ownRelationships", "multiCurrency"],
  "design-manager": ["modernCloud", "aiFeatures", "clientPortalPayments", "perUserPricing", "quickSetup"],
  "studio-designer": ["aiAutomation", "xeroIntegration", "stripePayments", "mobileFirst", "multiCurrency"],
  designfiles: ["aiAdmin", "procurement", "accountingIntegration", "growTeam", "clientPayments"],
} as const satisfies Record<CompareSlug, readonly string[]>

export const COMPETITOR_REASON_KEYS = {
  programa: ["usQuickbooks", "perProjectPricing", "noAiPayments", "existingWorkflows"],
  "houzz-pro": ["houzzLeads", "houzzPresence", "usBased", "visualisationTools"],
  "design-manager": ["desktopSoftware", "existingWorkflows", "noRemoteAccess", "noAiPriority"],
  "studio-designer": ["traditionalSoftware", "usBased", "noAi", "quickbooks"],
  designfiles: ["soloDesigner", "presentationBoards", "tightBudget", "noProcurementFinance"],
} as const satisfies Record<CompareSlug, readonly string[]>
