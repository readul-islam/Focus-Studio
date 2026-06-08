'use client';

import { StatCard } from '@/components/StatCard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loader from '@/components/ui/loader';
import { useFetch } from '@/hooks/useFetch';
import { useSupplierUser } from '@/hooks/useSupplierUser';
import { formatCurrency, orderStatusLabel } from '@/lib/utils';
import type { SupplierDashboard } from '@/types/supplier';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function DashboardPage() {
  const { supplier } = useSupplierUser();
  const { data, isLoading } = useFetch<SupplierDashboard>('supplier_portal/dashboard/');

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  const { summary, monthly_sales, status_breakdown } = data;

  return (
    <DashboardLayout>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
        <p className="mt-1 text-sm text-neutral-500">Track catalog performance and incoming studio orders.</p>
      </div>

      {supplier && !supplier.is_verified && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4 text-sm text-amber-900">
            Your account is pending verification. You can build your catalog now, but products will only appear to
            studios once approved.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Published products" value={summary.published_products} subtitle={`${summary.total_products} total`} />
        <StatCard title="Open orders" value={summary.open_orders} subtitle={`${summary.total_orders} all time`} />
        <StatCard title="Orders this month" value={summary.month_orders} />
        <StatCard title="Units this month" value={summary.month_units} />
        <StatCard title="Revenue this month" value={formatCurrency(summary.month_revenue)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly sales</CardTitle>
          </CardHeader>
          <CardContent>
            {monthly_sales.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500">No sales data yet.</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly_sales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number, name: string) =>
                        name === 'revenue' ? formatCurrency(value) : value
                      }
                    />
                    <Bar dataKey="order_count" fill="#1e1e1e" name="Orders" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {status_breakdown.length === 0 ? (
              <p className="text-sm text-neutral-500">No orders yet.</p>
            ) : (
              status_breakdown.map(item => (
                <div key={item.status} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">{orderStatusLabel(item.status)}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
