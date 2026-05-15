'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import ProductImage from '@/components/project/ProductImage';
import type { ContractorProcurementItem } from '@/lib/contractor/types';

interface ContractorProcurementTableProps {
  items: ContractorProcurementItem[];
}

const statusConfig: Record<
  ContractorProcurementItem['status'],
  { label: string; className: string }
> = {
  ordered: {
    label: 'Ordered',
    className: 'bg-slatex-600/10 text-slatex-700 border-slatex-600/30',
  },
  in_transit: {
    label: 'In Transit',
    className: 'bg-ochre-300/20 text-ochre-700 border-ochre-700/20',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-sage-600/10 text-sage-700 border-sage-600/30',
  },
  on_site: {
    label: 'On Site',
    className: 'bg-clay-600/10 text-clay-700 border-clay-600/30',
  },
  installed: {
    label: 'Installed',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
};

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ContractorProcurementTable({ items }: ContractorProcurementTableProps) {
  if (items.length === 0) {
    return (
      <Card className="p-8 text-center border-greige-500/30">
        <p className="text-neutral-500">No procurement items assigned to you.</p>
      </Card>
    );
  }

  return (
    <Card className="border-greige-500/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white border-b border-greige-500/30">
            <tr>
              <th className="text-left p-4 font-medium text-neutral-600 text-sm" style={{ width: '280px' }}>
                Item
              </th>
              <th className="text-left p-4 font-medium text-neutral-600 text-sm" style={{ width: '140px' }}>
                Room
              </th>
              <th className="text-left p-4 font-medium text-neutral-600 text-sm" style={{ width: '100px' }}>
                Qty
              </th>
              <th className="text-left p-4 font-medium text-neutral-600 text-sm" style={{ width: '120px' }}>
                Status
              </th>
              <th className="text-left p-4 font-medium text-neutral-600 text-sm" style={{ width: '120px' }}>
                ETA / Delivered
              </th>
              <th className="text-left p-4 font-medium text-neutral-600 text-sm">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const status = statusConfig[item.status];
              return (
                <tr key={item.id} className="border-b border-greige-500/20 hover:bg-stone-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={item.product_image || ''}
                        alt={item.product_name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover border border-greige-500/30 bg-white"
                      />
                      <span className="font-medium text-neutral-900 line-clamp-2">
                        {item.product_name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-neutral-600 text-sm">{item.room}</td>
                  <td className="p-4 text-neutral-900 font-medium">{item.quantity}</td>
                  <td className="p-4">
                    <Badge className={`text-xs px-2 py-0.5 border font-normal ${status.className}`}>
                      {status.label}
                    </Badge>
                  </td>
                  <td className="p-4 text-neutral-600 text-sm whitespace-nowrap">
                    {item.delivery_date ? formatDate(item.delivery_date) : formatDate(item.eta)}
                  </td>
                  <td className="p-4 text-neutral-500 text-sm">
                    <span className="line-clamp-2">{item.notes || '-'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}