"use client"
import { PermissionGuard } from '@/components/PermissionGuard';

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Save, Send, Eye, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CrmNav } from "@/components/crm-nav"
import { ClientBrandingStep } from "@/components/crm/steps/client-branding-step"
import { ScopeStep } from "@/components/crm/steps/scope-step"
import { PricingStep } from "@/components/crm/steps/pricing-step"
import { ReviewStep } from "@/components/crm/steps/review-step"
import { postData, putData } from "@/lib/Api"
import useFetch from "@/hooks/useFetch"
import { format } from "date-fns"
import type { ProposalData, ProposalStep } from "@/components/crm/proposal-drawer"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { usePermissions } from '@/hooks/usePermissions';

const steps: Array<{ key: ProposalStep; label: string }> = [
  { key: "client", label: "Client & Details" },
  { key: "scope", label: "Scope of Work" },
  { key: "pricing", label: "Pricing" },
  { key: "review", label: "Review & Send" },
]

function buildApiPayload(data: Partial<ProposalData>, status: string = "DFT") {
  const lineItems = (data.lineItems || []).map((item) => ({
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
    amount: item.amount,
  }))
  return {
    title: data.title || "New Proposal",
    scope_description: data.scope || "",
    terms_and_conditions: data.terms || "",
    cover_message: data.message || "",
    line_items: lineItems,
    subtotal: data.subtotal ?? 0,
    tax_rate: data.tax ?? 0,
    tax_amount: data.tax != null && data.subtotal != null ? (data.subtotal * data.tax) / 100 : 0,
    total: data.total ?? 0,
    currency: data?.currency?.code || "GBP",
    valid_until: data.validUntil || null,
    branding_preset: data.branding || "",
    client: data.client ? Number(data.client) : null,
    lead: data.linkedLeadId ? Number(data.linkedLeadId) : null,
    status: status,
  }
}

const currencySymbols: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  BDT: "৳",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  INR: "₹",
}

// Helper to get currency code from either string or object
function getCurrencyCode(currency: any): string {
  if (!currency) return "GBP"
  if (typeof currency === "string") return currency
  return currency.code || "GBP"
}

function getCurrencySymbol(currency: any): string {
  const code = getCurrencyCode(currency)
  if (typeof currency === "object" && currency?.symbol) return currency.symbol
  return currencySymbols[code] || "£"
}

