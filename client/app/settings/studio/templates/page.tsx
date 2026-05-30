'use client';

import { useEffect, useRef, useState } from 'react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Plus, Trash2, RotateCcw, Copy, X, CheckSquare } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { gooeyToast as toast } from 'goey-toast';
import SortableList, { SortableItem, SortableKnob } from 'react-easy-sort';
import { arrayMoveImmutable } from 'array-move';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import usePatch from '@/hooks/usePatch';
import useDeleteData from '@/hooks/useDelete';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

const BASE = '/user/studio/templates/';

type ApiTask = { id: number; title: string; order: number };
type ApiPhase = { id: number; name: string; color: string; order: number; default_tasks: ApiTask[] };
type ApiTemplate = { id: number; name: string; phases: ApiPhase[] };

function StudioTemplatesPageContent() {
  const t = useTranslations('settingsTemplatesPage');
  const tc = useTranslations('common');
  const queryClient = useQueryClient();

  const { data: templatesData, isLoading } = useFetch(BASE);

  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const tasksUrl = activeTemplateId && selectedPhaseId
    ? `${BASE}${activeTemplateId}/phases/${selectedPhaseId}/tasks/`
    : null;
  const { data: tasksData, isLoading: loadingTasks } = useFetch(tasksUrl);

  const activeTemplate = templates.find(t => t.id === activeTemplateId) ?? templates[0] ?? null;
  const selectedPhase = activeTemplate?.phases.find(p => p.id === selectedPhaseId) ?? null;

  // ── Load templates ──────────────────────────────────────────────────────
  useEffect(() => {
    if (templatesData) {
      const list = templatesData as ApiTemplate[];
      setTemplates(list);
      if (list.length > 0 && !activeTemplateId) {
        setActiveTemplateId(list[0].id);
        const firstPhase = list[0].phases[0];
        if (firstPhase) setSelectedPhaseId(firstPhase.id);
      }
    }
  }, [templatesData]);

  const tasks: ApiTask[] = (tasksData as ApiTask[] | undefined) ?? [];

  // ── Mutations ───────────────────────────────────────────────────────────
  const { mutate: createTemplate, isPending: isCreatingTemplate } = usePost({
    onSuccess: (data: any) => {
      setTemplates(prev => [...prev, data]);
      setActiveTemplateId(data.id);
      setSelectedPhaseId(null);
      queryClient.invalidateQueries({ queryKey: [BASE] });
    },
    onError: () => toast.error(t('toasts.createTemplateFailed')),
  });

  const { mutate: renameTemplate } = usePatch({
    onSuccess: (data: any) => {
      setTemplates(prev => prev.map(tpl => tpl.id === data.id ? { ...tpl, name: data.name } : tpl));
    },
    onError: () => toast.error(t('toasts.renameTemplateFailed')),
  });

  const { mutate: deleteTemplate } = useDeleteData({
    onSuccess: () => {
      const remaining = templates.filter(tpl => tpl.id !== activeTemplateId);
      setTemplates(remaining);
      setActiveTemplateId(remaining[0]?.id ?? null);
      setSelectedPhaseId(null);
      toast.success(t('toasts.templateDeleted'));
    },
    onError: () => toast.error(t('toasts.deleteTemplateFailed')),
  });

  const { mutate: createPhase } = usePost({
    onSuccess: (data: any) => {
      setTemplates(prev => prev.map(tpl =>
        tpl.id === activeTemplateId ? { ...tpl, phases: [...tpl.phases, data] } : tpl
      ));
      setSelectedPhaseId(data.id);
    },
    onError: () => toast.error(t('toasts.createPhaseFailed')),
  });

  const { mutate: updatePhase } = usePatch({
    onSuccess: (data: any) => {
      setTemplates(prev => prev.map(tpl =>
        tpl.id === activeTemplateId
          ? { ...tpl, phases: tpl.phases.map(p => p.id === data.id ? { ...p, ...data } : p) }
          : tpl
      ));
    },
    onError: () => toast.error(t('toasts.updatePhaseFailed')),
  });

  const { mutate: removePhase } = useDeleteData({
    onSuccess: (_: any, vars: any) => {
      const phaseId = vars._phaseId;
      setTemplates(prev => prev.map(tpl =>
        tpl.id === activeTemplateId
          ? { ...tpl, phases: tpl.phases.filter(p => p.id !== phaseId) }
          : tpl
      ));
      if (selectedPhaseId === phaseId) {
        const remaining = activeTemplate?.phases.filter(p => p.id !== phaseId) ?? [];
        setSelectedPhaseId(remaining[0]?.id ?? null);
      }
      toast.success(t('toasts.phaseDeleted'));
    },
    onError: () => toast.error(t('toasts.deletePhaseFailed')),
  });

  const { mutate: createTask } = usePost({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tasksUrl] });
    },
    onError: () => toast.error(t('toasts.addTaskFailed')),
  });

  const { mutate: removeTask } = useDeleteData({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tasksUrl] });
    },
    onError: () => toast.error(t('toasts.deleteTaskFailed')),
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleAddTemplate() {
    createTemplate({ url: BASE, data: { name: t('newTemplateName') } });
  }

  function handleDeleteTemplate() {
    if (templates.length <= 1) { toast.error(t('toasts.cantDeleteLast')); return; }
    deleteTemplate({ url: `${BASE}${activeTemplateId}/`, data: undefined });
  }

  function handleTemplateNameBlur(name: string) {
    if (!activeTemplateId) return;
    renameTemplate({ url: `${BASE}${activeTemplateId}/`, data: { name } });
  }

  function handleAddPhase() {
    if (!activeTemplateId) return;
    createPhase({ url: `${BASE}${activeTemplateId}/phases/`, data: { name: t('newPhaseName'), color: '#9CA3AF' } });
  }

  function handleDeletePhase(phaseId: number) {
    if (!activeTemplateId) return;
    removePhase({ url: `${BASE}${activeTemplateId}/phases/${phaseId}/`, data: undefined, _phaseId: phaseId } as any);
  }

  function handlePhaseNameBlur(phaseId: number, name: string) {
    if (!activeTemplateId) return;
    updatePhase({ url: `${BASE}${activeTemplateId}/phases/${phaseId}/`, data: { name } });
  }

  function handlePhaseColorBlur(phaseId: number, color: string) {
    if (!activeTemplateId) return;
    updatePhase({ url: `${BASE}${activeTemplateId}/phases/${phaseId}/`, data: { color } });
  }

  function handleSortEnd(oldIndex: number, newIndex: number) {
    if (!activeTemplate) return;
    const reordered = arrayMoveImmutable(activeTemplate.phases, oldIndex, newIndex);
    // Update local state immediately
    setTemplates(prev => prev.map(t => t.id === activeTemplateId ? { ...t, phases: reordered } : t));
    // PATCH each phase with new order
    reordered.forEach((p, idx) => {
      updatePhase({ url: `${BASE}${activeTemplateId}/phases/${p.id}/`, data: { order: idx } });
    });
  }

  function handleAddTask(title: string) {
    if (!activeTemplateId || !selectedPhaseId) return;
    createTask({
      url: `${BASE}${activeTemplateId}/phases/${selectedPhaseId}/tasks/`,
      data: { title },
    });
  }

  function handleDeleteTask(taskId: number) {
    if (!activeTemplateId || !selectedPhaseId) return;
    removeTask({ url: `${BASE}${activeTemplateId}/phases/${selectedPhaseId}/tasks/${taskId}/`, data: undefined, _taskId: taskId } as any);
  }

  function handleSelectTemplate(id: number) {
    setActiveTemplateId(id);
    const tpl = templates.find(t => t.id === id);
    const firstPhase = tpl?.phases[0];
    setSelectedPhaseId(firstPhase?.id ?? null);
  }

  function handleSelectPhase(id: number) {
    setSelectedPhaseId(id);
  }

  if (isLoading && templates.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        <div className="h-[600px] animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-stone-500">{t('description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-0 rounded-xl border border-gray-200 bg-white overflow-hidden min-h-[600px]">

        {/* LEFT: Template list */}
        <div className="border-r border-stone-200 flex flex-col">
          <div className="px-3 py-2.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">{t('templatesLabel')}</span>
            <button
              onClick={handleAddTemplate}
              disabled={isCreatingTemplate}
              className="text-stone-400 hover:text-gray-700 transition-colors disabled:opacity-40"
              title={t('newTemplate')}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t.id)}
                className={`w-full text-left px-3 py-2.5 border-b border-stone-100 text-sm transition-colors ${t.id === activeTemplateId ? 'bg-stone-100 text-gray-900 font-medium' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="border-t border-stone-200 px-3 py-2 flex gap-1">
            <button
              title={t('duplicate')}
              className="text-xs text-stone-400 hover:text-gray-600 flex items-center gap-1"
              onClick={() => toast(t('duplicateComingSoon'))}
            >
              <Copy className="h-3 w-3" /> {t('duplicate')}
            </button>
            <span className="text-stone-200 mx-1">|</span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="text-xs text-red-400 hover:text-red-600">{t('delete')}</button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('deleteTemplateTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('deleteTemplateDescription', { name: activeTemplate?.name ?? '' })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteTemplate}>
                    {tc('delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* RIGHT: Template editor */}
        {activeTemplate && (
          <div className="flex flex-col divide-y divide-stone-100">

            {/* Template name */}
            <div className="px-5 py-3 flex items-center gap-3 bg-white">
              <span className="text-xs text-stone-400 shrink-0">{t('name')}</span>
              <Input
                key={activeTemplate.id}
                defaultValue={activeTemplate.name}
                onBlur={e => handleTemplateNameBlur(e.target.value)}
                className="h-7 text-sm focus-visible:ring-0 px-0 bg-transparent border-0 border-b border-gray-200"
              />
            </div>

            {/* Phase list */}
            <div className="px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-stone-500">{t('phases')}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-stone-500 hover:text-gray-700 px-2"
                  onClick={handleAddPhase}
                >
                  <Plus className="h-3 w-3 mr-1" /> {t('addPhase')}
                </Button>
              </div>

              <SortableList
                onSortEnd={handleSortEnd}
                className="space-y-1"
                draggedItemClassName="opacity-60"
              >
                {activeTemplate.phases.map(p => (
                  <SortableItem key={p.id}>
                    <div
                      onClick={() => handleSelectPhase(p.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${selectedPhaseId === p.id ? 'border-gray-300 bg-stone-50' : 'border-gray-200 bg-white hover:bg-stone-50'}`}
                    >
                      <SortableKnob>
                        <div className="cursor-grab">
                          <GripVertical className="h-4 w-4 text-stone-300 shrink-0" />
                        </div>
                      </SortableKnob>
                      <div className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-sm text-gray-700 flex-1 truncate">{p.name || t('untitledPhase')}</span>
                      <span className="text-xs text-stone-400">{t('tasksCount', { count: p.default_tasks?.length ?? 0 })}</span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            onClick={e => e.stopPropagation()}
                            className="text-stone-300 hover:text-red-400 transition-colors ml-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('deletePhaseTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('deletePhaseDescription', { name: p.name || t('untitledPhase') })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => handleDeletePhase(p.id)}>
                              {tc('delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </SortableItem>
                ))}
              </SortableList>
            </div>

            {/* Selected phase editor */}
            {selectedPhase && (
              <div className="px-5 py-4 flex-1 bg-stone-50/50">
                <p className="text-xs font-medium text-stone-500 mb-3">{t('editPhase')}</p>
                <div className="grid grid-cols-[1fr_auto] gap-3 mb-4">
                  <Input
                    key={selectedPhase.id + '-name'}
                    defaultValue={selectedPhase.name}
                    onBlur={e => handlePhaseNameBlur(selectedPhase.id, e.target.value)}
                    placeholder={t('phaseNamePlaceholder')}
                    className="h-8 text-sm"
                  />
                  <PhaseColorPicker
                    key={selectedPhase.id + '-color'}
                    color={selectedPhase.color}
                    onChange={color => handlePhaseColorBlur(selectedPhase.id, color)}
                  />
                </div>

                <TaskListEditor
                  tasks={tasks}
                  loading={loadingTasks}
                  onAdd={handleAddTask}
                  onDelete={handleDeleteTask}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


/* ── PhaseColorPicker ───────────────────────────────────────────────────── */
const SWATCHES = [
  '#9CA3AF','#EF4444','#F97316','#EAB308',
  '#22C55E','#14B8A6','#3B82F6','#6366F1',
  '#8B5CF6','#EC4899','#F43F5E','#78716C',
];

function PhaseColorPicker({ color, onChange }: { color: string; onChange: (color: string) => void }) {
  const t = useTranslations('settingsTemplatesPage');
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(color);

  function pick(c: string) {
    setCurrent(c);
    onChange(c);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-8 w-8 rounded-md border border-gray-200 flex-shrink-0 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
          style={{ backgroundColor: current }}
          title={t('pickPhaseColor')}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 rounded-xl shadow-lg" align="end" sideOffset={6}>
        <p className="text-xs font-medium text-stone-400 mb-2">{t('phaseColor')}</p>
        <div className="grid grid-cols-6 gap-1.5 mb-2">
          {SWATCHES.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => pick(c)}
              className={cn(
                'w-6 h-6 rounded-md border-2 transition-transform hover:scale-110',
                current === c ? 'border-gray-700' : 'border-transparent'
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
          <input
            type="color"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            onBlur={e => pick(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
          />
          <span className="text-xs text-stone-400">{t('customColor')}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ── TaskListEditor ─────────────────────────────────────────────────────── */
function TaskListEditor({
  tasks,
  loading,
  onAdd,
  onDelete,
}: {
  tasks: ApiTask[];
  loading: boolean;
  onAdd: (title: string) => void;
  onDelete: (id: number) => void;
}) {
  const t = useTranslations('settingsTemplatesPage');
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft('');
    inputRef.current?.focus();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <CheckSquare className="h-3.5 w-3.5 text-stone-400" />
        <p className="text-xs font-medium text-stone-500">{t('defaultTasks')}</p>
        <span className="ml-auto text-[10px] text-stone-400">{t('tasksCount', { count: tasks.length })}</span>
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
        {loading ? (
          <p className="text-xs text-stone-400 py-2 text-center">{t('loadingTasks')}</p>
        ) : tasks.length === 0 ? (
          <p className="text-xs text-stone-400 py-2 text-center">{t('noTasksYet')}</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 group rounded-lg border border-gray-100 bg-white px-3 py-2 hover:border-gray-200 transition-colors">
              <div className="h-1.5 w-1.5 rounded-full bg-stone-300 flex-shrink-0" />
              <span className="text-sm text-gray-700 flex-1 leading-snug">{task.title}</span>
              <button
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all flex-shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 h-8 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-gray-400 placeholder:text-stone-300"
          placeholder={t('addTaskPlaceholder')}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          onClick={add}
          disabled={!draft.trim()}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-stone-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-40 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function StudioTemplatesPage() {
  return (
    <PermissionGuard permission="settings.edit" redirectTo="/settings/user/profile">
      <StudioTemplatesPageContent />
    </PermissionGuard>
  );
}
