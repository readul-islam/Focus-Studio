'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import TimeKeeper from 'react-timekeeper';

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  displayTimeOnly?: boolean;
}

export function DateTimePicker({ value, onChange, placeholder = 'Pick a date and time', className, displayTimeOnly = false }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);
  const [timeValue, setTimeValue] = React.useState<string>(
    value ? `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}` : '00:00'
  );

  React.useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setTimeValue(`${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}`);
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && timeValue) {
      const [hours, minutes] = timeValue.split(':');
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      onChange?.(newDate);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    
    if (selectedDate && newTime) {
      const [hours, minutes] = newTime.split(':');
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      onChange?.(newDate);
    }
  };

  const formatDateTime = (date: Date | undefined) => {
    if (!date) return null;
    
    // If displayTimeOnly is true, show only time
    if (displayTimeOnly) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    
    // Otherwise show full date and time
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? formatDateTime(selectedDate) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white" align="center" side="right">
        <div className="p-3 space-y-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="border-t pt-3 px-3">
            <div className="flex items-center gap-2">
              <Popover open={isTimePickerOpen} onOpenChange={setIsTimePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-transparent border-none shadow-none" align="center">
                   <div className="timekeeper-custom-theme relative" style={{
                      // Top header background
                      '--top-bg': '#ffffff',
                      // Top header text color (for unselected time)
                      '--top-text-color': '#6b7280',
                      // Top header selected time color
                      '--top-selected-color': '#111827',
                      // Background of the AM/PM switcher
                      '--meridiem-bg-color': '#f3f4f6',
                      // Text color of AM/PM switcher
                      '--meridiem-text-color': '#374151',
                      // Selected AM/PM background
                      '--meridiem-selected-bg-color': '#111827',
                      // Selected AM/PM text
                      '--meridiem-selected-text-color': '#ffffff',
                      // Hand Line Color
                      '--hand-line-color': '#111827',
                      // Hand Center Dot
                      '--hand-circle-center': '#111827',
                      // Hand Outer Circle (Selected Number Background) - Must be light for readability
                      '--hand-circle-outer': '#e5e7eb',
                      // Minute ticks
                      '--hand-minute-circle': '#111827',
                      // Clock face background
                      '--clock-bg': '#ffffff',
                      // Number text color
                      '--numbers-text-color': '#111827',
                   } as React.CSSProperties}>
                     <Button
                       variant="ghost"
                       size="icon"
                       className="absolute top-2 right-2 h-6 w-6 z-10 bg-white/80 hover:bg-white rounded-full"
                       onClick={() => setIsTimePickerOpen(false)}
                     >
                       <X className="h-4 w-4" />
                     </Button>
                     <TimeKeeper
                     
                        time={timeValue}
                        onChange={(newTime: any) => {
                            setTimeValue(newTime.formatted24);
                            if (selectedDate) {
                              const [hours, minutes] = newTime.formatted24.split(':');
                              const newDate = new Date(selectedDate);
                              newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                              onChange?.(newDate);
                            }
                        }}
                        switchToMinuteOnHourSelect
                     />
                   </div>
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="flex-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 px-3 pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
