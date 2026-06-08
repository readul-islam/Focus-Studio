'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { postData } from '@/lib/api';
import type { SupplierOrderLine } from '@/types/supplier';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type OrderQuoteFormProps = {
  order: SupplierOrderLine;
  queryKey: string;
};

export function OrderQuoteForm({ order, queryKey }: OrderQuoteFormProps) {
  const queryClient = useQueryClient();
  const [unitPrice, setUnitPrice] = useState(order.unit_price || '');
  const [leadTimeDays, setLeadTimeDays] = useState(
    order.quoted_lead_time_days ? String(order.quoted_lead_time_days) : '',
  );
  const [notes, setNotes] = useState(order.quote_notes || '');

  const submitMutation = useMutation({
    mutationFn: () =>
      postData<SupplierOrderLine>(`supplier_portal/orders/${order.id}/submit-quote/`, {
        unit_price: unitPrice,
        lead_time_days: leadTimeDays ? Number(leadTimeDays) : null,
        notes,
      }),
    onSuccess: () => {
      toast.success('Quote submitted to studio');
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: ['supplier_portal/dashboard/'] });
    },
    onError: () => toast.error('Could not submit quote'),
  });

  if (order.quote_status !== 'RQ') {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-amber-900">Quote requested</p>
        <p className="text-sm text-amber-800">Submit your trade price and lead time for this studio request.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`quote-price-${order.id}`}>Unit price ({order.currency})</Label>
          <Input
            id={`quote-price-${order.id}`}
            type="number"
            min="0"
            step="0.01"
            value={unitPrice}
            onChange={event => setUnitPrice(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`quote-lead-${order.id}`}>Lead time (days)</Label>
          <Input
            id={`quote-lead-${order.id}`}
            type="number"
            min="1"
            value={leadTimeDays}
            onChange={event => setLeadTimeDays(event.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`quote-notes-${order.id}`}>Notes</Label>
        <Textarea
          id={`quote-notes-${order.id}`}
          value={notes}
          onChange={event => setNotes(event.target.value)}
          placeholder="Availability, finishes, MOQ, delivery notes..."
        />
      </div>
      <Button size="sm" disabled={submitMutation.isPending || !unitPrice} onClick={() => submitMutation.mutate()}>
        Submit quote
      </Button>
    </div>
  );
}
