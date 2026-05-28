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
  PenSquare,
} from 'lucide-react';
import Link from 'next/link';
import { usePost } from '@/hooks/usePost';
import useFetch from '@/hooks/useFetch';
import { getApiErrorMessage } from '@/lib/api-error';
import useUser from '@/hooks/useUser';
import { messageIsSentByUser, resolveReplyToEmail } from '@/lib/gmail-reply';
import { EmailAttachments, type EmailAttachmentMeta } from '@/components/inbox/EmailAttachments';
import { InboxReplyComposer } from '@/components/inbox/InboxReplyComposer';
import { ComposeEmailDialog } from '@/components/inbox/ComposeEmailDialog';
import { postFormData } from '@/lib/Api';
import { htmlHasContent } from '@/lib/html-content';
import { sanitizeComposeHtml } from '@/lib/sanitize-html';
import { EMAIL_BODY_PROSE_CLASS } from '@/lib/email-body-styles';
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
import { markGmailThreadRead, markGmailThreadUnread } from '@/lib/gmail-inbox';

dayjs.extend(relativeTime);

type ThreadItem = {
  thread_id: string;
  subject: string;
  snippet: string;
  sender: string;
  received_at: string;
  has_attachment?: boolean;
  is_read?: boolean;
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
  sender_label?: string;
  recipient: string;
  subject: string;
  body: string;
  received_at: string;
  is_sent: boolean;
  thread_id: string;
  attachments?: EmailAttachmentMeta[];
  has_attachment?: boolean;
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

type CategoryFilter = 'all' | 'unread' | 'action_required' | 'procurement' | 'fyi';

const categoryConfig = {
  action_required: {
    label: 'Action Required',
    icon: AlertCircle,
    color: 'bg-terracotta-500/10 text-terracotta-500 border-terracotta-500/20 dark:bg-terracotta-500/15 dark:text-terracotta-400 dark:border-terracotta-500/25',
    dotColor: 'bg-terracotta-500',
  },
  procurement: {
    label: 'Procurement',
    icon: Package,
    color: 'bg-sage-500/10 text-sage-500 border-sage-500/20 dark:bg-sage-500/15 dark:text-sage-400 dark:border-sage-500/25',
    dotColor: 'bg-sage-500',
  },
  fyi: {
    label: 'FYI',
    icon: Info,
    color: 'bg-muted text-muted-foreground border-border/50',
    dotColor: 'bg-muted-foreground/60',
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

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-start gap-3 mx-2.5 my-2 p-3.5 rounded-xl cursor-pointer border transition-all duration-200 ${
        isSelected
          ? 'bg-primary/10 border-primary/30 shadow-sm'
          : !email.isRead
            ? 'bg-card border-border/60 shadow-sm hover:bg-accent/40 hover:border-border/80 hover:translate-x-0.5'
            : 'bg-card/45 border-transparent text-foreground/80 hover:bg-accent/40 hover:translate-x-0.5'
      }`}
    >
      {/* Left accent strip for selected email */}
      {isSelected && (
        <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-primary rounded-r-md" />
      )}

      {/* Unread indicator */}
      <div className="flex flex-col items-center gap-2 pt-1 flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${!email.isRead ? config.dotColor : 'bg-transparent'}`} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className={`text-sm truncate ${!email.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
            {email.fromName}
          </span>
          <span className="text-xs text-muted-foreground/80 flex-shrink-0 font-medium">{formatRelativeTime(email.date)}</span>
        </div>

        <p className={`text-sm truncate mb-1 ${!email.isRead ? 'text-foreground font-semibold' : 'text-foreground/90'}`}>
          {email.subject}
        </p>

        <p className="text-xs text-muted-foreground truncate mb-2 leading-relaxed">{email.snippet}</p>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {email.analysis?.project && email.analysis?.project !== 'Studio Tasks' && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-primary/5 text-primary border-primary/20 rounded-md">
              <Building2 className="w-2.5 h-2.5 mr-1" />
              {email.analysis.project}
            </Badge>
          )}
          {email.hasAttachment && <Paperclip className="w-3 h-3 text-muted-foreground/60" />}
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
      className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm scale-[1.02]'
          : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function EmailDetailPanel({ email }: { email: EmailWithAnalysis }) {
  const category = email.analysis?.category || 'fyi';
  const config = categoryConfig[category];
  const CategoryIcon = config.icon;

  return (
    <div className="h-full flex flex-col bg-card">
      {/* AI Analysis Section - Top */}
      {email.analysis && (
        <div className="flex-shrink-0 p-5 bg-gradient-to-br from-primary/5 via-card to-accent/5 border-b border-border/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkle className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">AI Summary</span>
            </div>
            <Badge variant="outline" className={`${config.color}`}>
              <CategoryIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          <p className="text-sm text-foreground/90 leading-relaxed mb-3">{email.analysis.summary}</p>

          {email.analysis.suggestedAction && (
            <div className="bg-background/50 rounded-xl p-3 border border-border/40 mb-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Suggested Action</p>
              <p className="text-sm text-foreground">{email.analysis.suggestedAction}</p>
            </div>
          )}

          {/* Extracted Entities */}
          {email.analysis.entities && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3">
              {email.analysis.entities.suppliers && email.analysis.entities.suppliers.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Suppliers:</span>
                  <span className="text-foreground/90">{email.analysis.entities.suppliers.join(', ')}</span>
                </div>
              )}
              {email.analysis.entities.amounts && email.analysis.entities.amounts.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Amounts:</span>
                  <span className="text-foreground font-semibold">
                    {email.analysis.entities.amounts.map(a => `£${a.value.toLocaleString()}`).join(', ')}
                  </span>
                </div>
              )}
              {email.analysis.entities.items && email.analysis.entities.items.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="text-foreground/90">{email.analysis.entities.items.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {/* Project Link */}
          {email.analysis.project && (
            <Link
              href={`/projects`}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-semibold"
            >
              <Building2 className="w-4 h-4" />
              {email.analysis.project}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      {/* Email Header */}
      <div className="flex-shrink-0 p-5 border-b border-border/40 bg-card">
        <h2 className="text-lg font-bold text-foreground leading-tight mb-2">{email.subject}</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">{email.fromName}</span>
          <span className="text-muted-foreground/80">&lt;{email.from}&gt;</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">{formatFullDate(email.date)}</p>
        {email.hasAttachment && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Paperclip className="w-3 h-3" />
            <span>Attachment</span>
          </div>
        )}
      </div>

      {/* Email Content */}
      <div className="flex-1 p-5 overflow-y-auto bg-card">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{email.snippet}</p>
          <div className="p-4 bg-muted/30 rounded-xl border border-border/20 mt-4">
            <p className="text-xs text-muted-foreground italic m-0">
              Full email thread will be displayed here when connected to Gmail.
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-border/40 bg-card">
        <div className="flex items-center justify-between gap-3">
          {/* Primary Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm rounded-xl">
              <CornerUpLeft className="w-4 h-4 mr-2" />
              Reply
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="rounded-xl border-border/60 hover:bg-accent">
              <FolderPlus className="w-4 h-4 mr-2" />
              Add to Project
            </Button>
            <Button size="sm" variant="ghost" className="rounded-xl text-muted-foreground hover:text-foreground">
              <Archive className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="rounded-xl text-muted-foreground hover:text-foreground">
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
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl border border-primary/20 bg-primary/5">
      <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkle className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-primary mb-0.5 tracking-wider uppercase">AI suggested task</p>
        <p className="text-sm font-semibold text-foreground leading-snug">{task.title}</p>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{task.description}</p>
        )}
      </div>
      {isAlreadyCreated ? (
        <button
          onClick={() => onView(createdTaskId!)}
          className="flex-shrink-0 self-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-card text-foreground hover:bg-accent transition-all shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View
        </button>
      ) : (
        <button
          onClick={() => onAdd(task, emailId, suggestionIndex)}
          disabled={isCreating}
          className={`flex-shrink-0 self-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
            isCreating
              ? 'bg-primary/80 text-primary-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {isCreating && <Loader2 className="w-3 h-3 animate-spin" />}
          {isCreating ? 'Creating...' : 'Create task'}
        </button>
      )}
    </div>
  );
}

