import type { FinanceLineItem } from '@focuspilot/shared';

export type DraftLineItem = {
  key: string;
  id?: number;
  description: string;
  quantity: string;
  unitPrice: string;
};

export function createEmptyLineItem(): DraftLineItem {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: '',
    quantity: '1',
    unitPrice: '0',
  };
}

export function lineItemsFromApi(items: FinanceLineItem[] = []): DraftLineItem[] {
  if (items.length === 0) {
    return [createEmptyLineItem()];
  }

  return items.map(item => ({
    key: `item-${item.id}`,
    id: item.id,
    description: item.description ?? item.product?.name ?? '',
    quantity: String(item.quantity ?? 1),
    unitPrice: String(item.unit_price ?? 0),
  }));
}

export function buildLineItemsPayload(items: DraftLineItem[]) {
  return items
    .filter(item => item.description.trim())
    .map(item => ({
      description: item.description.trim(),
      quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1),
      unit_price: Number.parseFloat(item.unitPrice) || 0,
    }));
}

export function calcDraftTotal(items: DraftLineItem[]): number {
  return items.reduce((sum, item) => {
    const qty = Math.max(0, Number.parseInt(item.quantity, 10) || 0);
    const price = Number.parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
}

export function validateDraftLineItems(items: DraftLineItem[]): string | null {
  const filled = items.filter(item => item.description.trim());
  if (filled.length === 0) {
    return 'Add at least one line item with a description.';
  }

  for (const item of filled) {
    const price = Number.parseFloat(item.unitPrice);
    if (Number.isNaN(price) || price < 0) {
      return 'Enter a valid unit price for each line item.';
    }
  }

  return null;
}
