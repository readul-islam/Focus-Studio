'use client';

import { StatCard } from '@/components/StatCard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loader from '@/components/ui/loader';
import { useFetch } from '@/hooks/useFetch';
import { formatCurrency } from '@/lib/utils';
import type { SupplierAnalytics } from '@/types/supplier';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function AnalyticsPage() {
  const { data, isLoading } = useFetch<SupplierAnalytics>('supplier_portal/analytics/');

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  const { summary, monthly_sales, top_products, studio_breakdown, category_breakdown, fulfillment, payment_breakdown } =
    data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Revenue trends, top products, studio demand, and fulfillment performance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Revenue this month"
            value={formatCurrency(summary.month_revenue)}
            subtitle={`${formatCurrency(summary.month_paid_revenue)} paid`}
          />
          <StatCard
            title="Lifetime revenue"
            value={formatCurrency(summary.lifetime_revenue)}
            subtitle={`${formatCurrency(summary.lifetime_paid_revenue)} paid`}
          />
          <StatCard title="Orders this month" value={summary.month_orders} subtitle={`${summary.month_units} units`} />
          <StatCard
            title="Delivery rate"
            value={`${fulfillment.delivery_rate}%`}
            subtitle={`${fulfillment.delivered_count} delivered`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue trend</CardTitle>
            </CardHeader>
            <CardContent>
              {monthly_sales.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-500">No sales data yet.</p>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthly_sales}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number, name: string) =>
                          name.toLowerCase().includes('revenue') ? formatCurrency(value) : value
                        }
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#1e1e1e" strokeWidth={2} name="Revenue" />
                      <Line type="monotone" dataKey="paid_revenue" stroke="#059669" strokeWidth={2} name="Paid revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payment_breakdown.length === 0 ? (
                <p className="text-sm text-neutral-500">No orders yet.</p>
              ) : (
                payment_breakdown.map(item => (
                  <div key={item.payment_status} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-neutral-600">{item.payment_status}</span>
                    <span className="font-semibold text-gray-900">{item.count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top products</CardTitle>
            </CardHeader>
            <CardContent>
              {top_products.length === 0 ? (
                <p className="text-sm text-neutral-500">No product sales yet.</p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={top_products} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="revenue" fill="#1e1e1e" name="Revenue" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top studios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {studio_breakdown.length === 0 ? (
                <p className="text-sm text-neutral-500">No studio orders yet.</p>
              ) : (
                studio_breakdown.map(studio => (
                  <div key={studio.studio_id} className="flex items-center justify-between gap-4 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{studio.name}</p>
                      <p className="text-neutral-500">{studio.orders} orders</p>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrency(studio.revenue)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Published categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {category_breakdown.length === 0 ? (
                <p className="text-sm text-neutral-500">No published categories yet.</p>
              ) : (
                category_breakdown.map(item => (
                  <div key={item.category} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">{item.category}</span>
                    <span className="font-semibold text-gray-900">{item.product_count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fulfillment snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Shipped</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{fulfillment.shipped_count}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Delivered</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{fulfillment.delivered_count}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Paid orders</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{fulfillment.paid_orders}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Awaiting payment</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{fulfillment.unpaid_orders}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
