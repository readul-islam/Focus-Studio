"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Calendar } from "@/components/ui/calendar"
import { CurrencySelector } from "@/components/ui/CurrencySelector"
import { Building2, User, Link2, Check, ChevronsUpDown, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import useFetch from "@/hooks/useFetch"
import type { ProposalData } from "../proposal-drawer"
import { useTranslations } from "next-intl"

interface ClientBrandingStepProps {
  data: ProposalData
  onUpdate: (updates: Partial<ProposalData>) => void
  leads?: any[]
  clientsPermission: boolean
}

export function ClientBrandingStep({ data, onUpdate, leads = [] , clientsPermission }: ClientBrandingStepProps) {
  const t = useTranslations('crmProposalSteps')
  const [clientOpen, setClientOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)

  const { data: clientsData, isLoading: clientsLoading } = useFetch('/crm/studio-contacts/?contact_type=CL')
  const contacts: any[] = (clientsData as any)?.results || []

  const contactLabel = (contact: any) => {
    const name = [contact.name, contact.surname].filter(Boolean).join(" ") || contact.company_name || `Contact #${contact.id}`
    return contact.company_name && contact.company_name !== name
      ? `${name} — ${contact.company_name}`
      : name
  }

  const selectedContact = data.client
    ? contacts.find((c) => String(c.id) === String(data.client))
    : null

  const selectedLead = data.linkedLeadId
    ? leads.find((l) => String(l.id) === String(data.linkedLeadId))
    : null

  // Set default currency on mount
  useEffect(() => {
    if (!data.currency) {
      onUpdate({ currency: "GBP" })
    }
  }, [])

  // Auto-fill from linked lead
  useEffect(() => {
    if (!selectedLead) return
    const updates: Partial<ProposalData> = {}
    if (selectedLead.email && !data.contact) updates.contact = selectedLead.email
    const projectType = selectedLead.project_type || selectedLead.lead_type
    if (projectType && !data.title) updates.title = `${selectedLead.full_name || ''} — ${projectType}`.trim()
    const budget = selectedLead.estimated_value || selectedLead.budget_range
    if (budget && !data.message) updates.message = `Budget: ${typeof budget === 'number' ? '£' + Number(budget).toLocaleString() : budget}`
    if (Object.keys(updates).length > 0) onUpdate(updates)
  }, [data.linkedLeadId])

  const handleClientSelect = (clientId: string) => {
    const contact = contacts.find((c) => String(c.id) === clientId)
    onUpdate({
      client: clientId,
      contact: contact?.email || data.contact || "",
    })
    // Auto-set title if empty
    if (!data.title && contact) {
      const name = contactLabel(contact)
      onUpdate({ title: `${name} — Design Proposal` })
    }
  }

  const handleLeadSelect = (leadId: string) => {
    if (leadId === "__none__") {
      onUpdate({ linkedLeadId: undefined })
      return
    }
    const lead = leads.find((l) => String(l.id) === leadId)
    if (!lead) { onUpdate({ linkedLeadId: undefined }); return }
    const updates: Partial<ProposalData> = {
      linkedLeadId: leadId,
      contact: lead.email || data.contact || "",
    }
    const projectType = lead.project_type || lead.lead_type
    if (projectType && !data.title) updates.title = `${lead.full_name || ''} — ${projectType}`
    const budget = lead.estimated_value || lead.budget_range
    if (budget && !data.message) updates.message = `Budget: ${typeof budget === 'number' ? '£' + Number(budget).toLocaleString() : budget}`
    onUpdate(updates)
  }

  return (
    <div className="space-y-6">
      {/* Proposal Title — First thing you see */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-semibold text-gray-900">
          {t('proposalTitle')} <span className="text-red-500">*</span>
        </Label>
        <Input
          disabled={!clientsPermission}
          id="title"
          placeholder={t('proposalTitlePlaceholder')}
          value={data.title || ""}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="h-10 disabled:opacity-100 text-sm bg-white border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* Client Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-900">
          {t('selectClient')} <span className="text-red-500">*</span>
        </Label>
        <Popover  open={clientOpen} onOpenChange={setClientOpen}>
          <PopoverTrigger className="disabled:opacity-100" disabled={!clientsPermission} asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={clientOpen}
              className="w-full h-11 justify-between bg-white border-gray-200 font-normal"
            >
              {selectedContact ? (
                <div className="flex items-center gap-2">
                  {selectedContact.company_name ? (
                    <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <User className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <span>{contactLabel(selectedContact)}</span>
                </div>
              ) : (
                <span className="text-gray-500">{clientsLoading ? "Loading clients..." : "Search for a client..."}</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder={t('searchClient')} />
              <CommandList>
                <CommandEmpty>{t('noClientFound')}</CommandEmpty>
                <CommandGroup>
                  {contacts.filter((c) => c.id).map((contact) => (
                    <CommandItem
                      key={contact.id}
                      value={`${contactLabel(contact)} ${contact.email || ""}`}
                      onSelect={() => {
                        handleClientSelect(String(contact.id))
                        setClientOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0">
                          {contact.company_name ? (
                            <Building2 className="w-4 h-4 text-gray-500" />
                          ) : (
                            <User className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-gray-900 truncate">{contactLabel(contact)}</span>
                          {contact.email && (
                            <span className="text-xs text-gray-500 truncate">{contact.email}</span>
                          )}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          data.client === String(contact.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedContact && (
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg text-sm">
            <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <div className="min-w-0">
              <span className="font-medium text-gray-900">{contactLabel(selectedContact)}</span>
              <span className="text-gray-500 ml-2">{selectedContact.email}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Currency + Valid Until */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Currency</Label>
          <CurrencySelector
            value={data.currency || "GBP"}
            onChange={onUpdate}
            data={data}
            disabled={!clientsPermission}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Valid Until</Label>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger className="disabled:opacity-100" disabled={!clientsPermission} asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white border-gray-200",
                  !data.validUntil && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.validUntil ? format(new Date(data.validUntil), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.validUntil ? new Date(data.validUntil) : undefined}
                onSelect={(date) => {
                  onUpdate({ validUntil: date ? format(date, "yyyy-MM-dd") : "" })
                  setDateOpen(false)
                }}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Cover Message */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Cover Message <span className="text-gray-400 font-normal">(included in email)</span>
        </Label>
        <Textarea
          disabled={!clientsPermission}
          placeholder="A personal note to your client..."
          value={data.message || ""}
          onChange={(e) => onUpdate({ message: e.target.value })}
          className="disabled:opacity-100 bg-white border-gray-200 min-h-[80px] resize-none"
          rows={3}
        />
      </div>

      {/* Link to Lead — only if leads exist */}
      {leads && leads.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <Label className="text-sm font-medium text-gray-700">
            Link to Lead <span className="text-gray-400 font-normal">(auto-fills details)</span>
          </Label>
          <Select value={data.linkedLeadId || ""} onValueChange={handleLeadSelect}>
            <SelectTrigger disabled={!clientsPermission} className="disabled:opacity-100 disabled:bg-white border-gray-200">
              <SelectValue placeholder="Optional — link to a pipeline lead" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No lead</SelectItem>
              {leads.map((lead) => (
                <SelectItem key={lead.id} value={String(lead.id)}>
                  {lead.full_name || lead.title || `Lead ${lead.id}`}
                  {lead.estimated_value && ` — £${Number(lead.estimated_value).toLocaleString()}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedLead && (
            <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg text-sm">
              <Link2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-emerald-800 font-medium">{selectedLead.full_name}</span>
              {selectedLead.estimated_value && (
                <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
                  £{Number(selectedLead.estimated_value).toLocaleString()}
                </Badge>
              )}
              {(selectedLead.project_type || selectedLead.lead_type) && (
                <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
                  {selectedLead.project_type || selectedLead.lead_type}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
