import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gooeyToast as toast } from 'goey-toast';
import { patchData } from '@/lib/Api';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const LogisticsPill = React.memo(({ item, room, handleChangeLogistics, project, procurementPermission }: { item: any, room: any, handleChangeLogistics: any, project: any, procurementPermission: boolean }) => {
  const labels: Record<string, string> = {
    // 'IT': 'In Transit',
    'IT': 'In Transit',
    'DD': 'Delivered',
    "NO" : 'Not Ordered'
  };
  
  const defaultColor = 'bg-greige-100 text-taupe-700 border-greige-500';

  const colors: Record<string, string> = {
    'IT': 'bg-slatex-500/10 text-slatex-700 border-slatex-500/20',
    'DD': 'bg-sage-300/50 text-olive-700 border-olive-700/20',
    "NO": 'bg-greige-100 text-taupe-700 border-greige-500',
  };

  const normalize = (v: any) => v || 'NO';

  const [form, setForm] = useState({
    lead_time: item.lead_time || '',
    logistic_status: normalize(item.logistic_status),
    ETA: item.ETA || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Sync props to local state
  useEffect(() => {
    setForm({
      lead_time: item.lead_time || '',
      logistic_status: normalize(item.logistic_status),
      ETA: item.ETA || '',
    });
  }, [item]);

  const handleStatusChange = (value: string) => {
    const normalized = normalize(value);
    setForm(prev => ({ ...prev, logistic_status: normalized }));
    setIsSaving(true);
    handleChangeLogistics({ 'logistic_status': normalized }, item.id, () => setIsSaving(false));
  };

  const handleDateChange = (date: any) => {
    if (!date) return;
    const formattedDate = format(date, 'yyyy-MM-dd');
    setForm(prev => ({ ...prev, ETA: formattedDate }));
    setIsSaving(true);
    handleChangeLogistics({ 'ETA': formattedDate }, item.id, () => setIsSaving(false));
  };

  const pillColor = colors[normalize(form.logistic_status)] || defaultColor;

  if (item?.status !== 'ORD') {
    const status = normalize(item?.logistic_status);
    return (
      <span className={cn('inline-flex items-center rounded-md border h-6 px-2 text-xs font-medium whitespace-nowrap', colors[status] || defaultColor)}>
        {/* {labels[status] || 'Not ordered'} */}
        {'Not ordered'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 relative">
      {isSaving && <Loader2 className="animate-spin w-3 h-3 absolute -right-4 top-1.5  text-slatex-600" />}

      <Select disabled={!procurementPermission} value={form.logistic_status} onValueChange={handleStatusChange}>
        <SelectTrigger className={cn('h-6 w-[90px] disabled:cursor-not-allowed disabled:opacity-100 px-2 text-xs rounded-md border', pillColor)}>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(labels).map(([key, name]) => (
            <SelectItem key={key} value={key}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button disabled={!procurementPermission} variant="ghost" size="sm" className={cn("h-6 px-2 disabled:cursor-not-allowed disabled:opacity-100 text-xs font-normal text-neutral-700 hover:bg-stone-100", !form.ETA && "text-neutral-400")}>
            <CalendarIcon className="w-3 h-3 mr-1" />
            {form.ETA ? format(new Date(form.ETA), "dd MMM") : "ETA"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={form.ETA ? new Date(form.ETA) : undefined} onSelect={handleDateChange} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  );
});

LogisticsPill.displayName = 'LogisticsPill';

export default LogisticsPill;