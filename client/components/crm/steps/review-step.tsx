"use client"

import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Building2, PenLine } from "lucide-react"
import type { ProposalData } from "../proposal-drawer"

interface ReviewStepProps {
  data: ProposalData
  onUpdate: (updates: Partial<ProposalData>) => void
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/^### (.+)$/gm, '<h4 class="text-sm font-semibold text-gray-800 mt-3 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="text-sm font-bold text-gray-900 mt-4 mb-1">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="text-base font-bold text-gray-900 mt-5 mb-2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm text-gray-600">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="list-disc space-y-1 my-2">${match}</ul>`)
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

export function ReviewStep({ data, onUpdate }: ReviewStepProps) {
  const currencySymbol = data.currency === "USD" ? "$" : data.currency === "EUR" ? "€" : "£"
  const subtotal = data.subtotal || 0
  const taxRate = data.tax || 0 // This is the tax RATE (percentage)
  const taxAmount = subtotal * (taxRate / 100) // Calculate the actual amount
  const total = data.total || 0

  const validationChecks = [
    { key: "client", label: "Client selected", valid: !!data.client },
    { key: "contact", label: "Contact / email assigned", valid: !!data.contact },
    { key: "title", label: "Proposal title provided", valid: !!data.title },
    { key: "scope", label: "Scope of work defined", valid: !!data.scope },
    { key: "pricing", label: "Line items added", valid: !!(data.lineItems?.length) },
    { key: "terms", label: "Terms & conditions included", valid: !!data.terms },
  ]

  const allValid = validationChecks.every((check) => check.valid)
  const completedCount = validationChecks.filter((c) => c.valid).length

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {completedCount}/{validationChecks.length} sections complete
        </span>
        {allValid ? (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Ready to send</Badge>
        ) : (
          <Badge variant="outline" className="border-gray-300 text-gray-500 text-xs">Incomplete</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
        {validationChecks.map((check) => (
          <div key={check.key} className="flex items-center gap-2 text-sm">
            {check.valid ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            )}
            <span className={check.valid ? "text-gray-700" : "text-gray-400"}>{check.label}</span>
          </div>
        ))}
      </div>

      <Separator className="bg-stone-200" />

      {/* Proposal Document Preview */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Studio Header */}
        <div className="bg-gray-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Your Studio</div>
                <div className="text-gray-400 text-xs">Interior Design</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">Proposal</div>
              {data.reference_number && (
                <div className="text-gray-500 text-xs font-mono mt-0.5">{data.reference_number}</div>
              )}
            </div>
          </div>
        </div>

        {/* Title + meta */}
        <div className="px-6 py-4 border-b border-gray-100 bg-stone-50">
          <h1 className="text-lg font-semibold text-gray-900">
            {data.title || <span className="text-gray-400">No title yet</span>}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
            {data.contact && <span>Prepared for: <span className="text-gray-700 font-medium">{data.contact}</span></span>}
            {data.validUntil && (
              <span>
                Valid until:{" "}
                <span className="text-gray-700 font-medium">
                  {new Date(data.validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Scope of Work */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Scope of Work
            </h2>
            {data.scope ? (
              <div
                className="text-sm text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(data.scope) }}
              />
            ) : (
              <p className="text-sm text-gray-400">No scope defined yet.</p>
            )}
          </section>

          {/* Investment / Pricing */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Investment
            </h2>

            {data.lineItems && data.lineItems.length > 0 ? (
              <>
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-white border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Qty</th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Rate</th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.lineItems.map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2.5 text-sm text-gray-700">
                            {item.description || <span className="text-gray-400">Unnamed item</span>}
                          </td>
                          <td className="px-4 py-2.5 text-center text-sm text-gray-600">{item.quantity || 1}</td>
                          <td className="px-4 py-2.5 text-right text-sm text-gray-600 tabular-nums">
                            {currencySymbol}{(item.rate || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5 text-right text-sm font-medium text-gray-900 tabular-nums">
                            {currencySymbol}{(item.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-56 space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span className="tabular-nums">{currencySymbol}{subtotal.toLocaleString()}</span>
                    </div>
                    {taxRate > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>VAT ({taxRate}%)</span>
                        <span className="tabular-nums">{currencySymbol}{taxAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-sm text-gray-900 border-t border-gray-200 pt-1.5">
                      <span>Total</span>
                      <span className="tabular-nums">{currencySymbol}{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">No line items added yet.</p>
            )}
          </section>

          {/* Terms & Conditions */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Terms &amp; Conditions
            </h2>
            {data.terms ? (
              <div className="bg-stone-50 rounded-lg p-4 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                {data.terms}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No terms defined yet.</p>
            )}
          </section>

          {/* Signature */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Acceptance
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">Studio</p>
                <div className="h-14 border-b-2 border-dashed border-gray-200 flex items-end pb-1">
                  <PenLine className="w-3.5 h-3.5 text-gray-300" />
                </div>
                <p className="text-xs text-gray-400">Authorised signature &amp; date</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">Client</p>
                <div className="h-14 border-b-2 border-dashed border-gray-200 flex items-end pb-1">
                  <PenLine className="w-3.5 h-3.5 text-gray-300" />
                </div>
                <p className="text-xs text-gray-400">Authorised signature &amp; date</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
            <span>Confidential — prepared for {data.contact || "client"}</span>
            {data.validUntil && (
              <span>
                Valid until{" "}
                {new Date(data.validUntil).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