function MessageBlock({ msg, userEmail, suggestedTasks, onAddTask, onViewTask, isCreatingTask, addedTaskIds }: { msg: MessageItem; userEmail?: string | null; suggestedTasks?: SuggestedTask[]; onAddTask?: (task: SuggestedTask, emailId: number, suggestionIndex: number) => void; onViewTask?: (taskId: number) => void; isCreatingTask?: boolean; addedTaskIds?: Map<string, number> }) {
  const [expanded, setExpanded] = useState(false);
  const { main, quoted } = useMemo(() => splitGmailEmail(msg.body), [msg.body]);
  const sentByMe = messageIsSentByUser(msg.sender, userEmail);
  const senderLabel =
    msg.sender_label ||
    (sentByMe ? 'You' : msg.sender?.split('<')[0]?.trim().replace(/^["']|["']$/g, '') || 'Unknown');

  return (
    <div className="flex gap-4">
      <Avatar className="w-8 h-8 flex-shrink-0 mt-1 shadow-sm">
        <AvatarFallback className={sentByMe ? 'bg-primary text-primary-foreground font-semibold' : 'bg-muted text-muted-foreground font-medium'}>
          {senderLabel.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col max-w-[99%] flex-1">
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-xs font-semibold text-foreground">
            {senderLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            {dayjs(msg.received_at).format('MMM D, h:mm A')}
          </span>
        </div>

        <div className={`rounded-2xl p-4 text-sm w-full border ${sentByMe
          ? 'bg-accent/20 border-border/20 text-foreground rounded-tr-sm'
          : 'bg-card border-border/40 text-foreground rounded-tl-sm shadow-sm'
        }`}>
          <div
            className={EMAIL_BODY_PROSE_CLASS}
            dangerouslySetInnerHTML={{ __html: main }}
          />

          {quoted && (
            <div className="mt-3">
              {!expanded ? (
                <button
                  onClick={() => setExpanded(true)}
                  className="flex items-center justify-center px-2 py-0.5 bg-muted hover:bg-muted/80 rounded-lg text-muted-foreground transition-colors"
                  title="Show trimmed content"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setExpanded(false)}
                    className="flex items-center justify-center px-2 py-0.5 bg-muted hover:bg-muted/80 rounded-lg text-muted-foreground transition-colors"
                    title="Hide trimmed content"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <div
                    className="prose prose-sm max-w-none mt-4 pt-4 border-t border-border/40 text-muted-foreground [&_img]:max-w-full [&_img]:h-auto"
                    dangerouslySetInnerHTML={{ __html: quoted }}
                  />
                </>
              )}
            </div>
          )}

          {msg.attachments && msg.attachments.length > 0 && (
            <EmailAttachments emailId={msg.id} attachments={msg.attachments} />
          )}
        </div>

        {suggestedTasks && suggestedTasks.length > 0 && (
          <div className="mt-3 flex flex-col gap-2.5 px-1">
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
  onMarkUnread,
  userEmail,
}: {
  email: EmailWithAnalysis;
  userEmail?: string | null;
  messages: MessageItem[] | null | undefined;
  messagesLoading: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  onAddToProject: () => void;
  replyBody: string;
  setReplyBody: (value: string) => void;
  onSendReply: (files: File[]) => void;
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
  onMarkUnread?: () => void;
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
    <div className="bg-card h-full flex flex-col">
      {/* Mobile back button */}
      {(onBack || onMarkUnread) && (
        <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 pt-4 pb-2 border-b border-border/20">
          {onBack ? (
            <button
              onClick={onBack}
              className="lg:hidden flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <span className="lg:hidden" />
          )}
          {onMarkUnread && email.isRead && (
            <button
              type="button"
              onClick={onMarkUnread}
              className="ml-auto text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Mark unread
            </button>
          )}
        </div>
      )}

      {/* AI Analysis Section - Top (scrolls with content) */}
      <div className="flex-1 overflow-y-auto bg-card flex flex-col" ref={scrollContainerRef}>

      {/* AI Summary */}
      <div className="flex-shrink-0 p-5 border-b border-border/40 bg-gradient-to-br from-primary/5 via-card to-accent/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkle className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">AI Summary</span>
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
            <div className="h-3 rounded-full w-full overflow-hidden relative bg-muted/65 animate-pulse" />
            <div className="h-3 rounded-full w-[85%] overflow-hidden relative bg-muted/65 animate-pulse" />
            <div className="h-3 rounded-full w-[60%] overflow-hidden relative bg-muted/65 animate-pulse" />
          </div>
        ) : aiSummary?.summary ? (
          <>
            <p className="text-sm text-foreground/90 leading-relaxed mb-3.5">{aiSummary.summary}</p>

            {aiSummary.suggested_action && (
              <div className="bg-background/55 rounded-xl p-3 border border-border/30 mb-3.5">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Suggested Action</p>
                <p className="text-sm text-foreground">{aiSummary.suggested_action}</p>
              </div>
            )}

            {/* Extracted Entities */}
            {aiSummary.entities && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs mb-3">
                {aiSummary.entities.suppliers && aiSummary.entities.suppliers.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Suppliers:</span>
                    <span className="text-foreground/95">{aiSummary.entities.suppliers.join(', ')}</span>
                  </div>
                )}
                {aiSummary.entities.amounts && aiSummary.entities.amounts.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Amounts:</span>
                    <span className="text-foreground font-semibold">
                      {aiSummary.entities.amounts.map(a => `£${a.value.toLocaleString()}`).join(', ')}
                    </span>
                  </div>
                )}
                {aiSummary.entities.items && aiSummary.entities.items.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Items:</span>
                    <span className="text-foreground/95">{aiSummary.entities.items.join(', ')}</span>
                  </div>
                )}
                {aiSummary.entities.people && aiSummary.entities.people.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">People:</span>
                    <span className="text-foreground/95">{aiSummary.entities.people.join(', ')}</span>
                  </div>
                )}
                {aiSummary.entities.dates && aiSummary.entities.dates.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Dates:</span>
                    <span className="text-foreground/95">{aiSummary.entities.dates.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">No AI summary available for this thread.</p>
        )}

        {/* Project Link */}
        {email.analysis?.project && (
          <Link
            href={`/projects/${(email?.analysis as any)?.project_id}`}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-semibold mt-2"
          >
            <Building2 className="w-4 h-4" />
            {email.analysis.project}
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Email Header */}
      <div className="flex-shrink-0 border-b border-border/40 bg-card">
        <button
          onClick={() => setHeaderCollapsed(prev => !prev)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/30 transition-colors text-left"
        >
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-sm font-bold text-foreground leading-tight truncate">{email.subject}</h2>
            {headerCollapsed && (
              <p className="text-xs text-muted-foreground truncate mt-1">
                {email.fromName} · {formatFullDate(email.date)}
                {messageList.length > 0 && ` · ${messageList.length} message${messageList.length !== 1 ? 's' : ''}`}
              </p>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground/80 flex-shrink-0 transition-transform duration-250 ${headerCollapsed ? '' : 'rotate-180'}`} />
        </button>

        {!headerCollapsed && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-foreground">{email.fromName}</span>
              <span className="text-muted-foreground/80">&lt;{email.from}&gt;</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{formatFullDate(email.date)}</p>
            {email.hasAttachment && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Paperclip className="w-3 h-3" />
                <span>Attachment</span>
              </div>
            )}
            {messageList.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1.5">
                {messageList.length} message{messageList.length !== 1 ? 's' : ''} in thread
              </div>
            )}
          </div>
        )}
      </div>

      {/* Email Content / Messages */}
      <div className="flex-1 p-5 bg-card">
        {messagesLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messageList.length > 0 ? (
          <div className="space-y-6">
            {(!messageList || messageList.length <= 3 || messagesExpanded) ? (
              messageList.map((msg: MessageItem) => (
                <MessageBlock
                  key={msg.id}
                  msg={msg}
                  userEmail={userEmail}
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
                  <div className="absolute w-full top-1/2 left-0 h-px bg-border/40 group-hover:bg-border/60 transition-colors" />
                  <div className="absolute group w-full top-1/2 transform -translate-y-[5px] left-0 h-px bg-border/40 group-hover:bg-border/60 transition-colors" />
                  <div className="relative z-10 w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-xs font-semibold text-muted-foreground group-hover:border-primary/50 group-hover:text-primary transition-all shadow-sm">
                    <span className="group-hover:hidden">{messageList.length - 3}</span>
                    <ChevronsUpDown className="group-hover:block hidden w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Last Two Messages */}
                {messageList.slice(-2).map((msg: MessageItem) => (
                  <MessageBlock
                    key={msg.id}
                    msg={msg}
                    userEmail={userEmail}
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
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{email.snippet}</p>
          </div>
        )}
      </div>

      </div>{/* end scroll container */}

      {showReplyInput && (
        <InboxReplyComposer
          replyBody={replyBody}
          setReplyBody={setReplyBody}
          onSend={onSendReply}
          isSending={isSending}
          threadId={email.id}
          subject={email.subject}
        />
      )}

      {/* Action Bar - Always at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-border/40 bg-card">
        <div className="flex items-center justify-between gap-3">
          {/* Primary Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm rounded-xl font-semibold"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              <CornerUpLeft className="w-4 h-4 mr-2" />
              Reply
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="rounded-xl border-border/60 hover:bg-accent font-semibold text-foreground" onClick={onAddToProject}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Add to Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyDetailPanel({ hasEmails, isDisconnected }: { hasEmails: boolean, isDisconnected: boolean }) {
  if (isDisconnected) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-primary/5 via-card to-accent/5">
        <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mb-6 shadow-md border border-border/40">
          <Mail className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">Connect your Gmail</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          Connect your Gmail account to see emails automatically categorised by AI, with summaries and suggested actions.
        </p>
        <div className="flex flex-col gap-3 text-left text-sm text-foreground/80 bg-card/85 rounded-2xl p-5 border border-border/40 shadow-sm max-w-md">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-terracotta-500 mt-0.5 flex-shrink-0" />
            <span>Action required emails highlighted</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Package className="w-4 h-4 text-sage-500 mt-0.5 flex-shrink-0" />
            <span>Procurement emails automatically grouped</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Sparkle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0 animate-pulse" />
            <span>AI summaries and suggested actions</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex items-center justify-center text-center bg-card">
      <div className="flex flex-col items-center">
         <div className="w-16 h-16 bg-muted/60 rounded-full flex items-center justify-center mb-4 border border-border/20 shadow-sm">
        <Mail className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <p className="text-foreground font-semibold mb-1 text-base">Select an email</p>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">Choose an email from the list to view its content and AI analysis</p>
      </div>
    </div>
  );
}

export default function MagicalInboxPage() {
  const { user } = useUser();
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

  const [composeOpen, setComposeOpen] = useState(false);

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
  const [isSending, setIsSending] = useState(false);
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
      isRead: thread.is_read !== false,
      hasAttachment: Boolean(thread.has_attachment),
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

  // Show reply composer when a thread with messages is open
  useEffect(() => {
    if (selectedThreadId && messages && messages.length > 0) {
      setShowReplyInput(true);
    }
  }, [selectedThreadId, messages?.length]);

  async function handleSync() {
    setSyncing(true);
    fetchGmail({
      url: '/gmail/fetch/',
      data: {}
    }, {
      onSuccess: (e) => {
        toast.success(`Synced ${e.fetched || 0} new emails`);
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
    if (!email.isRead) {
      markGmailThreadRead(email.id)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: [threadsEndpoint] });
        })
        .catch(() => {});
    }
  }

  function handleMarkUnread() {
    if (!selectedThreadId) return;
    markGmailThreadUnread(selectedThreadId)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: [threadsEndpoint] });
        toast.success('Marked as unread');
      })
      .catch(() => toast.error('Could not mark thread as unread'));
  }

  async function handleSendReply(attachmentFiles: File[] = []) {
    const bodyHtml = sanitizeComposeHtml(replyBody);
    if ((!htmlHasContent(bodyHtml) && !attachmentFiles.length) || !selectedThreadId || !messages?.length) {
      return;
    }

    const toEmail = resolveReplyToEmail(messages, user?.email);
    const subject =
      messages.find((m) => m.subject)?.subject ||
      messages[messages.length - 1]?.subject ||
      '(No Subject)';

    if (!toEmail) {
      toast.error('Could not determine who to reply to.');
      return;
    }

    const formData = new FormData();
    formData.append('to_email', toEmail);
    formData.append('subject', subject);
    formData.append('body', bodyHtml);
    formData.append('thread_id', selectedThreadId);
    attachmentFiles.forEach((file) => formData.append('attachments', file));

    setIsSending(true);
    try {
      await postFormData({ url: 'gmail/send/', data: formData });
      toast.success('Reply sent successfully');
      setReplyBody('');
      setShowReplyInput(true);
      refetchMessages();
      refetchThreads();
    } catch (err: unknown) {
      toast.error(`Failed to send reply: ${getApiErrorMessage(err, 'Unknown error')}`);
    } finally {
      setIsSending(false);
    }
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
    const removeStudioEmail = emails;
    if (activeCategory === 'unread') {
      return removeStudioEmail.filter((e) => !e.isRead);
    }
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
    <div className="flex-1 pb-2 h-full bg-background flex flex-col overflow-hidden">
        {/* Top Bar: Tabs + Sync */}
        <div className="flex-shrink-0 p-4 sm:p-6 pb-4 bg-background">
        <div className="flex items-center justify-between gap-4">
          {/* Category Tabs or Search Results */}
          <div className="flex items-center gap-2">
            {searchQuery.trim() ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3.5 py-2 bg-muted border border-border/30 rounded-xl">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    Results for "<span className="font-semibold">{searchQuery}</span>"
                  </span>
                  <button
                    onClick={clearSearch}
                    className="ml-1 p-0.5 hover:bg-muted-foreground/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
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
                  category="unread"
                  label="Unread"
                  count={filteredStats.unread}
                  isActive={activeCategory === 'unread'}
                  onClick={() => handleCategoryChange('unread')}
                  icon={Mail}
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
                <span className="text-sm text-muted-foreground mr-2 font-medium">
                  {((currentPage - 1) * (pagination.page_size || 10)) + 1}-{Math.min(currentPage * (pagination.page_size || 10), pagination.total)} of {pagination.total}
                </span>
                <Button
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-foreground hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleNextPage}
                  disabled={currentPage >= pagination.total_pages}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-foreground hover:bg-muted"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {isGmailConnected && (
              <Button onClick={() => setComposeOpen(true)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl shadow-sm">
                <PenSquare className="mr-2 h-4 w-4" />
                Compose
              </Button>
            )}

            {/* Sync Button */}
            <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm" className="rounded-xl border-border/60 hover:bg-accent font-semibold text-foreground">
              {syncing || isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors shrink-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Gmail
                </button>
              ) : (
                <button
                  onClick={handleGmailConnect}
                  disabled={isConnecting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors disabled:opacity-60 shrink-0"
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 min-h-0 mx-4 sm:mx-6 mb-0 sm:mb-0 bg-card rounded-2xl shadow-md border border-border/50 overflow-hidden">
        {/* Left Panel: Email List — hidden on mobile when a thread is open */}
        <div className={`lg:col-span-2 border-r border-border/40 h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin bg-card/25 ${selectedThreadId ? 'hidden lg:block' : 'block'}`}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredEmails.length > 0 ? (
            <AnimatePresence initial={false}>
              {filteredEmails.map((email) => (
                <motion.div
                  key={email.id}
                  initial={newEmailIds.has(email.id) ? {
                    opacity: 0,
                    y: -60,
                    backgroundColor: 'rgba(var(--primary), 0.15)'
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
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <p className="text-foreground font-bold mb-2">Connect your Gmail</p>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Connect your Gmail account to see your emails automatically categorised with AI summaries.
              </p>
              <Button
                className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl shadow-sm"
                onClick={handleGmailConnect}
                disabled={isConnecting}
              >
                {isConnecting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connecting...</> : 'Connect Gmail'}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <p className="text-foreground font-bold mb-2">No emails found</p>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                {activeCategory !== 'all'
                  ? `No ${activeCategory === 'unread' ? 'unread' : activeCategory.replace('_', ' ')} emails found. Try selecting a different category.`
                  : 'Your inbox is empty.'}
              </p>
            </div>
          )}
        </div>

        {/* Right Panel: Email Detail + AI Summary — full width on mobile when thread open */}
        <div className={`lg:col-span-4 h-[calc(100vh-145px)] overflow-y-auto scrollbar-thin bg-card relative ${selectedThreadId ? 'col-span-1' : 'hidden lg:block'}`}>
          {selectedEmail ? (
            <EmailDetailPanelWithMessages
              email={selectedEmail}
              userEmail={user?.email}
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
              onMarkUnread={handleMarkUnread}
            />
          ) : (
            <EmptyDetailPanel isDisconnected={gmailDisconnected} hasEmails={filteredEmails.length > 0} />
          )}
        </div>
      </div>

      <ComposeEmailDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        studioId={user?.studio?.id}
        currentUserEmail={user?.email}
        onSent={(threadId) => {
          setSelectedThreadId(threadId);
          setShowReplyInput(false);
          refetchThreads();
        }}
      />

      {/* Add to Project Dialog */}
      <Dialog open={projectOpen} onOpenChange={(open) => {
        setProjectOpen(open);
        if (!open) {
          setProjectSearch('');
          setSelectedProjectId(null);
        }
      }}>
        <DialogContent className="sm:max-w-md bg-card border border-border/40 text-foreground rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-bold">Add to Project</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="pl-9 bg-background border-border/60 text-foreground rounded-xl focus-visible:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1">
              {projectsLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary w-5 h-5" /></div>
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project: any) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`px-3.5 py-2.5 rounded-xl cursor-pointer border transition-all flex items-center justify-between group ${selectedProjectId === project.id
                      ? 'bg-primary text-primary-foreground border-primary ring-1 ring-primary/20 shadow-sm'
                      : 'bg-card border-transparent text-foreground/80 hover:bg-accent/40 hover:border-border/40 hover:text-foreground'
                      }`}
                  >
                    <span className="text-sm font-semibold">{project.project_name}</span>
                    {project.project_code && (
                      <span className={`text-xs px-2.5 py-0.5 rounded-lg border font-medium ${selectedProjectId === project.id ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30' : 'text-muted-foreground bg-muted/65 border-border/30'}`}>{project.project_code}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  No projects found
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl border-border/60 text-foreground hover:bg-accent" onClick={() => setProjectOpen(false)}>Cancel</Button>
            <Button onClick={handleAddToProject} disabled={!selectedProjectId} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold shadow-sm">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gmail Disconnect Confirmation Dialog */}
      <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
        <DialogContent className="sm:max-w-sm bg-card border border-border/40 text-foreground rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-bold">Disconnect Gmail?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed">Your inbox will no longer sync and AI categorisation will stop. You can reconnect at any time.</p>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl border-border/60 text-foreground hover:bg-accent" onClick={() => setIsDisconnectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold shadow-sm" onClick={handleGmailDisconnect} disabled={isDisconnecting}>
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
