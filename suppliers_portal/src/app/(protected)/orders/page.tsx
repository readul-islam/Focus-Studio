'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loader from '@/components/ui/loader';
import { useFetch } from '@/hooks/useFetch';
import { updateOrderStatus } from '@/lib/api';
import { formatCurrency, formatDate, orderStatusClass, orderStatusLabel } from '@/lib/utils';
import type { SupplierOrderLine } from '@/types/supplier';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderQuoteForm } from '@/components/orders/OrderQuoteForm';
import { MapPin, Package } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const STATUS_FLOW = ['RQ', 'CF', 'SH', 'DL'] as const;

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const url =
    statusFilter === 'all'
      ? 'supplier_portal/orders/'
      : `supplier_portal/orders/?status=${statusFilter}`;

  const { data: orders, isLoading } = useFetch<SupplierOrderLine[]>(url);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateOrderStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [url] });
      queryClient.invalidateQueries({ queryKey: ['supplier_portal/dashboard/'] });
      toast.success('Order updated');
    },
    onError: () => toast.error('Could not update order'),
  });

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'RQ', label: 'Requested' },
    { id: 'CF', label: 'Confirmed' },
    { id: 'SH', label: 'Shipped' },
    { id: 'DL', label: 'Delivered' },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
          <p className="mt-1 text-sm text-neutral-500">Incoming requests from design studios with delivery details.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <Button
              key={filter.id}
              size="sm"
              variant={statusFilter === filter.id ? 'default' : 'outline'}
              onClick={() => setStatusFilter(filter.id)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : !orders?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-neutral-500">
            No orders yet. Published products will appear here when studios add them to projects.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const currentIndex = STATUS_FLOW.indexOf(order.status as (typeof STATUS_FLOW)[number]);
            const nextStatus =
              currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1
                ? STATUS_FLOW[currentIndex + 1]
                : null;

            return (
              <Card key={order.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-neutral-500" />
                      {order.product_name}
                    </CardTitle>
                    <p className="mt-1 text-sm text-neutral-500">
                      {order.studio_name} · {order.project_name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={orderStatusClass(order.status)}>{orderStatusLabel(order.status)}</Badge>
                    {order.quote_status === 'RQ' ? (
                      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">
                        Quote requested
                      </Badge>
                    ) : null}
                    {order.quote_status === 'QT' ? (
                      <Badge variant="outline" className="border-violet-300 bg-violet-50 text-violet-900">
                        Quote submitted
                      </Badge>
                    ) : null}
                    {order.payment_status ? (
                      <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'} className="capitalize">
                        {order.payment_status}
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase text-neutral-500">Quantity</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{order.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-neutral-500">Unit price</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {order.unit_price ? formatCurrency(order.unit_price, order.currency) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-neutral-500">Requested</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  {(order.delivery_address || order.delivery_city) && (
                    <div className="rounded-lg bg-neutral-50 p-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                        <div className="text-sm text-neutral-700">
                          <p className="font-medium text-gray-900">Delivery location</p>
                          <p>{order.delivery_address}</p>
                          <p>
                            {[order.delivery_city, order.delivery_postcode, order.delivery_country]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <OrderQuoteForm order={order} queryKey={url} />

                  {nextStatus && (
                    <Button
                      size="sm"
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ id: order.id, status: nextStatus })}
                    >
                      Mark as {orderStatusLabel(nextStatus)}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
