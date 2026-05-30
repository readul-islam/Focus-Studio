'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  ChevronLeft,
  Loader2,
  FolderOpen,
  Home,
  Check,
  Minus,
  Plus,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useFetch from '@/hooks/useFetch';
import { ViewCurrencySymbol } from '@/components/ViewCurrencySymbol';
import { useTranslations } from 'next-intl';

interface Project {
  id: number;
  project_name: string;
  project_status: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  total_budget?: number;
  currency?: string;
  client?: {
    name?: string;
    surname?: string;
    company_name?: string;
  };
  assignees?: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  rooms?: number[];
}

interface Room {
  id: number;
  name: string;
}

interface ProductInfo {
  id: number;
  name: string;
  tader_price?: number;
  regular_price?: number;
  currency?: string;
  images?: Array<{ image: string; is_primary?: boolean }>;
}

interface AddToProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductInfo | null;
  onSubmit: (data: {
    projectId: number;
    roomId: number;
    quantity: number;
    productId: number;
  }) => void;
}

type Step = 'project' | 'room';

// Animation variants - optimized for speed
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
  }),
};

const slideTransition = {
  type: 'tween',
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smooth feel
};

const fadeInUp = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const listItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function AddToProjectDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
}: AddToProjectDialogProps) {
  const t = useTranslations('addToProjectDialog');
  const [step, setStep] = useState<Step>('project');
  const [direction, setDirection] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch projects
  const { data: projectsData, isLoading: projectsLoading } = useFetch(
    'projects/user-projects/'
  );

  // Fetch rooms for selected project
  const { data: projectRooms, isLoading: roomsLoading } = useFetch(
    selectedProject ? `/projects/project-rooms?project_id=${selectedProject.id}` : null
  );

  // Filter active projects and apply search
  const filteredProjects = useMemo(() => {
    if (!projectsData) return [];
    return projectsData
      .filter((p: Project) => p.project_status === 'AC')
      .filter((p: Project) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          p.project_name?.toLowerCase().includes(query) ||
          p.location?.toLowerCase().includes(query) ||
          p.client?.name?.toLowerCase().includes(query) ||
          p.client?.company_name?.toLowerCase().includes(query)
        );
      });
  }, [projectsData, searchQuery]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('project');
        setDirection(0);
        setSearchQuery('');
        setSelectedProject(null);
        setSelectedRoomId(null);
        setQuantity(1);
      }, 200);
    }
  }, [open]);

  const handleProjectSelect = (project: Project) => {
    setDirection(1);
    setSelectedProject(project);
    setStep('room');
  };

  const handleBack = () => {
    setDirection(-1);
    setStep('project');
    setSelectedRoomId(null);
    setQuantity(1);
  };

  const handleSubmit = () => {
    if (!selectedProject || !selectedRoomId || !product) return;
    onSubmit({
      projectId: selectedProject.id,
      roomId: Number(selectedRoomId),
      quantity,
      productId: product.id,
    });
    onOpenChange(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric',
    });
  };

  const getClientName = (project: Project) => {
    if (project.client?.company_name) return project.client.company_name;
    if (project.client?.name) {
      return `${project.client.name} ${project.client.surname || ''}`.trim();
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] duration-300 p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              {step === 'room' && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleBack}
                  className="flex items-center justify-center w-8 h-8 -ml-1 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-neutral-600" />
                </motion.button>
              )}
            </AnimatePresence>
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <DialogTitle className="text-base font-semibold text-neutral-900">
                    {step === 'project' ? t('titleProject') : t('titleRoom')}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-neutral-500 mt-0.5">
                    {step === 'project'
                      ? t('descProject')
                      : t('descRoom', { projectName: selectedProject?.project_name ?? '' })}
                  </DialogDescription>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            {step === 'project' ? (
              <motion.div
                key="project-step"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="flex flex-col"
              >
                {/* Search */}
                <div className="px-6 py-4 border-b border-neutral-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 bg-stone-50 border-neutral-200 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Project List */}
                <ScrollArea className="h-[360px]">
                  <div className="px-3 py-2">
                    {projectsLoading ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center py-12"
                      >
                        <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
                      </motion.div>
                    ) : filteredProjects.length === 0 ? (
                      <motion.div
                        {...fadeInUp}
                        className="flex flex-col items-center justify-center py-12 text-center"
                      >
                        <FolderOpen className="w-10 h-10 text-neutral-300 mb-3" />
                        <p className="text-sm font-medium text-neutral-600">
                          {searchQuery ? t('noProjectsFound') : t('noActiveProjects')}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {searchQuery
                            ? t('tryDifferentSearch')
                            : t('createProjectHint')}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="space-y-1"
                      >
                        {filteredProjects.map((project: Project, index: number) => (
                          <motion.button
                            key={project.id}
                            variants={listItem}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                            // whileHover={{ backgroundColor: 'rgb(250 250 250)' }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleProjectSelect(project)}
                            className="w-full hover:bg-stone-100 text-left px-3 py-3 rounded-lg transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              {/* Project Icon */}
                              <motion.div
                                // whileHover={{ scale: 1.05 }}
                                className="flex items-center justify-center w-10 h-10 rounded-lg bg-stone-100 shrink-0 group-hover:bg-stone-200 transition-colors"
                              >
                                <FolderOpen className="w-5 h-5 text-neutral-500" />
                              </motion.div>

                              {/* Project Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm capitalize font-medium text-neutral-900 truncate">
                                    {project.project_name}
                                  </h4>
                                </div>

                                {/* Meta info row */}
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
                                  {getClientName(project) && (
                                    <span className="flex items-center gap-1 truncate max-w-[120px]">
                                      <Users className="w-3 h-3 shrink-0" />
                                      {getClientName(project)}
                                    </span>
                                  )}
                                  {project.location && (
                                    <span className="flex items-center gap-1 max-w-[120px] truncate">
                                      <MapPin className="w-3 h-3 shrink-0" />
                                      <span className="truncate">{project.location}</span>
                                    </span>
                                  )}
                                  {project.end_date && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 shrink-0" />
                                      {formatDate(project.end_date)}
                                    </span>
                                  )}
                                </div>

                                {/* Budget & Assignees */}
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                                      <ViewCurrencySymbol code={project.currency} />
                                      {project?.total_budget?.toLocaleString() || 0}
                                    </span>
                           
                                  {project.assignees && project.assignees.length > 0 && (
                                    <div className="flex items-center -space-x-1.5">
                                      {project.assignees.slice(0, 3).map((assignee) => (
                                        <Avatar
                                          key={assignee.id}
                                          className="w-5 h-5 border-2 border-white"
                                        >
                                          <AvatarFallback className="text-[9px] bg-stone-200 text-neutral-600">
                                            {assignee.name?.charAt(0) || '?'}
                                          </AvatarFallback>
                                        </Avatar>
                                      ))}
                                      {project.assignees.length > 3 && (
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-stone-100 border-2 border-white text-[9px] font-medium text-neutral-500">
                                          +{project.assignees.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Arrow */}
                              <motion.div
                                initial={{ x: 0 }}
                                whileHover={{ x: 3 }}
                                className="shrink-0 mt-3"
                              >
                                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                              </motion.div>
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            ) : (
              <motion.div
                key="room-step"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="flex flex-col"
              >
                {/* Selected Project Summary */}
                {selectedProject && (
                  <div className="px-6 py-4 bg-stone-50 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-neutral-200">
                        <FolderOpen className="w-4 h-4 text-neutral-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {selectedProject.project_name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {getClientName(selectedProject) || selectedProject.location || t('noDetails')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Room Selection */}
                <ScrollArea className="h-[280px]">
                  <div className="px-6 py-4">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                      {t('selectRoom')}
                    </p>

                    {roomsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
                      </div>
                    ) : projectRooms && projectRooms.length > 0 ? (
                      <RadioGroup
                        value={selectedRoomId || ''}
                        onValueChange={setSelectedRoomId}
                        className="space-y-2"
                      >
                        <motion.div
                          variants={staggerContainer}
                          initial="initial"
                          animate="animate"
                          className="space-y-2"
                        >
                          {projectRooms.map((room: Room, index: number) => (
                            <motion.label
                              key={room.id}
                              variants={listItem}
                              transition={{ duration: 0.15, delay: index * 0.02 }}
                              // whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              htmlFor={`room-${room.id}`}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                                selectedRoomId === String(room.id)
                                  ? 'border-neutral-900 bg-stone-50 ring-1 ring-neutral-900'
                                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-stone-50'
                              )}
                            >
                              <motion.div
                                animate={{
                                  backgroundColor: selectedRoomId === String(room.id) ? '#171717' : '#f5f5f5',
                                }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center justify-center w-8 h-8 rounded-lg"
                              >
                                <Home
                                  className={cn(
                                    'w-4 h-4 transition-colors',
                                    selectedRoomId === String(room.id)
                                      ? 'text-white'
                                      : 'text-neutral-500'
                                  )}
                                />
                              </motion.div>
                              <span className="flex-1 text-sm font-medium text-neutral-900">
                                {room.name}
                              </span>
                              <RadioGroupItem
                                value={String(room.id)}
                                id={`room-${room.id}`}
                                className="sr-only"
                              />
                              <AnimatePresence>
                                {selectedRoomId === String(room.id) && (
                                  <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-900"
                                  >
                                    <Check className="w-3 h-3 text-white" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.label>
                          ))}
                        </motion.div>
                      </RadioGroup>
                    ) : (
                      <motion.div
                        {...fadeInUp}
                        className="flex flex-col items-center justify-center py-12 text-center"
                      >
                        <Home className="w-10 h-10 text-neutral-300 mb-3" />
                        <p className="text-sm font-medium text-neutral-600">{t('noRoomsFound')}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {t('addRoomsHint')}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                {/* Quantity Section */}
                {selectedRoomId && (
                  <div className="px-6 py-3 border-t border-neutral-100 bg-stone-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{t('quantity')}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {t('quantityHint')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-white rounded-lg border border-neutral-200 p-1">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={quantity <= 1}
                          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-stone-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <Input
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                          className="w-14 h-8 text-center border-0 bg-transparent focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => q + 1)}
                          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-stone-100 active:scale-95 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <AnimatePresence>
          {step === 'room' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-4 border-t border-neutral-200 bg-white"
            >
              <div className="flex items-center gap-3">
                {/* Product Preview */}
                {product && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden shrink-0">
                      {product.images?.[0]?.image ? (
                        <img
                          src={product.images.find((i) => i.is_primary)?.image || product.images[0].image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-neutral-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm max-w-[260px] font-medium text-neutral-900 truncate">
                        {product.name}
                      </p>
                      <motion.p
                        key={quantity}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-neutral-500"
                      >
                        {quantity > 1 ? t('units', { count: quantity }) : t('unit')}
                      </motion.p>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedRoomId}
                    className="shrink-0"
                  >
                    {t('submit')}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
