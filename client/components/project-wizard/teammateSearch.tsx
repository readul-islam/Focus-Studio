'use client';

import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Check } from 'lucide-react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { TypeChip } from '../chip';
import { useTranslations } from 'next-intl';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

const TeamAssignment = ({ users, selectedTeammates, setSelectedTeammates }: {
  users: any[];
  selectedTeammates: any[];
  setSelectedTeammates: (teammates: any[]) => void;
}) => {
  const t = useTranslations('teammateSearch');
  const [openPop, setOpenPop] = useState(false);

  const toggleTeammate = (teammate: any) => {
    if (selectedTeammates.some(tm => tm.id === teammate.id)) {
      setSelectedTeammates(selectedTeammates.filter(tm => tm.id !== teammate.id));
    } else {
      setSelectedTeammates([...selectedTeammates, teammate]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Popover open={openPop} onOpenChange={setOpenPop}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={openPop}
              className="w-full justify-between bg-white h-9 text-sm rounded-xl"
            >
              <span className="flex items-center gap-2 overflow-hidden">
                {selectedTeammates?.length > 0 ? (
                  <>
                    <div className="flex -space-x-2">
                      {selectedTeammates.slice(0, 4).map(m => (
                        <Avatar key={m.id} className="h-6 w-6 ring-2 ring-white">
                          <AvatarImage src={m?.photoURL || ''} alt={m.name} />
                          <AvatarFallback className="text-[10px]">{getInitials(m.name)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="truncate text-sm text-gray-600">
                      {t('selectedCount', { count: selectedTeammates.length })}
                      {selectedTeammates.length > 4
                        ? ` ${t('selectedOverflow', { extra: selectedTeammates.length - 4 })}`
                        : ''}
                    </span>
                  </>
                ) : (
                  <span className="flex items-center gap-2 text-gray-500">
                    <Search className="h-4 w-4" />
                    {t('searchPlaceholder')}
                  </span>
                )}
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="p-0 w-[360px] rounded-xl border border-gray-200 shadow-md" align="start">
            <Command>
              <CommandInput
                placeholder={t('searchPlaceholder')}
                className="focus-visible:ring-gray-300 focus-visible:ring-offset-0 focus:outline-none"
              />
              <CommandEmpty>{t('noPeopleFound')}</CommandEmpty>
              <CommandList className="max-h-64">
                <CommandGroup>
                  {users?.map(m => {
                    const checked = selectedTeammates.some(a => a.id === m.id);
                    return (
                      <CommandItem key={m.id} value={m.name} className="flex items-center gap-2" onSelect={() => toggleTeammate(m)}>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleTeammate(m)}
                          className="focus-visible:ring-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
                        />
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={m?.photoURL || ''} alt={m.name} />
                          <AvatarFallback className="text-[10px]">{getInitials(m.name)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{m.name}</span>
                        {checked && <Check className="ml-auto h-4 w-4 text-gray-500" />}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedTeammates?.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedTeammates([])}>
            {t('clear')}
          </Button>
        )}
      </div>

      {selectedTeammates?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTeammates?.map(m => (
            <span key={m?.id} onClick={() => toggleTeammate(m)}>
              <TypeChip label={m?.name} className="cursor-pointer" />
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamAssignment;
