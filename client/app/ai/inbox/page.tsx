'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import { sanitizeEmailHtml } from '@/lib/sanitize-html';
import { type EmailWithAnalysis, type InboxStats } from './actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { gooeyToast as toast } from 'goey-toast';
import {
  Loader2,
  RefreshCw,
  Mail,
  AlertCircle,
  Package,
  Info,
  Paperclip,
  Building2,
  Sparkle,
  Inbox,
  ArrowRight,
  CornerUpLeft,
  CornerUpRight,
  FolderPlus,
  Archive,
  MoreHorizontal,
  ChevronsUpDown,
  Search,
  Send,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { usePost } from '@/hooks/usePost';
import useFetch from '@/hooks/useFetch';
import { useQueryClient } from '@tanstack/react-query';
import { TaskModal } from '@/components/tasks/task-modal';
import { useTaskModalStore } from '@/store/useTaskModalStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { motion, AnimatePresence } from 'framer-motion';
import { useGmailSearchStore } from '@/store/useGmailSearchStore';
import { useRouter } from 'next/navigation';
import { openGmailOAuthPopup } from '@/lib/gmail-connect';

dayjs.extend(relativeTime);

type ThreadItem = {
  thread_id: string;
  subject: string;
  snippet: string;
  sender: string;
  received_at: string;
  project: any;
  projects?: any[];
};

type PaginationInfo = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

type ThreadsResponse = {
  results: ThreadItem[];
  pagination: PaginationInfo;
};

type MessageItem = {
  id: number;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  received_at: string;
  is_sent: boolean;
  thread_id: string;
};

type SuggestedTask = {
  title: string;
  description: string;
  status: string;
  end_date: string | null;
  priority: string;
  assignees: number[];
  project: any;
  subtask: any[];
  created_task_id?: number | null;
};

type AiSummaryEmail = {
  id: number;
  message_id: string;
  suggested_tasks: SuggestedTask[];
};

type AiSummary = {
  thread_id?: string;
  summary?: string;
  email_count?: number;
  emails?: AiSummaryEmail[];
  cached?: boolean;
  updated_at?: string;
  category?: 'action_required' | 'procurement' | 'fyi';
  suggested_action?: string;
  entities?: {
    suppliers?: string[];
    amounts?: Array<{ value: number; currency: string }>;
    dates?: string[];
    items?: string[];
    people?: string[];
  };
};

function splitGmailEmail(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const quoted = doc.querySelector(".gmail_quote, blockquote");
  let quotedHtml = "";
  if (quoted) {
    quotedHtml = quoted.outerHTML;
    quoted.remove();
  }
  return {
    main: sanitizeEmailHtml(doc.body.innerHTML.trim()),
    quoted: quotedHtml ? sanitizeEmailHtml(quotedHtml) : '',
  };
}

type CategoryFilter = 'all' | 'action_required' | 'procurement' | 'fyi';

const categoryConfig = {
  action_required: {
    label: 'Action Required',
    icon: AlertCircle,
    color: 'bg-terracotta-100 text-terracotta-700 border-terracotta-200',
    dotColor: 'bg-terracotta-500',
  },
  procurement: {
    label: 'Procurement',
    icon: Package,
    color: 'bg-sage-100 text-sage-700 border-sage-200',
    dotColor: 'bg-sage-500',
  },
  fyi: {
    label: 'FYI',
    icon: Info,
    color: 'bg-stone-100 text-gray-600 border-gray-200',
    dotColor: 'bg-stone-400',
  },
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EmailRow({
  email,
  onClick,
  isSelected,
}: {
  email: EmailWithAnalysis;
  onClick: () => void;
  isSelected: boolean;
}) {
  const category = email.analysis?.category || 'fyi';
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`group flex items-start gap-3 p-3 border-b border-gray-100 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-stone-100 border-l-2 border-l-gray-900'
          : !email.isRead
            ? 'bg-white hover:bg-stone-50'
            : 'bg-stone-50/30 hover:bg-stone-50'
      }`}
    >
      {/* Unread indicator */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <div className={`w-2 h-2 rounded-full ${!email.isRead ? config.dotColor : 'bg-transparent'}`} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className={`text-sm font-medium truncate ${!email.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
            {email.fromName}
          </span>
          <span className="text-xs text-gray-500 flex-shrink-0">{formatRelativeTime(email.date)}</span>
        </div>

        <p className={`text-sm truncate mb-1 ${!email.isRead ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
          {email.subject}
        </p>

        <p className="text-xs text-gray-500 truncate mb-2">{email.snippet}</p>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* <Badge variant="outline" className={`text-xs ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge> */}
          {email.analysis?.project && email.analysis?.project !== 'Studio Tasks' && (
            <Badge variant="outline" className="text-xs bg-clay-50 text-clay-700 border-clay-200">
              <Building2 className="w-3 h-3 mr-1" />
              {email.analysis.project}
            </Badge>
          )}
          {email.hasAttachment && <Paperclip className="w-3 h-3 text-gray-400" />}
        </div>
      </div>
    </div>
  );
}

function CategoryTab({
  category,
  label,
  count,
  isActive,
  onClick,
  icon: Icon,
}: {
  category: CategoryFilter;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  icon: React.ElementType;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
        isActive ? 'bg-gray-900 text-white' : 'bg-stone-100 text-gray-600 hover:bg-stone-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      {/* <span
        className={`text-xs px-1.5 py-0.5 rounded-full ${
          isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-gray-600'
        }`}
      >
        {count}
      </span> */}
    </button>
  );
}

function EmailDetailPanel({ email }: { email: EmailWithAnalysis }) {
  const category = email.analysis?.category || 'fyi';
  const config = categoryConfig[category];
  const CategoryIcon = config.icon;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* AI Analysis Section - Top */}
      {email.analysis && (
        <div className="flex-shrink-0 p-4 bg-gradient-to-br from-sage-50/50 via-gray-50 to-clay-50/30 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkle className="w-4 h-4 text-[#748971]" />
              <span className="text-sm font-medium text-gray-800">AI Summary</span>
            </div>
            <Badge variant="outline" className={`${config.color}`}>
              <CategoryIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          <p className="text-sm text-gray-800 leading-relaxed mb-3">{email.analysis.summary}</p>

          {email.analysis.suggestedAction && (
            <div className="bg-white/80 rounded-lg p-3 border border-gray-200 mb-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Suggested Action</p>
              <p className="text-sm text-gray-900">{email.analysis.suggestedAction}</p>
            </div>
          )}

          {/* Extracted Entities */}
          {email.analysis.entities && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3">
              {email.analysis.entities.suppliers && email.analysis.entities.suppliers.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Suppliers:</span>
                  <span className="text-gray-700">{email.analysis.entities.suppliers.join(', ')}</span>
                </div>
              )}
              {email.analysis.entities.amounts && email.analysis.entities.amounts.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Amounts:</span>
                  <span className="text-gray-700 font-medium">
                    {email.analysis.entities.amounts.map(a => `£${a.value.toLocaleString()}`).join(', ')}
                  </span>
                </div>
              )}
              {email.analysis.entities.items && email.analysis.entities.items.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Items:</span>
                  <span className="text-gray-700">{email.analysis.entities.items.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {/* Project Link */}
          {email.analysis.project && (
            <Link
              href={`/projects`}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              <Building2 className="w-4 h-4" />
              {email.analysis.project}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      {/* Email Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 leading-tight mb-2">{email.subject}</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-900">{email.fromName}</span>
          <span className="text-gray-400">&lt;{email.from}&gt;</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{formatFullDate(email.date)}</p>
        {email.hasAttachment && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Paperclip className="w-3 h-3" />
            <span>Attachment</span>
          </div>
        )}
      </div>

      {/* Email Content */}
      <div className="flex-1 p-4 overflow-y-auto bg-white">
        <div className="prose prose-sm max-w-none">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{email.snippet}</p>
          <div className="p-4 bg-white rounded-lg border border-gray-100">
            <p className="text-xs text-gray-400 italic m-0">
              Full email thread will be displayed here when connected to Gmail.
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3">
          {/* Primary Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-gray-900 hover:bg-gray-800">
              <CornerUpLeft className="w-4 h-4 mr-2" />
              Reply
            </Button>
            {/* <Button size="sm" variant="outline">
              <CornerUpRight className="w-4 h-4 mr-2" />
              Forward
            </Button> */}
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <FolderPlus className="w-4 h-4 mr-2" />
              Add to Project
            </Button>
            <Button size="sm" variant="ghost">
              <Archive className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Message block component for displaying individual messages
function SuggestedTaskCard({ task, onAdd, onView, isCreating, createdTaskId, emailId, suggestionIndex }: {
  task: SuggestedTask;
  onAdd: (task: SuggestedTask, emailId: number, suggestionIndex: number) => void;
  onView: (taskId: number) => void;
  isCreating?: boolean;
  createdTaskId?: number | null;
  emailId: number;
  suggestionIndex: number;
}) {
  const isAlreadyCreated = !!createdTaskId;

  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-[#748971] bg-[#7489711A]">
      <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-[#74897126] flex items-center justify-center">
        <Sparkle className="w-3.5 h-3.5 text-[#748971]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-[#748971] mb-0.5">AI suggested task</p>
        <p className="text-[13px] font-medium text-gray-900 leading-snug">{task.title}</p>
        {task.description && (
          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{task.description}</p>
        )}
      </div>
      {isAlreadyCreated ? (
        <button
          onClick={() => onView(createdTaskId!)}
          className="flex-shrink-0 self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-all"
        >
          <ExternalLink className="w-3 h-3" />
          View
        </button>
      ) : (
        <button
          onClick={() => onAdd(task, emailId, suggestionIndex)}
          disabled={isCreating}
          className={`flex-shrink-0 self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            isCreating
              ? 'bg-[#748971] text-white cursor-not-allowed'
              : 'bg-[#748971] text-white hover:bg-[#748971]'
          }`}
        >
          {isCreating && <Loader2 className="w-3 h-3 animate-spin" />}
          {isCreating ? 'Creating...' : 'Create task'}
        </button>
      )}
    </div>
  );
}

function MessageBlock({ msg, suggestedTasks, onAddTask, onViewTask, isCreatingTask, addedTaskIds }: { msg: MessageItem; suggestedTasks?: SuggestedTask[]; onAddTask?: (task: SuggestedTask, emailId: number, suggestionIndex: number) => void; onViewTask?: (taskId: number) => void; isCreatingTask?: boolean; addedTaskIds?: Map<string, number> }) {
  const [expanded, setExpanded] = useState(false);
  const { main, quoted } = useMemo(() => splitGmailEmail(msg.body), [msg.body]);

  return (
    <div className="flex gap-4">
      <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
        <AvatarFallback className={msg.is_sent ? 'bg-black text-white' : 'bg-stone-200'}>
          {msg?.sender?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col max-w-[99%]">
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-xs font-medium text-gray-900">
            {msg.is_sent ? 'You' : msg.sender?.split('<')[0]}
          </span>
          <span className="text-xs text-gray-500">
            {dayjs(msg.received_at).format('MMM D, h:mm A')}
          </span>
        </div>

        <div className={`rounded-2xl p-4 text-sm w-full ${msg.is_sent
          ? 'bg-stone-50 text-gray-900 rounded-tr-sm'
          : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm'
        }`}>
          <div
            className="prose prose-sm max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:mx-auto [&_img]:inline-block"
            dangerouslySetInnerHTML={{ __html: main }}
          />

          {quoted && (
            <div className="mt-3">
              {!expanded ? (
                <button
                  onClick={() => setExpanded(true)}
                  className="flex items-center justify-center px-1 bg-stone-200 hover:bg-stone-300 rounded-[5px] text-gray-500 transition-colors"
                  title="Show trimmed content"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setExpanded(false)}
                    className="flex items-center justify-center px-1 bg-stone-200 hover:bg-stone-300 rounded-[5px] text-gray-500 transition-colors"
                    title="Hide trimmed content"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <div
                    className="prose prose-sm max-w-none mt-4 pt-4 border-t border-gray-300 text-gray-500 [&_img]:max-w-full [&_img]:h-auto"
                    dangerouslySetInnerHTML={{ __html: quoted }}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {suggestedTasks && suggestedTasks.length > 0 && (
          <div className="mt-2 flex flex-col gap-2 px-1">
            {suggestedTasks.map((task, i) => (
              <SuggestedTaskCard key={i} task={task} onAdd={onAddTask ?? (() => {})} onView={onViewTask ?? (() => {})} isCreating={isCreatingTask} createdTaskId={addedTaskIds?.get(task.title) ?? task.created_task_id ?? null} emailId={msg.id} suggestionIndex={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// New component that shows email details with real messages
function EmailDetailPanelWithMessages({
  email,
  messages,
  messagesLoading,
  scrollRef,
  scrollContainerRef,
  onAddToProject,
  replyBody,
  setReplyBody,
  onSendReply,
  isSending,
  showReplyInput,
  setShowReplyInput,
  aiSummary,
  aiSummaryLoading,
  onAddTask,
  onViewTask,
  isCreatingTask,
  addedTaskIds,
  onBack,
}: {
  email: EmailWithAnalysis;
  messages: MessageItem[] | null | undefined;
  messagesLoading: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  onAddToProject: () => void;
  replyBody: string;
  setReplyBody: (value: string) => void;
  onSendReply: () => void;
  isSending: boolean;
  showReplyInput: boolean;
  setShowReplyInput: (value: boolean) => void;
  aiSummary?: AiSummary;
  aiSummaryLoading: boolean;
  onAddTask?: (task: SuggestedTask, emailId: number, suggestionIndex: number) => void;
  onViewTask?: (taskId: number) => void;
  isCreatingTask?: boolean;
  addedTaskIds?: Map<string, number>;
  onBack?: () => void;
}) {
  // Use AI summary category if available, otherwise fall back to email analysis
  const category = aiSummary?.category || email.analysis?.category || 'fyi';
  const config = categoryConfig[category];
  const CategoryIcon = config.icon;
  const [messagesExpanded, setMessagesExpanded] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(true);

  // Reset expansion when email changes
  useEffect(() => {
    setMessagesExpanded(false);
    setShowReplyInput(false);
    setHeaderCollapsed(true);
  }, [email.id]);

  const messageList = Array.isArray(messages) ? messages : [];

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Mobile back button */}
      {onBack && (
        <div className="lg:hidden flex-shrink-0 flex items-center gap-2 px-4 pt-4 pb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      )}

      {/* AI Analysis Section - Top (scrolls with content) */}
      <div className="flex-1 overflow-y-auto bg-white flex flex-col" ref={scrollContainerRef}>

      {/* AI Summary */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkle className="w-4 h-4 text-[#748971]" />
            <span className="text-sm font-semibold text-gray-900">AI Summary</span>
          </div>
          {!aiSummaryLoading && aiSummary?.category && (
            <Badge variant="outline" className={`${config.color}`}>
              <CategoryIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          )}
        </div>

        {aiSummaryLoading ? (
          <div className="space-y-2.5 py-1">
            <div className="h-3 rounded-full w-full overflow-hidden relative bg-gray-100">
              <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)', transform: 'translateX(-100%)' }} />
            </div>
            <div className="h-3 rounded-full w-[85%] overflow-hidden relative bg-gray-100">
              <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)', transform: 'translateX(-100%)', animationDelay: '150ms' }} />
            </div>
            <div className="h-3 rounded-full w-[60%] overflow-hidden relative bg-gray-100">
              <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)', transform: 'translateX(-100%)', animationDelay: '300ms' }} />
            </div>
          </div>
        ) : aiSummary?.summary ? (
          <>
            <p className="text-sm text-gray-800 leading-relaxed mb-3">{aiSummary.summary}</p>

            {aiSummary.suggested_action && (
              <div className="bg-white/80 rounded-lg p-3 border border-gray-200 mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Suggested Action</p>
                <p className="text-sm text-gray-900">{aiSummary.suggested_action}</p>
              </div>
            )}

            {/* Extracted Entities */}
            {aiSummary.entities && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3">
                {aiSummary.entities.suppliers && aiSummary.entities.suppliers.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Suppliers:</span>
                    <span className="text-gray-700">{aiSummary.entities.suppliers.join(', ')}</span>
                  </div>
                )}
                {aiSummary.entities.amounts && aiSummary.entities.amounts.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Amounts:</span>
                    <span className="text-gray-700 font-medium">
                      {aiSummary.entities.amounts.map(a => `£${a.value.toLocaleString()}`).join(', ')}
                    </span>
                  </div>
                )}
                {aiSummary.entities.items && aiSummary.entities.items.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Items:</span>
                    <span className="text-gray-700">{aiSummary.entities.items.join(', ')}</span>
                  </div>
                )}
                {aiSummary.entities.people && aiSummary.entities.people.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">People:</span>
                    <span className="text-gray-700">{aiSummary.entities.people.join(', ')}</span>
                  </div>
                )}
                {aiSummary.entities.dates && aiSummary.entities.dates.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Dates:</span>
                    <span className="text-gray-700">{aiSummary.entities.dates.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500 italic">No AI summary available for this thread.</p>
        )}

        {/* Project Link */}
        {email.analysis?.project && (
          <Link
            href={`/projects/${(email?.analysis as any)?.project_id}`}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium mt-2"
          >
            <Building2 className="w-4 h-4" />
            {email.analysis.project}
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Email Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <button
          onClick={() => setHeaderCollapsed(prev => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-sm font-semibold text-gray-900 leading-tight truncate">{email.subject}</h2>
            {headerCollapsed && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {email.fromName} · {formatFullDate(email.date)}
                {messageList.length > 0 && ` · ${messageList.length} message${messageList.length !== 1 ? 's' : ''}`}
              </p>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${headerCollapsed ? '' : 'rotate-180'}`} />
        </button>

        {!headerCollapsed && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900">{email.fromName}</span>
              <span className="text-gray-400">&lt;{email.from}&gt;</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatFullDate(email.date)}</p>
            {email.hasAttachment && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <Paperclip className="w-3 h-3" />
                <span>Attachment</span>
              </div>
            )}
            {messageList.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {messageList.length} message{messageList.length !== 1 ? 's' : ''} in thread
              </div>
            )}
          </div>
        )}
      </div>

      {/* Email Content / Messages */}
      <div className="flex-1 p-4 bg-white">
        {messagesLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : messageList.length > 0 ? (
          <div className="space-y-6">
            {(!messageList || messageList.length <= 3 || messagesExpanded) ? (
              messageList.map((msg: MessageItem) => (
                <MessageBlock
                  key={msg.id}
                  msg={msg}
                  suggestedTasks={aiSummary?.emails?.find(e => e.id === msg.id)?.suggested_tasks}
                  onAddTask={onAddTask}
                  isCreatingTask={isCreatingTask}
                  addedTaskIds={addedTaskIds}
                  onViewTask={onViewTask}
                />
              ))
            ) : (
              <>
                {/* First Message */}
                {messageList.length > 0 && (
                  <MessageBlock
                    msg={messageList[0]}
                    suggestedTasks={aiSummary?.emails?.find(e => e.id === messageList[0].id)?.suggested_tasks}
                    onAddTask={onAddTask}
                    onViewTask={onViewTask}
                    isCreatingTask={isCreatingTask}
                    addedTaskIds={addedTaskIds}
                  />
                )}

                {/* Divider / Expander */}
                <div
                  className="relative py-2 flex items-center justify-start pl-4 cursor-pointer group"
                  onClick={() => setMessagesExpanded(true)}
                >
                  <div className="absolute w-full top-1/2 left-0 h-px bg-stone-100 group-hover:bg-stone-200 transition-colors" />
                  <div className="absolute group w-full top-1/2 transform -translate-y-[5px] left-0 h-px bg-stone-100 group-hover:bg-stone-200 transition-colors" />
                  <div className="relative z-10 w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-sm font-medium text-gray-500 group-hover:border-gray-300 group-hover:text-gray-700 hover:bg-stone-100 transition-all shadow-sm">
                    <span className="group-hover:hidden">{messageList.length - 3}</span>
                    <ChevronsUpDown className="group-hover:block hidden w-4 h-4" />
                  </div>
                </div>

                {/* Last Two Messages */}
                {messageList.slice(-2).map((msg: MessageItem) => (
                  <MessageBlock
                    key={msg.id}
                    msg={msg}
                    suggestedTasks={aiSummary?.emails?.find(e => e.id === msg.id)?.suggested_tasks}
                    onAddTask={onAddTask}
                    onViewTask={onViewTask}
                    isCreatingTask={isCreatingTask}
                    addedTaskIds={addedTaskIds}
                  />
                ))}
              </>
            )}
            <div ref={scrollRef} />
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{email.snippet}</p>
          </div>
        )}
      </div>

      </div>{/* end scroll container */}

      {/* Reply Input Area */}
      {showReplyInput && (
        <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-white">
          <div className="flex gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-black/5 transition-all">
            <Textarea
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[60px] max-h-[200px] focus:ring-offset-0 focus:ring-0 focus:border-none focus:outline-none border-0 focus-visible:ring-0 resize-none bg-transparent p-2 text-sm"
            />
            <div className="flex flex-col justify-center pb-1 pr-1 gap-2">
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-black hover:bg-gray-800 transition-all shadow-sm"
                onClick={onSendReply}
                disabled={isSending || !replyBody.trim()}
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar - Always at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3">
          {/* Primary Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-gray-900 hover:bg-gray-800"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              <CornerUpLeft className="w-4 h-4 mr-2" />
              Reply
            </Button>
            {/* <Button size="sm" variant="outline">
              <CornerUpRight className="w-4 h-4 mr-2" />
              Forward
            </Button> */}
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onAddToProject}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Add to Project
            </Button>
            {/* <Button size="sm" variant="ghost">
              <Archive className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="w-4 h-4" />
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyDetailPanel({ hasEmails, isDisconnected }: { hasEmails: boolean, isDisconnected: boolean }) {
  if (isDisconnected) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-sage-50/30 via-gray-50 to-clay-50/20">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
          <Mail className="w-10 h-10 text-sage-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect your Gmail</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          Connect your Gmail account to see emails automatically categorised by AI, with summaries and suggested actions.
        </p>
        <div className="flex flex-col gap-3 text-left text-sm text-gray-600 bg-white/80 rounded-lg p-4 border border-gray-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-terracotta-500 mt-0.5 flex-shrink-0" />
            <span>Action required emails highlighted</span>
          </div>
          <div className="flex items-start gap-2">
            <Package className="w-4 h-4 text-sage-500 mt-0.5 flex-shrink-0" />
            <span>Procurement emails automatically grouped</span>
          </div>
          <div className="flex items-start gap-2">
            <Sparkle className="w-4 h-4 text-clay-500 mt-0.5 flex-shrink-0" />
            <span>AI summaries and suggested actions</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 border h-full flex items-center justify-center">
      <div>
         <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
        <Mail className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-700 font-medium mb-1">Select an email</p>
      <p className="text-sm text-gray-500">Choose an email from the list to view its content and AI analysis</p>
      </div>
    </div>
  );
}

export default function MagicalInboxPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [gmailDisconnected, setGmailDisconnected] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Reply state
  const [replyBody, setReplyBody] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);

  // Add to project state
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Track new emails for animation
  const [newEmailIds, setNewEmailIds] = useState<Set<string>>(new Set());
  const previousEmailIdsRef = useRef<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Gmail search from Zustand store
  const { searchQuery, clearSearch } = useGmailSearchStore();

  // Gmail connect
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const { data: integrations, isLoading: integrationsLoading } = useFetch('user/integration-status/');
  const isGmailConnected = (integrations as any)?.gmail_connected;
  const { refetch: getGmailAuthUrl } = useFetch('gmail/connect/', { enabled: false });
  const { mutate: disconnectGmail, isPending: isDisconnecting } = usePost();


  const handleGmailDisconnect = () => {
    disconnectGmail({ url: 'gmail/disconnect/', data: {} }, {
      onSuccess: () => {
        setIsDisconnectDialogOpen(false);
        queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
        queryClient.refetchQueries({ queryKey: ['gmail/threads/'] });
        window.location.reload();
      },
    });
  };

  const { mutate: fetchGmail , isPending } = usePost();
  const { mutate: sendReply, isPending: isSending } = usePost();
  const { mutate: linkToProject } = usePost();
  const { mutate: createTask, isPending: isCreatingTask } = usePost();
  const { mutate: markCreated } = usePost();
  const [addedTaskIds, setAddedTaskIds] = useState<Map<string, number>>(new Map());
  const { openModal, closeModal, modalOpen, taskToEdit, defaultStatus } = useTaskModalStore();
  const [viewTaskEditing, setViewTaskEditing] = useState<any>(null);

  // Build endpoint URL based on search query
  const threadsEndpoint = useMemo(() => {
    if (searchQuery.trim()) {
      return `gmail/search/?q=${encodeURIComponent(searchQuery.trim())}&page=${currentPage}`;
    }
    return `gmail/threads/?page=${currentPage}`;
  }, [searchQuery, currentPage]);

  // Fetch Threads List (paginated) or Search Results
  const { data: threadsData, isLoading: threadsLoading, refetch: refetchThreads, error: threadsError } = useFetch(threadsEndpoint, { retry: false }) as {
    data: ThreadsResponse | undefined;
    isLoading: boolean;
    refetch: () => void;
    error: any;
  };

  // Extract threads and pagination from response
  const threads = threadsData?.results;
  const pagination = threadsData?.pagination;

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedThreadId(null);
  }, [searchQuery]);

  // Fetch Projects
  const { data: projects, isLoading: projectsLoading } = useFetch('projects/user-projects/');

  // Fetch Thread Details (messages in the selected thread)
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useFetch(
    selectedThreadId ? `gmail/thread/${selectedThreadId}/` : null,
    { enabled: !!selectedThreadId }
  );

  // Fetch AI Summary for selected thread
  const { data: aiSummary, isLoading: aiSummaryLoading , refetch:refetchSummary } = useFetch(
    selectedThreadId ? `gmail/thread/${selectedThreadId}/summary/` : null,
    { enabled: !!selectedThreadId }
  ) as {
    data: AiSummary | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  // Filter projects based on search
  const filteredProjects = useMemo(() => {
    if (!projects || !Array.isArray(projects)) return [];
    if (!projectSearch) return projects;
    return (projects as any[]).filter((p: any) =>
      p?.project_name?.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p?.project_code?.toLowerCase().includes(projectSearch.toLowerCase())
    );
  }, [projects, projectSearch]);

  // Convert threads to EmailWithAnalysis format for the existing UI components
  const emails: EmailWithAnalysis[] = useMemo(() => {
    if (!Array.isArray(threads)) return [];
    return threads.map((thread: ThreadItem) => ({
      id: thread.thread_id,
      from: thread.sender,
      fromName: thread.sender?.split('<')[0]?.trim() || thread.sender,
      subject: thread.subject || '(No Subject)',
      snippet: thread.snippet || '',
      date: thread.received_at,
      isRead: true, // API doesn't provide this, default to true
      hasAttachment: false, // API doesn't provide this
      analysis: thread.project ? {
        category: 'fyi' as const,
        project: thread.project?.name || thread.project,
        project_id: thread.project?.id || thread.project,
        summary: thread.snippet || '',
      } : undefined,
    }));
  }, [threads]);
  

  
  const handleGmailConnect = async () => {
    setIsConnecting(true);
    const result = await openGmailOAuthPopup(getGmailAuthUrl);
    setIsConnecting(false);

    if (result === 'success') {
      queryClient.refetchQueries({ queryKey: ['user/integration-status/'] });
      queryClient.refetchQueries({ queryKey: ['gmail/threads/'] });
      refetchThreads();
      toast.success('Gmail connected.');
      window.location.reload();
      return;
    }

    if (result === 'access_denied') {
      toast.error(
        'Google blocked access. Add your email under OAuth consent screen → Test users in Google Cloud Console.'
      );
    }
  };


  // Get selected email from selectedThreadId
  const selectedEmail = useMemo(() => {
    if (!selectedThreadId) return null;
    return emails.find(e => e.id === selectedThreadId) || null;
  }, [selectedThreadId, emails]);
    

  useEffect(() => {
    document.title = 'AI Inbox | Focuspilot';
  }, []);

  // Fetch Gmail on mount
  useEffect(() => {
    if (!isGmailConnected) return;
    fetchGmail({
      url: '/gmail/fetch/',
      data: { force_full: !threads?.length }
    }, {
      onSuccess: (e) => {
        if (e.fetched > 0) {
          refetchThreads();
        }
      },
      onError: () => {
        setFetchError(true);
      }
    });
  }, []);

  // Detect Gmail disconnected state
  useEffect(() => {
    if (fetchError && threadsError) {
      setGmailDisconnected(true);
    }
  }, [fetchError, threadsError]);

  // Auto-refresh every 1 minute — skip if Gmail is disconnected
  useEffect(() => {
    if (gmailDisconnected) return;
    const interval = setInterval(() => {
      fetchGmail({
        url: '/gmail/fetch/',
        data: {}
      }, {
        onSuccess: (e) => {
          if (e.fetched > 0) {
            refetchThreads();
          }
        },
        onError: () => {
          // Silent fail on auto-refresh
        }
      });
    }, 1 * 60 * 1000);

    return () => clearInterval(interval);
  }, [gmailDisconnected]);

  // Track new emails for animation
  useEffect(() => {
    if (emails.length > 0) {
      const currentIds = new Set(emails.map(e => e.id));
      const previousIds = previousEmailIdsRef.current;

      // Find new email IDs (in current but not in previous)
      const newIds = new Set<string>();
      currentIds.forEach(id => {
        if (!previousIds.has(id)) {
          newIds.add(id);
        }
      });

      // Only set new IDs if this isn't the initial load
      if (previousIds.size > 0 && newIds.size > 0) {
        setNewEmailIds(newIds);

        // Clear the "new" state after animation (3 seconds)
        setTimeout(() => {
          setNewEmailIds(new Set());
        }, 3000);
      }

      // Update the ref with current IDs
      previousEmailIdsRef.current = currentIds;
    }
  }, [emails]);

  // Auto-select first email only on initial load
  const initialLoadRef = useRef(true);
  useEffect(() => {
    if (initialLoadRef.current && emails.length > 0 && !selectedThreadId) {
      setSelectedThreadId(emails[0].id);
      initialLoadRef.current = false;
    }
  }, [emails, selectedThreadId]);

  // Scroll to top when thread changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedThreadId]);

  async function handleSync() {
    setSyncing(true);
    fetchGmail({
      url: '/gmail/fetch/',
      data: { force_full: true }
    }, {
      onSuccess: (e) => {
        const n = e.fetched ?? 0;
        toast.success(n > 0 ? `Synced ${n} emails` : 'Sync complete — no new emails in the last 15 days');
        refetchThreads();
        setSyncing(false);
      },
      onError: (err) => {
        toast.error('Please reconnect gmail');
        setSyncing(false);
      }
    });
  }

  function handleCategoryChange(category: CategoryFilter) {
    setActiveCategory(category);
    setSelectedThreadId(null);
  }

  function handlePreviousPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelectedThreadId(null);
    }
  }

  function handleNextPage() {
    if (pagination && currentPage < pagination.total_pages) {
      setCurrentPage(currentPage + 1);
      setSelectedThreadId(null);
    }
  }

  function handleEmailClick(email: EmailWithAnalysis) {
    setSelectedThreadId(email.id);
    setReplyBody('');
    setShowReplyInput(false);
  }

  // Handle send reply
  function handleSendReply() {
    if (!replyBody.trim() || !selectedThreadId || !messages?.length) return;
    const lastMsg = messages[messages.length - 1];

    let toEmail = '';
    const extractEmail = (str: string) => {
      const match = str.match(/<([^>]+)>/);
      return match ? match[1] : str;
    };

    if (lastMsg.is_sent) {
      toEmail = extractEmail(lastMsg.recipient);
    } else {
      toEmail = extractEmail(lastMsg.sender);
    }

    const payload = {
      to_email: toEmail,
      subject: lastMsg.subject,
      body: replyBody,
      thread_id: selectedThreadId
    };

    sendReply({
      url: '/gmail/send/',
      data: payload
    }, {
      onSuccess: () => {
        toast.success('Reply sent successfully');
        setReplyBody('');
        setShowReplyInput(false);
        refetchMessages();
      },
      onError: (err: any) => {
        toast.error('Failed to send reply: ' + (err.message || 'Unknown error'));
      }
    });
  }

  // Handle add to project
  function handleAddToProject() {
    if (!selectedProjectId) return;
    linkToProject({
      url: 'gmail/threads/link/',
      data: {
        thread_id: selectedThreadId,
        project_ids: [selectedProjectId],
      },
    }, {
      onSuccess: () => {
        toast.success('Email added to project');
        queryClient.refetchQueries({ queryKey: [`/gmail/threads/project/${selectedProjectId}/`] });
        refetchThreads();
        setProjectOpen(false);
        setProjectSearch('');
        setSelectedProjectId(null);
      },
    });
  }

  // Open task modal to view a created task
  async function handleViewTask(taskId: number) {
    if(!taskId) {
      toast.error('Task deleted or not found');
      return;
    };
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/task/tasks/${taskId}/`, {
        credentials: 'include',
      });
      if (!res.ok) {
        toast.error(res.status === 404 ? 'Task no longer exists' : 'Failed to load task');
        return;
      }
      const data = await res.json();
      setViewTaskEditing({...data, name: data?.title});
      openModal({ taskToEdit: {...data, name: data?.title} });
      refetchSummary()
    } catch {
      toast.error('Failed to load task');
    }
  }

  // Handle suggested task creation from AI
  function handleAddTask(task: SuggestedTask, emailId: number, suggestionIndex: number) {
    createTask({
      url: 'task/tasks/',
      data: {
        title: task.title,
        description: task.description,
        status: task.status || 'TD',
        priority: task.priority || 'M',
        end_date: task.end_date ?? null,
        project: task.project ?? null,
        assignees: task.assignees ?? [],
        subtask: [],
        comments: [],
      },
    }, {
      onSuccess: (response: any) => {
        const taskId = response?.id;
        setAddedTaskIds(prev => new Map(prev).set(task.title, taskId));
        toast.success(`Task "${task.title}" created`);
        if (taskId) {
          markCreated({
            url: 'gmail/suggestions/mark-created/',
            data: {
              email_id: emailId,
              suggestion_index: suggestionIndex,
              task_id: taskId,
            },
          });
        }
      },
      onError: () => {
        toast.error('Failed to create task');
      },
    });
  }

  // Filter emails by category
  const filteredEmails = useMemo(() => {
    // const removeStudioEmail = emails.filter(e => e?.analysis?.project !== 'Studio Tasks')
    const removeStudioEmail = emails;
    if (activeCategory === 'all') return removeStudioEmail;
    return removeStudioEmail.filter(e => e.analysis?.category === activeCategory);
  }, [emails, activeCategory]);

  // Get filtered stats
  const filteredStats: InboxStats = useMemo(() => {
    return {
      total: emails.length,
      actionRequired: emails.filter(e => e.analysis?.category === 'action_required').length,
      procurement: emails.filter(e => e.analysis?.category === 'procurement').length,
      fyi: emails.filter(e => e.analysis?.category === 'fyi').length,
      unread: emails.filter(e => !e.isRead).length,
    };
  }, [emails]);
  


  const loading = threadsLoading && !gmailDisconnected;

  if (loading && emails.length === 0) {
    return (
      // <div className="flex-1 bg-stone-50 flex items-center justify-center">
      //   <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      // </div>
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-2 h-full bg-stone-50 flex flex-col overflow-hidden">
        {/* Top Bar: Tabs + Sync */}
        <div className="flex-shrink-0 p-4 sm:p-6 pb-4 bg-stone-50">
        <div className="flex items-center justify-between gap-4">
          {/* Category Tabs or Search Results */}
          <div className="flex items-center gap-2">
            {searchQuery.trim() ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg">
                  <Search className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Results for "<span className="font-medium">{searchQuery}</span>"
                  </span>
                  <button
                    onClick={clearSearch}
                    className="ml-1 p-0.5 hover:bg-stone-200 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <CategoryTab
                  category="all"
                  label="All"
                  count={filteredStats.total}
                  isActive={activeCategory === 'all'}
                  onClick={() => handleCategoryChange('all')}
                  icon={Inbox}
                />
                <CategoryTab
                  category="action_required"
                  label="Action"
                  count={filteredStats.actionRequired}
                  isActive={activeCategory === 'action_required'}
                  onClick={() => handleCategoryChange('action_required')}
                  icon={AlertCircle}
                />
                <CategoryTab
                  category="procurement"
                  label="Procurement"
                  count={filteredStats.procurement}
                  isActive={activeCategory === 'procurement'}
                  onClick={() => handleCategoryChange('procurement')}
                  icon={Package}
                />
                <CategoryTab
                  category="fyi"
                  label="FYI"
                  count={filteredStats.fyi}
                  isActive={activeCategory === 'fyi'}
                  onClick={() => handleCategoryChange('fyi')}
                  icon={Info}
                />
              </>
            )}
          </div>

          {/* Pagination + Sync Button */}
          <div className="flex items-center gap-2">
            {/* Pagination Controls */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500 mr-2">
                  {((currentPage - 1) * (pagination.page_size || 10)) + 1}-{Math.min(currentPage * (pagination.page_size || 10), pagination.total)} of {pagination.total}
                </span>
                <Button
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleNextPage}
                  disabled={currentPage >= pagination.total_pages}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Sync Button */}
            <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm">
              {syncing || isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync
                </>
              )}
            </Button>

            {/* Gmail Connection Status */}
            {!integrationsLoading && (
              isGmailConnected ? (
                <button
                  onClick={() => setIsDisconnectDialogOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Gmail
                </button>
              ) : (
                <button
                  onClick={handleGmailConnect}
                  disabled={isConnecting}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200 transition-colors disabled:opacity-60"
                >
                  {isConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                  {isConnecting ? 'Connecting...' : 'Connect Gmail'}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 min-h-0 mx-4 sm:mx-6 mb-0 sm:mb-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Left Panel: Email List — hidden on mobile when a thread is open */}
        <div className={`lg:col-span-2 border-r border-gray-200 h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin bg-white ${selectedThreadId ? 'hidden lg:block' : 'block'}`}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filteredEmails.length > 0 ? (
            <AnimatePresence initial={false}>
              {filteredEmails.map((email) => (
                <motion.div
                  key={email.id}
                  initial={newEmailIds.has(email.id) ? {
                    opacity: 0,
                    y: -60,
                    backgroundColor: 'rgb(219 234 254 / 0.7)'
                  } : false}
                  animate={{
                    opacity: 1,
                    y: 0,
                    backgroundColor: 'transparent'
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                    mass: 1,
                    backgroundColor: { duration: 2, delay: 0.3 }
                  }}
                  layout
                  layoutId={email.id}
                >
                  <EmailRow
                    email={email}
                    onClick={() => handleEmailClick(email)}
                    isSelected={selectedThreadId === email.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : gmailDisconnected ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-sage-400" />
              </div>
              <p className="text-gray-800 font-medium mb-2">Connect your Gmail</p>
              <p className="text-sm text-gray-500 max-w-xs">
                Connect your Gmail account to see your emails automatically categorised with AI summaries.
              </p>
              <Button
                className="mt-4 bg-black text-white hover:bg-gray-800"
                onClick={handleGmailConnect}
                disabled={isConnecting}
              >
                {isConnecting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connecting...</> : 'Connect Gmail'}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-sage-400" />
              </div>
              <p className="text-gray-800 font-medium mb-2">No emails found</p>
              <p className="text-sm text-gray-500 max-w-xs">
                {activeCategory !== 'all'
                  ? `No ${activeCategory.replace('_', ' ')} emails found. Try selecting a different category.`
                  : 'Your inbox is empty.'}
              </p>
            </div>
          )}
        </div>

        {/* Right Panel: Email Detail + AI Summary — full width on mobile when thread open */}
        <div className={`lg:col-span-4 h-[calc(100vh-145px)] overflow-y-auto scrollbar-thin bg-stone-50 relative ${selectedThreadId ? 'col-span-1' : 'hidden lg:block'}`}>
          {selectedEmail ? (
            <EmailDetailPanelWithMessages
              email={selectedEmail}
              messages={messages}
              messagesLoading={messagesLoading}
              scrollRef={scrollRef}
              scrollContainerRef={scrollContainerRef}
              onAddToProject={() => setProjectOpen(true)}
              replyBody={replyBody}
              setReplyBody={setReplyBody}
              onSendReply={handleSendReply}
              isSending={isSending}
              showReplyInput={showReplyInput}
              setShowReplyInput={setShowReplyInput}
              aiSummary={aiSummary}
              aiSummaryLoading={aiSummaryLoading}
              onAddTask={handleAddTask}
              onViewTask={handleViewTask}
              isCreatingTask={isCreatingTask}
              addedTaskIds={addedTaskIds}
              onBack={() => setSelectedThreadId(null)}
            />
          ) : (
            <EmptyDetailPanel isDisconnected={gmailDisconnected} hasEmails={filteredEmails.length > 0} />
          )}
        </div>
      </div>

      {/* Add to Project Dialog */}
      <Dialog open={projectOpen} onOpenChange={(open) => {
        setProjectOpen(open);
        if (!open) {
          setProjectSearch('');
          setSelectedProjectId(null);
        }
      }}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Add to Project</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search projects..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="pl-9 bg-white border-gray-200"
              />
            </div>

            <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto">
              {projectsLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-400 w-5 h-5" /></div>
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project: any) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`px-3 py-2 rounded-lg cursor-pointer border transition-all flex items-center justify-between group ${selectedProjectId === project.id
                      ? 'bg-black text-white border-black ring-1 ring-black'
                      : 'bg-white border-transparent hover:bg-stone-50 hover:border-gray-200'
                      }`}
                  >
                    <span className={`text-sm ${selectedProjectId === project.id ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>{project.project_name}</span>
                    {project.project_code && (
                      <span className={`text-xs px-2 py-1 rounded-md border ${selectedProjectId === project.id ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-500 bg-white border-gray-100'}`}>{project.project_code}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8 text-sm">
                  No projects found
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectOpen(false)}>Cancel</Button>
            <Button onClick={handleAddToProject} disabled={!selectedProjectId} className="bg-black text-white hover:bg-gray-800">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gmail Disconnect Confirmation Dialog */}
      <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>Disconnect Gmail?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">Your inbox will no longer sync and AI categorisation will stop. You can reconnect at any time.</p>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setIsDisconnectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleGmailDisconnect} disabled={isDisconnecting}>
              {isDisconnecting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Disconnecting...</> : 'Disconnect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task View Modal */}
      <TaskModal
        open={modalOpen}
        onOpenChange={(open) => { if (!open) { closeModal(); setViewTaskEditing(null); } }}
        projectId={null}
        team={null}
        taskToEdit={viewTaskEditing}
        onSave={() => {}}
        setEditing={setViewTaskEditing}
        openDeleteModal={() => {}}
        status={defaultStatus}
      />
    </div>
  );
}