function NewProposalPageContent() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<ProposalStep>("client")
  const [data, setData] = useState<Partial<ProposalData>>({ currency: "GBP" })
  const [isSaving, setIsSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const queryClient = useQueryClient()
  const { can } = usePermissions();
  const clientsPermission = can('clients.edit');

  const { data: leadsData } = useFetch("/crm/leads/")
  const leads: any[] = Array.isArray(leadsData) ? leadsData : (leadsData as any)?.results || []

  // Auto-link lead from ?lead= query param
  useEffect(() => {
    const leadId = searchParams.get("lead")
    if (leadId && leads.length > 0 && !data.linkedLeadId) {
      const lead = leads.find((l: any) => String(l.id) === leadId)
      if (lead) {
        setData((prev) => ({
          ...prev,
          linkedLeadId: String(lead.id),
          title: lead.title || `${lead.full_name} — ${lead.project_type || "Proposal"}`,
        }))
      }
    }
  }, [searchParams, leads, data.linkedLeadId])

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  const updateData = (updates: Partial<ProposalData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) setCurrentStep(steps[currentStepIndex + 1].key)
  }
  const prevStep = () => {
    if (currentStepIndex > 0) setCurrentStep(steps[currentStepIndex - 1].key)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = buildApiPayload(data, "DFT")
      let saved: any
      if (savedId || data.id) {
        saved = await putData({ url: `/crm/proposals/${savedId || data.id}/`, data: payload })
      } else {
        saved = await postData({ url: "/crm/proposals/", data: payload ,  })
      }
      if (saved?.id) {
        setSavedId(String(saved.id))
        setData((prev) => ({
          ...prev,
          id: String(saved.id),
          reference_number: saved.reference_number,
          access_token: saved.access_token,
        }))
      }
      toast.success('Proposal saved as draft')
      queryClient.refetchQueries({ queryKey: ["/crm/proposals/"] })
      
    } catch (error: any) {
      const msg = error?.response?.data ? JSON.stringify(error.response.data) : "Failed to save"
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    setPreviewOpen(true)
  }

  const handleSend = async () => {
    // API not ready yet - show coming soon message
    toast.success("Send proposal feature coming soon!")
  }

  const canSend = () => !!(data.title && data.lineItems?.length)

  return (
    <div className="flex-1 bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <CrmNav />

        {/* Step bar — white container */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-5 py-3">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => {
              const isActive = step.key === currentStep
              const isPast = index < currentStepIndex
              const canClick = index <= currentStepIndex + 1

              return (
                <button
                  key={step.key}
                  onClick={() => canClick && setCurrentStep(step.key)}
                  disabled={!canClick}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    isActive
                      ? "text-gray-900 font-semibold"
                      : isPast
                        ? "text-emerald-600 font-medium cursor-pointer"
                        : canClick
                          ? "text-gray-400 hover:text-gray-600 cursor-pointer"
                          : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isActive ? "bg-gray-900 text-white" : "bg-stone-200 text-gray-500"
                    }`}>
                      {index + 1}
                    </span>
                  )}
                  {step.label}
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-2" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving || !data.title} className="gap-2 h-9">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePreview} className="gap-2 h-9">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!canSend() || isSaving}
              className="gap-2 bg-gray-900 hover:bg-gray-800 h-9"
            >
              <Send className="w-4 h-4" />
              Send Proposal
            </Button>
          </div>
        </div>

        {/* Form content — white container */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {currentStep === "client" && (
            <ClientBrandingStep clientsPermission={clientsPermission} data={data as ProposalData} onUpdate={updateData} leads={leads} />
          )}
          {currentStep === "scope" && (
            <ScopeStep data={data as ProposalData} onUpdate={updateData} />
          )}
          {currentStep === "pricing" && (
            <PricingStep data={data as ProposalData} onUpdate={updateData} />
          )}
          {currentStep === "review" && (
            <ReviewStep data={data as ProposalData} onUpdate={updateData} />
          )}

          {/* Bottom nav */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
            <div>
              {currentStepIndex > 0 && (
                <Button variant="outline" size="sm" onClick={prevStep} className="gap-2 h-9">
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
            </div>
            <div>
              {currentStepIndex < steps.length - 1 ? (
                <Button onClick={nextStep} size="sm" className="gap-2 bg-gray-900 hover:bg-gray-800 h-9">
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSend}
                  size="sm"
                  disabled={!canSend() || isSaving}
                  className="gap-2 bg-gray-900 hover:bg-gray-800 h-9"
                >
                  <Send className="w-4 h-4" />
                  Send Proposal
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Proposal Preview</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{data.title || "Untitled Proposal"}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {data.validUntil && (
                  <span>Valid until: {format(new Date(data.validUntil), "PPP")}</span>
                )}
                <span>Currency: {getCurrencyCode(data.currency)}</span>
              </div>
            </div>

            <Separator />

            {/* Cover Message */}
            {data.message && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Cover Message</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{data.message}</p>
              </div>
            )}

            {/* Scope of Work */}
            {data.scope && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Scope of Work</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{data.scope}</p>
              </div>
            )}

            {/* Line Items */}
            {data.lineItems && data.lineItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pricing</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white">
                      <tr>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Description</th>
                        <th className="text-right px-4 py-2 text-sm font-medium text-gray-600">Qty</th>
                        <th className="text-right px-4 py-2 text-sm font-medium text-gray-600">Rate</th>
                        <th className="text-right px-4 py-2 text-sm font-medium text-gray-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.lineItems.map((item, idx) => (
                        <tr key={item.id || idx} className="border-t">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">
                            {getCurrencySymbol(data.currency)}{item.rate?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            {getCurrencySymbol(data.currency)}{item.amount?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="border-t bg-stone-50 px-4 py-3">
                    <div className="flex justify-end gap-8">
                      <div className="text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="ml-2 font-medium">{getCurrencySymbol(data.currency)}{data.subtotal?.toLocaleString()}</span>
                      </div>
                      {(data.tax ?? 0) > 0 && (
                        <div className="text-sm">
                          <span className="text-gray-600">Tax ({data.tax}%):</span>
                          <span className="ml-2 font-medium">
                            {getCurrencySymbol(data.currency)}{((data.subtotal || 0) * (data.tax || 0) / 100).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="text-gray-900 font-semibold">Total:</span>
                        <span className="ml-2 font-bold text-lg">{getCurrencySymbol(data.currency)}{data.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Terms */}
            {data.terms && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Terms & Conditions</h3>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{data.terms}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSend} disabled={!canSend()} className="bg-gray-900 hover:bg-gray-800">
              <Send className="w-4 h-4 mr-2" />
              Send Proposal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function NewProposalPage() {
  return (
    <PermissionGuard permission="clients.view" redirectTo="/">
      <NewProposalPageContent />
    </PermissionGuard>
  );
}