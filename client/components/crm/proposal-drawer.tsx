"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { ClientBrandingStep } from "./steps/client-branding-step"
// Details merged into client step
import { ScopeStep } from "./steps/scope-step"
import { PricingStep } from "./steps/pricing-step"
// Terms merged into scope step
import { ReviewStep } from "./steps/review-step"
import { postData, putData } from "@/lib/Api"
import useProposalsStore from "@/store/useProposalsStore"

export type ProposalStep = "client" | "scope" | "pricing" | "review"

export interface ProposalData {
  id?: string
  client?: string
  contact?: string
  branding?: string
  title?: string
  currency?: string
  validUntil?: string
  scope?: string
  lineItems?: Array<{
    id: string
    description: string
    quantity: number
    rate: number
    amount: number
  }>
  subtotal?: number
  tax?: number
  total?: number
  terms?: string
  message?: string
  linkedLeadId?: string
  // API-returned read-only fields
  reference_number?: string
  access_token?: string
}

interface ProposalDrawerProps {
  open: boolean
  onClose: () => void
  initialData?: Partial<ProposalData>
  leads?: any[]
  onSaved?: () => void
}

/** Map wizard ProposalData → backend API payload */
function buildApiPayload(data: Partial<ProposalData>) {
  const lineItems = (data.lineItems || []).map((item) => ({
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
    amount: item.amount,
  }))

  return {
    title: data.title || "New Proposal",
    scope: data.scope || "",
    terms: data.terms || "",
    notes: data.message || "",
    line_items: lineItems,
    subtotal: data.subtotal ?? 0,
    tax_rate: data.tax ?? 0,
    tax_amount: data.tax != null && data.subtotal != null ? (data.subtotal * data.tax) / 100 : 0,
    total: data.total ?? 0,
    currency: data.currency || "GBP",
    valid_until: data.validUntil || null,
    branding_preset: data.branding || "",
    client: data.client ? Number(data.client) : null,
    lead: data.linkedLeadId ? Number(data.linkedLeadId) : null,
  }
}

/** Check if a step has meaningful data filled in (for progress indicator) */
function stepHasData(step: ProposalStep, data: Partial<ProposalData>): boolean {
  switch (step) {
    case "client":
      return !!(data.client || data.title)
    case "scope":
      return !!data.scope
    case "pricing":
      return !!(data.lineItems?.length && data.total)
    case "review":
      return false
    default:
      return false
  }
}

