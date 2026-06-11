'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { postData } from '@/lib/Api';
import type { ProposalData } from '../proposal-drawer';

interface PricingStepProps {
  data: ProposalData;
  onUpdate: (updates: Partial<ProposalData>) => void;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const paymentScheduleTemplates = [
  {
    name: '50/50 Split',
    schedule: [
      { name: 'Deposit', percentage: 50 },
      { name: 'Completion', percentage: 50 },
    ],
  },
  {
    name: '30/40/30',
    schedule: [
      { name: 'Deposit', percentage: 30 },
      { name: 'Midpoint', percentage: 40 },
      { name: 'Completion', percentage: 30 },
    ],
  },
  {
    name: '25/25/25/25',
    schedule: [
      { name: 'Deposit', percentage: 25 },
      { name: 'Phase 1', percentage: 25 },
      { name: 'Phase 2', percentage: 25 },
      { name: 'Completion', percentage: 25 },
    ],
  },
];

function buildAiPayload(data: ProposalData, draftType: 'scope' | 'pricing') {
  return {
    draft_type: draftType,
    project_type: data.title || '',
    client_name: data.client || '',
    project_description: data.scope || '',
    budget_range: data.message || '',
    timeline: data.validUntil || '',
    rooms: '',
    style_preference: data.branding || '',
  };
}

export function PricingStep({ data, onUpdate }: PricingStepProps) {
  const t = useTranslations('crmProposalSteps');
  const tc = useTranslations('common');
  const [lineItems, setLineItems] = useState<LineItem[]>(
    data.lineItems?.length
      ? data.lineItems
      : [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }]
  );
  const [taxRate, setTaxRate] = useState(data.tax ?? 20);
  const [paymentSchedule, setPaymentSchedule] = useState('50/50 Split');
  const [isGenerating, setIsGenerating] = useState(false);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    const updatedItems = [...lineItems, newItem];
    setLineItems(updatedItems);
    updatePricing(updatedItems);
  };

  const removeLineItem = (id: string) => {
    const updatedItems = lineItems.filter(item => item.id !== id);
    setLineItems(updatedItems);
    updatePricing(updatedItems);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    const updatedItems = lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    });
    setLineItems(updatedItems);
    updatePricing(updatedItems);
  };

  const updatePricing = (items: LineItem[], currentTaxRate: number = taxRate) => {
    const subtotal = items.reduce((sum, item) => sum + (item?.amount || 0), 0);
    const taxAmount = subtotal * (currentTaxRate / 100);
    const total = subtotal + taxAmount;

    onUpdate({
      lineItems: items,
      subtotal,
      tax: currentTaxRate, // Store the tax RATE (percentage), not the amount
      total,
    });
  };

  const handleAIPricing = async () => {
    setIsGenerating(true);
    try {
      const payload = buildAiPayload(data, 'pricing');
      const result = await postData({ url: '/crm/proposals/ai-draft/', data: payload });

      if (result?.line_items && Array.isArray(result.line_items) && result.line_items.length > 0) {
        const newItems: LineItem[] = result.line_items.map((item: any, i: number) => ({
          id: Date.now().toString() + i,
          description: item.description || '',
          quantity: Number(item.quantity) || 1,
          rate: Number(item.rate) || 0,
          amount: Number(item.amount) || Number(item.quantity || 1) * Number(item.rate || 0),
        }));
        setLineItems(newItems);
        updatePricing(newItems);
        toast({ description: 'Pricing populated by AI ✨', duration: 2500 });
      } else {
        toast({ description: 'AI returned no line items', variant: 'destructive', duration: 3000 });
      }
    } catch (error: any) {
      const msg =
        error?.response?.data
          ? JSON.stringify(error.response.data)
          : error?.message || 'AI pricing failed';
      toast({ description: msg, variant: 'destructive', duration: 3000 });
    } finally {
      setIsGenerating(false);
    }
  };

  const subtotal = data.subtotal || 0;
  const taxRateValue = data.tax || 0; // This is now the rate percentage
  const taxAmount = subtotal * (taxRateValue / 100);
  const total = data.total || 0;
  const currencySymbol = data.currency === 'USD' ? '$' : data.currency === 'EUR' ? '€' : '£';

  return (
    <div className="space-y-6">
      {/* Line Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-gray-900">
            {t('lineItems')} <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIPricing}
              disabled={isGenerating}
              className="gap-2 h-8 text-xs"
            >
              {isGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3 text-amber-500" />
              )}
              {isGenerating ? 'Generating…' : 'AI Suggest'}
            </Button>
            <Button variant="outline" size="sm" onClick={addLineItem} className="gap-2 h-8 text-xs">
              <Plus className="w-3 h-3" />
              Add Item
            </Button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500" style={{ width: '40%' }}>
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500" style={{ width: '15%' }}>
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500" style={{ width: '20%' }}>
                  Rate
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500" style={{ width: '20%' }}>
                  Amount
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500" style={{ width: '5%' }}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lineItems.map((item) => (
                <tr key={item.id} className="bg-white">
                  <td className="px-4 py-2">
                    <Input
                      placeholder={t('descriptionPlaceholder')}
                      value={item.description}
                      onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                      className="border-0 p-0 h-8 focus-visible:ring-0 bg-transparent text-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.quantity}
                      onChange={e => updateLineItem(item.id, 'quantity', Number.parseFloat(e.target.value) || 0)}
                      className="border-0 p-0 h-8 focus-visible:ring-0 bg-transparent text-center text-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1 text-sm">{currencySymbol}</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={e => updateLineItem(item.id, 'rate', Number.parseFloat(e.target.value) || 0)}
                        className="border-0 p-0 h-8 focus-visible:ring-0 bg-transparent text-sm"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium tabular-nums text-gray-900 text-sm">
                      {currencySymbol}
                      {(item?.amount || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {lineItems.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(item.id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{t('subtotal')}</span>
          <span className="text-sm font-medium tabular-nums text-gray-900">
            {currencySymbol}{subtotal.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{t('tax')}</span>
            <Select
              value={taxRate.toString()}
              onValueChange={value => {
                const rate = Number.parseInt(value);
                setTaxRate(rate);
                updatePricing(lineItems, rate);
              }}
            >
              <SelectTrigger className="w-20 h-6 text-xs bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0%</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm font-medium tabular-nums text-gray-900">
            {currencySymbol}{taxAmount.toLocaleString()}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">{t('total')}</span>
            <span className="font-bold text-lg tabular-nums text-gray-900">
              {currencySymbol}{total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-900">Payment Schedule</Label>

        <div className="grid grid-cols-3 gap-4">
          {paymentScheduleTemplates.map(template => (
            <button
              key={template.name}
              onClick={() => setPaymentSchedule(template.name)}
              className={`p-4 text-left rounded-lg border transition-colors ${
                paymentSchedule === template.name
                  ? 'border-gray-900 bg-stone-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-stone-50'
              }`}
            >
              <div className="text-sm font-medium text-gray-900 mb-2">{template.name}</div>
              <div className="space-y-1">
                {template.schedule.map((phase, index) => (
                  <div key={index} className="flex justify-between text-xs text-gray-500">
                    <span>{phase.name}</span>
                    <span>{phase.percentage}%</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
