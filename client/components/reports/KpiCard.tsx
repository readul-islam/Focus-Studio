'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  alert?: boolean; // red highlight
  onClick?: () => void;
  prevValue?: string | number; // previous period value for comparison
}

export function KpiCard({ label, value, sub, icon: Icon, alert, onClick, prevValue }: KpiCardProps) {
  // Calculate percentage change if prevValue is provided
  const getPercentageChange = () => {
    if (prevValue === undefined) return null;
    
    const current = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
    const previous = typeof prevValue === 'string' ? parseFloat(prevValue.toString().replace(/[^0-9.-]/g, '')) : prevValue;
    
    if (isNaN(current) || isNaN(previous) || previous === 0) return null;
    
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return change;
  };

  const percentageChange = getPercentageChange();
  const isPositive = percentageChange !== null && percentageChange > 0;
  const isNegative = percentageChange !== null && percentageChange < 0;

  return (
    <Card
      className={`p-5 border-gray-200 rounded-xl shadow-sm transition-shadow ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${alert ? 'border-red-200 bg-red-50' : 'bg-white'}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-neutral-500" />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <p className={`text-2xl font-bold tabular-nums ${alert ? 'text-red-700' : 'text-gray-900'}`}>
          {value}
        </p>
        {percentageChange !== null && (
          <div className={`flex items-center gap-1 text-xs ${
            isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-gray-500'
          }`}>
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            <span className="font-medium">
              {isPositive ? '+' : ''}{Math.abs(percentageChange).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </Card>
  );
}