export function ProposalDrawer({ open, onClose, initialData, leads = [], onSaved }: ProposalDrawerProps) {
  const t = useTranslations("proposalDrawer")
  const tCommon = useTranslations("common")

  const steps: Array<{ key: ProposalStep; label: string; shortLabel: string; required: boolean }> = [
    { key: "client", label: t("stepClient"), shortLabel: t("stepClientShort"), required: true },
    { key: "scope", label: t("stepScope"), shortLabel: t("stepScopeShort"), required: true },
    { key: "pricing", label: t("stepPricing"), shortLabel: t("stepPricingShort"), required: true },
    { key: "review", label: t("stepReview"), shortLabel: t("stepReviewShort"), required: false },
  ]

  const {
    currentProposal,
    setCurrentProposal,
    updateCurrentProposal,
    clearCurrentProposal
  } = useProposalsStore();

  const [currentStep, setCurrentStep] = useState<ProposalStep>("client")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize proposal data when drawer opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        setCurrentProposal(initialData);
      } else {
        setCurrentProposal({});
      }
      setCurrentStep("client");
      setHasUnsavedChanges(false);
    }
  }, [open, initialData, setCurrentProposal]);

  const data = currentProposal || {};

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        if (canSend()) {
          handleSend()
        }
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, data])

  const updateData = (updates: Partial<ProposalData>) => {
    updateCurrentProposal(updates)
    setHasUnsavedChanges(true)
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (confirm(t("unsavedCloseConfirm"))) {
        clearCurrentProposal();
        setCurrentStep("client");
        setHasUnsavedChanges(false);
        onClose();
      }
    } else {
      clearCurrentProposal();
      setCurrentStep("client");
      onClose();
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = buildApiPayload(data)

      let saved: any
      if (data.id) {
        // Edit: PUT /crm/proposals/{id}/
        saved = await putData({ url: `/crm/proposals/${data.id}/`, data: payload })
      } else {
        // Create: POST /crm/proposals/
        saved = await postData({ url: "/crm/proposals/", data: payload })
      }

      // Store the API-returned id so subsequent saves use PUT
      if (saved?.id && !data.id) {
        setCurrentProposal({ ...data, id: String(saved.id), reference_number: saved.reference_number, access_token: saved.access_token })
      }

      setHasUnsavedChanges(false);
      toast({
        description: data.id ? t("proposalUpdated") : t("proposalSavedDraft"),
        duration: 2000,
      });
      onSaved?.()
    } catch (error: any) {
      const msg = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error?.message || t("saveFailed")
      toast({
        description: msg,
        duration: 3000,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const handlePreview = () => {
    if (!data.id) {
      toast({
        description: t("saveFirstPreview"),
        duration: 2000,
      })
      return
    }
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/crm/proposals/${data.id}/pdf/`, "_blank")
  }

  const handleSend = async () => {
    if (!canSend()) return

    // Ensure the proposal is saved first
    if (!data.id) {
      toast({
        description: t("savingBeforeSend"),
        duration: 1500,
      })
      await handleSave()
      return
    }

    setIsSaving(true)
    try {
      await postData({ url: `/crm/proposals/${data.id}/send/` })
      toast({
        description: t("sentSuccess"),
        duration: 3000,
      })
      onSaved?.()
      handleClose()
    } catch (error: any) {
      const msg = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error?.message || t("sendFailed")
      toast({
        description: msg,
        duration: 3000,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const canSend = () => {
    return !!(data.client && data.title && data.lineItems?.length)
  }

  const isStepValid = (step: ProposalStep) => {
    switch (step) {
      case "client":
        return !!(data.title)
      case "scope":
        return !!data.scope
      case "pricing":
        return !!(data.lineItems?.length && data.total)
      case "review":
        return true
      default:
        return false
    }
  }

  const canProceedToStep = (step: ProposalStep) => {
    const stepIndex = steps.findIndex((s) => s.key === step)
    const currentIndex = steps.findIndex((s) => s.key === currentStep)

    if (stepIndex <= currentIndex) return true

    // Check if all previous required steps are valid
    for (let i = 0; i < stepIndex; i++) {
      const prevStep = steps[i]
      if (prevStep.required && !isStepValid(prevStep.key)) {
        return false
      }
    }

    return true
  }

  const nextStep = () => {
    const currentIndex = steps.findIndex((s) => s.key === currentStep)
    if (currentIndex < steps.length - 1) {
      const nextStepKey = steps[currentIndex + 1].key
      if (canProceedToStep(nextStepKey)) {
        setCurrentStep(nextStepKey)
      }
    }
  }

  const prevStep = () => {
    const currentIndex = steps.findIndex((s) => s.key === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case "client":
        return <ClientBrandingStep data={data} onUpdate={updateData} leads={leads} />
      case "scope":
        return <ScopeStep data={data} onUpdate={updateData} />
      case "pricing":
        return <PricingStep data={data} onUpdate={updateData} />
      case "review":
        return <ReviewStep data={data} onUpdate={updateData} />
      default:
        return null
    }
  }

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)
  const canGoNext = currentStepIndex < steps.length - 1 && isStepValid(currentStep)
  const canGoPrev = currentStepIndex > 0

  // Drawer title: "New Proposal" or "Edit: [title]"
  const drawerTitle = data.id
    ? `${tCommon("edit")}: ${data.title || t("newProposal")}`
    : t("newProposal")

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-borderSoft">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-semibold text-ink">
                {drawerTitle}
              </DialogTitle>
              {data.reference_number && (
                <Badge variant="outline" className="text-xs font-mono">
                  {data.reference_number}
                </Badge>
              )}
              {isSaving && (
                <Badge variant="secondary" className="text-xs">
                  {tCommon("saving")}
                </Badge>
              )}
              {hasUnsavedChanges && !isSaving && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                  Unsaved
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Step Navigation — names + progress dots */}
        <div className="space-y-3 mb-2">
          {/* Step name labels row */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = step.key === currentStep
              const isPast = index < currentStepIndex
              const isFilled = stepHasData(step.key, data)
              const canClick = canProceedToStep(step.key)

              return (
                <div key={step.key} className="flex items-center">
                  <button
                    onClick={() => canClick && setCurrentStep(step.key)}
                    disabled={!canClick}
                    className={`flex flex-col items-center gap-1.5 transition-colors ${canClick ? "cursor-pointer" : "cursor-not-allowed"}`}
                    title={step.label}
                  >
                    {/* Step circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        isActive
                          ? "bg-clay-600 text-white ring-2 ring-clay-200"
                          : isPast
                            ? "bg-sage-500 text-white"
                            : "bg-greige-200 text-ink-muted"
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {/* Step name */}
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        isActive ? "text-clay-700" : isPast ? "text-sage-600" : "text-ink-muted"
                      }`}
                    >
                      {step.shortLabel}
                    </span>
                    {/* Filled dot indicator */}
                    {isFilled && !isPast && !isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-clay-400" />
                    )}
                  </button>

                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 min-w-[1.5rem] sm:min-w-[2.5rem] transition-colors ${
                        index < currentStepIndex ? "bg-sage-500" : "bg-greige-200"
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Current step name as subtitle */}
          <div className="text-center">
            <span className="text-sm text-ink-muted font-medium">
              Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.label}
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStep()}</div>

        <Separator className="bg-borderSoft" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose} className="border-borderSoft bg-white hover:bg-greige-50">
              {tCommon("cancel")}
            </Button>
            {canGoPrev && (
              <Button variant="outline" onClick={prevStep} className="border-borderSoft bg-white hover:bg-greige-50">
                {t("back")}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {data.total && data.total > 0 ? (
              <div className="text-sm font-medium text-ink tabular-nums mr-4">
                Total: {data.currency === "USD" ? "$" : data.currency === "EUR" ? "€" : "£"}
                {data.total.toLocaleString()}
              </div>
            ) : null}

            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
              className="border-borderSoft bg-white hover:bg-greige-50"
            >
              {t("saveDraft")}
            </Button>

            <Button variant="outline" onClick={handlePreview} className="border-borderSoft bg-white hover:bg-greige-50">
              {t("preview")}
            </Button>

            {canGoNext ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="bg-clay-600 hover:bg-clay-700 text-white"
              >
                {t("continue")}
              </Button>
            ) : (
              <Button onClick={handleSend} disabled={!canSend() || isSaving} className="bg-clay-600 hover:bg-clay-700 text-white">
                {t("sendProposal")}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
