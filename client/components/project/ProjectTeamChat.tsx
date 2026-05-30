'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Send,
  Loader2,
  MessageSquare,
  Users,
  Plus,
  X,
  Smile,
  AtSign,
  Pin,
  PinOff,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { gooeyToast as toast } from 'goey-toast';
import useUser from '@/hooks/useUser';
import useFetch from '@/hooks/useFetch';
import { useProjectCollaborationContext } from '@/components/project/ProjectCollaborationProvider';
import type { TeamMessage } from '@/hooks/useProjectCollaboration';
import { TeamChatAttachmentView } from '@/components/project/TeamChatAttachmentView';
import {
  classifyChatFile,
  formatFileSize,
  getChatFileIcon,
  isAllowedChatFile,
  MAX_CHAT_FILE_BYTES,
} from '@/lib/team-chat-file-utils';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

dayjs.extend(relativeTime);

const TEAM_MENTION_ID = 'team';
const TEAM_MENTION_NAME = 'team';

const QUICK_EMOJIS = [
  '👍',
  '👏',
  '🔥',
  '✅',
  '❤️',
  '😊',
  '😂',
  '🎉',
  '🙏',
  '📌',
  '✨',
  '💡',
  '👀',
  '🚀',
  '😅',
  '🤝',
  '⭐',
  '📝',
  '📎',
  '💬',
  '🙌',
  '☕',
  '🎯',
];

type StudioMember = {
  id: number;
  name: string;
  email?: string;
  profile_picture?: string | null;
};

type MentionOption =
  | { type: 'team'; id: string; name: string; label: string }
  | { type: 'user'; id: number; name: string; profile_picture?: string | null };

function initials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function renderMentionParts(text: string, isOwn: boolean) {
  const parts = text.split(/(@team|@[^\s@]+(?:\s+[^\s@]+)*)/gi);
  return parts.map((part, i) => {
    if (!part.startsWith('@')) return <span key={i}>{part}</span>;
    return (
      <span
        key={i}
        className={cn(
          'font-semibold rounded-sm px-0.5',
          isOwn ? 'text-[#F2C744]' : 'bg-[#FFF0C8] text-[#9F6B00]'
        )}
      >
        {part}
      </span>
    );
  });
}

/** Strip legacy bold/highlight markup so old messages show as plain text with @mentions. */
function stripLegacyFormatting(content: string): string {
  return content
    .replace(/\[\[highlight\]\]([\s\S]*?)\[\[\/highlight\]\]/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1');
}

function renderMessageContent(content: string, isOwn: boolean) {
  return renderMentionParts(stripLegacyFormatting(content), isOwn);
}

export function ProjectTeamChat({ projectId }: { projectId: string }) {
  const t = useTranslations('projectTeamPage');
  const { user } = useUser();
  const [draft, setDraft] = useState('');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionMenuRef = useRef<HTMLUListElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    messagesLoading,
    sendMessage,
    isSending,
    toggleMessagePin,
    isTogglingPin,
  } = useProjectCollaborationContext();

  const { data: usersData } = useFetch(
    user?.studio?.id ? `user/studio-users/?studio_id=${user.studio.id}` : null
  );

  const studioMembers: StudioMember[] = useMemo(() => {
    const list = Array.isArray(usersData) ? usersData : usersData?.results ?? [];
    return list
      .filter((m: StudioMember) => m.id !== user?.id && m.name)
      .map((m: StudioMember) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        profile_picture: m.profile_picture,
      }));
  }, [usersData, user?.id]);

  const mentionOptions: MentionOption[] = useMemo(() => {
    const q = mentionQuery.toLowerCase().trim();
    const options: MentionOption[] = [];

    const teamMatches =
      !q || 'team'.startsWith(q) || 'everyone'.includes(q) || q === 't' || q === 'te';
    if (teamMatches) {
      options.push({
        type: 'team',
        id: TEAM_MENTION_ID,
        name: TEAM_MENTION_NAME,
        label: t('mentionEveryone'),
      });
    }

    studioMembers.forEach(m => {
      if (!q || m.name.toLowerCase().includes(q)) {
        options.push({
          type: 'user',
          id: m.id,
          name: m.name,
          profile_picture: m.profile_picture,
        });
      }
    });

    return options;
  }, [mentionQuery, studioMembers, t]);

  const [pinnedMsgs, restMsgs] = useMemo(() => {
    const pinned = messages.filter(m => m.is_pinned);
    const rest = messages.filter(m => !m.is_pinned);
    return [pinned, rest];
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pendingPreviewUrls = useMemo(() => {
    const map = new Map<number, string>();
    pendingFiles.forEach((file, index) => {
      if (classifyChatFile(file) === 'image') {
        map.set(index, URL.createObjectURL(file));
      }
    });
    return map;
  }, [pendingFiles]);

  useEffect(() => {
    return () => {
      pendingPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [pendingPreviewUrls]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [mentionOptions.length, mentionQuery]);

  const updateMentionState = useCallback((value: string, cursor: number) => {
    const before = value.slice(0, cursor);
    const atIndex = before.lastIndexOf('@');
    if (atIndex === -1) {
      setShowMentionMenu(false);
      setMentionQuery('');
      return;
    }

    const charBefore = atIndex > 0 ? before[atIndex - 1] : ' ';
    if (!/[\s\n]/.test(charBefore)) {
      setShowMentionMenu(false);
      setMentionQuery('');
      return;
    }

    const afterAt = before.slice(atIndex + 1);
    if (/[\s\n]/.test(afterAt)) {
      setShowMentionMenu(false);
      setMentionQuery('');
      return;
    }

    setShowMentionMenu(true);
    setMentionQuery(afterAt);
  }, []);

  const insertAtCursor = useCallback(
    (insertion: string, selectOffset?: { start: number; end: number }) => {
      const el = textareaRef.current;
      const start = el?.selectionStart ?? draft.length;
      const end = el?.selectionEnd ?? start;
      const next = draft.slice(0, start) + insertion + draft.slice(end);
      setDraft(next);
      updateMentionState(next, start + insertion.length);
      requestAnimationFrame(() => {
        el?.focus();
        if (selectOffset) {
          const a = start + selectOffset.start;
          const b = start + selectOffset.end;
          el?.setSelectionRange(a, b);
        } else {
          const pos = start + insertion.length;
          el?.setSelectionRange(pos, pos);
        }
      });
    },
    [draft, updateMentionState]
  );

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDraft(value);
    updateMentionState(value, e.target.selectionStart ?? value.length);
  };

  const insertMention = useCallback(
    (option: MentionOption) => {
      const el = textareaRef.current;
      if (!el) return;

      const value = draft;
      const cursor = el.selectionStart ?? value.length;
      const before = value.slice(0, cursor);
      const after = value.slice(cursor);
      const atIndex = before.lastIndexOf('@');
      if (atIndex === -1) return;

      const mentionText = option.type === 'team' ? '@team ' : `@${option.name} `;
      const newValue = before.slice(0, atIndex) + mentionText + after;
      setDraft(newValue);
      setShowMentionMenu(false);
      setMentionQuery('');

      requestAnimationFrame(() => {
        el.focus();
        const pos = atIndex + mentionText.length;
        el.setSelectionRange(pos, pos);
      });
    },
    [draft]
  );

  const addFiles = (incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    const accepted: File[] = [];
    for (const file of list) {
      if (!isAllowedChatFile(file)) {
        toast.error(`"${file.name}" is not a supported file type`);
        continue;
      }
      if (file.size > MAX_CHAT_FILE_BYTES) {
        toast.error(`"${file.name}" exceeds ${formatFileSize(MAX_CHAT_FILE_BYTES)} limit`);
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length) {
      setPendingFiles(prev => [...prev, ...accepted]);
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const canSend = draft.trim().length > 0 || pendingFiles.length > 0;

  const handleSend = async () => {
    const text = draft.trim();
    if (!text && pendingFiles.length === 0) return;
    try {
      await sendMessage({
        content: text,
        files: pendingFiles.length > 0 ? pendingFiles : undefined,
      });
      setDraft('');
      setPendingFiles([]);
      setShowMentionMenu(false);
      setMentionQuery('');
    } catch {
      toast.error(t('messageFailed'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionMenu && mentionOptions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex(i => (i + 1) % mentionOptions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex(i => (i - 1 + mentionOptions.length) % mentionOptions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionOptions[highlightIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionMenu(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onPinToggle = async (msg: TeamMessage, pin: boolean) => {
    try {
      await toggleMessagePin({ messageId: msg.id, pin });
    } catch {
      toast.error(pin ? 'Could not pin message' : 'Could not unpin message');
    }
  };

  const isOwnMessage = (msg: TeamMessage) => msg.user?.id === user?.id;

  const hasMessageBody = (msg: TeamMessage) => {
    const text = stripLegacyFormatting(msg.content || '').trim();
    return text.length > 0 || (msg.attachments?.length ?? 0) > 0;
  };

  const renderMessageBubble = (msg: TeamMessage, compact?: boolean) => {
    if (!hasMessageBody(msg)) return null;

    const own = isOwnMessage(msg);

    return (
      <div
        className={cn(
          'flex w-full group/msg',
          own && !compact ? 'justify-end' : 'justify-start'
        )}
      >
        <div
          className={cn(
            'flex gap-2.5 max-w-[min(85%,32rem)]',
            own && !compact ? 'flex-row-reverse' : 'flex-row',
            compact && 'max-w-full w-full'
          )}
        >
          {!compact && (
            <Avatar className="h-8 w-8 flex-shrink-0 mt-5">
              <AvatarImage src={msg.user?.profile_picture || undefined} />
              <AvatarFallback className="text-[10px]">
                {initials(msg.user?.name || '?')}
              </AvatarFallback>
            </Avatar>
          )}
          <div className={cn('flex flex-col min-w-0', own && !compact ? 'items-end' : 'items-start')}>
            <div
              className={cn(
                'flex items-center gap-2 mb-1 w-full',
                own && !compact ? 'flex-row-reverse' : 'flex-row',
                compact && 'text-[11px] text-amber-900/80'
              )}
            >
              <span
                className={cn(
                  'font-medium',
                  compact ? 'text-[11px]' : 'text-xs text-gray-900'
                )}
              >
                {own ? 'You' : msg.user?.name || 'Unknown'}
              </span>
              <span className={compact ? 'text-amber-800/60' : 'text-[11px] text-gray-400'}>
                {dayjs(msg.created_at).fromNow()}
              </span>
              {!compact && (
                <button
                  type="button"
                  onClick={() => onPinToggle(msg, !msg.is_pinned)}
                  disabled={isTogglingPin}
                  className={cn(
                    'rounded p-0.5 transition-opacity',
                    msg.is_pinned
                      ? 'text-amber-600 opacity-100'
                      : 'text-neutral-400 opacity-0 group-hover/msg:opacity-100 hover:text-amber-600'
                  )}
                  title={msg.is_pinned ? 'Unpin message' : 'Pin message'}
                  aria-label={msg.is_pinned ? 'Unpin' : 'Pin'}
                >
                  {msg.is_pinned ? (
                    <PinOff className="h-3.5 w-3.5" />
                  ) : (
                    <Pin className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
            <div className="flex items-end gap-1.5">
              <div
                className={cn(
                  'rounded-2xl px-4 py-2.5 text-sm min-w-0',
                  own
                    ? 'bg-neutral-900 text-white rounded-tr-sm'
                    : 'bg-stone-100 text-gray-900 rounded-tl-sm',
                  compact && own && 'bg-stone-200 text-gray-900 border border-stone-300/60',
                  compact && !own && 'bg-white border border-amber-100'
                )}
              >
                {stripLegacyFormatting(msg.content || '').trim() ? (
                  <p className="whitespace-pre-wrap break-words">
                    {renderMessageContent(msg.content, own)}
                  </p>
                ) : null}
                {msg.attachments?.map(att => (
                  <TeamChatAttachmentView
                    key={att.id}
                    attachment={att}
                    isOwn={own && !compact}
                  />
                ))}
              </div>
              {compact && (
                <button
                  type="button"
                  onClick={() => onPinToggle(msg, false)}
                  disabled={isTogglingPin}
                  className="flex-shrink-0 rounded-md p-1.5 text-amber-800 hover:bg-amber-100/80"
                  title="Unpin"
                  aria-label="Unpin"
                >
                  <PinOff className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[min(720px,calc(100vh-11rem))] min-h-[420px] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-gray-500" />
        <h2 className="text-sm font-medium text-gray-900">Team chat</h2>
        <span className="text-xs text-gray-400 ml-auto">Updates every few seconds</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {messagesLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}

        {!messagesLoading && messages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">{t('noMessages')}</p>
            <p className="text-xs text-neutral-400 mt-1">
              Use the toolbar below — <span className="font-medium">@</span> mentions, emoji, and files.
            </p>
          </div>
        )}

        {!messagesLoading && pinnedMsgs.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 space-y-3 mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wide">
              <Pin className="w-3.5 h-3.5" aria-hidden />
              Pinned
            </div>
            {pinnedMsgs.map(msg => (
              <div key={`pin-${msg.id}`}>{renderMessageBubble(msg, true)}</div>
            ))}
          </div>
        )}

        {!messagesLoading &&
          restMsgs.map(msg => <div key={msg.id}>{renderMessageBubble(msg)}</div>)}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 border-t border-gray-100 p-4 bg-white">
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {pendingFiles.map((file, index) => {
              const fileType = classifyChatFile(file);
              const previewUrl = pendingPreviewUrls.get(index) ?? null;
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="relative flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 pr-8 max-w-[200px]"
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="" className="h-10 w-10 rounded object-cover flex-shrink-0" />
                  ) : (
                    <span className="text-neutral-500">{getChatFileIcon(fileType, file.name)}</span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingFile(index)}
                    className="absolute top-1 right-1 rounded-full p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.ppt,.pptx"
          onChange={e => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = '';
          }}
        />

        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
          <div className="relative">
            {showMentionMenu && (
              <ul
                ref={mentionMenuRef}
                className="absolute bottom-full left-0 right-0 mb-2 max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg z-50 py-1 text-gray-900"
              >
                {mentionOptions.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
                ) : (
                  mentionOptions.map((option, index) => (
                    <li key={`${option.type}-${option.id}`}>
                      <button
                        type="button"
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-stone-50',
                          index === highlightIndex && 'bg-stone-100'
                        )}
                        onMouseDown={e => {
                          e.preventDefault();
                          insertMention(option);
                        }}
                        onMouseEnter={() => setHighlightIndex(index)}
                      >
                        {option.type === 'team' ? (
                          <>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white">
                              <Users className="h-3.5 w-3.5" />
                            </span>
                            <span>
                              <span className="font-medium">@team</span>
                              <span className="block text-xs text-gray-500">Notify all studio members</span>
                            </span>
                          </>
                        ) : (
                          <>
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={option.profile_picture || undefined} />
                              <AvatarFallback className="text-[9px] bg-gray-200 text-gray-700">
                                {initials(option.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">@{option.name}</span>
                          </>
                        )}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
            <Textarea
              ref={textareaRef}
              placeholder={t('placeholder')}
              value={draft}
              onChange={handleDraftChange}
              onKeyDown={handleKeyDown}
              onClick={e => updateMentionState(draft, e.currentTarget.selectionStart ?? 0)}
              disabled={isSending}
              className={cn(
                'min-h-[88px] resize-none rounded-none border-0 bg-transparent px-4 pt-3 pb-2',
                'text-gray-900 placeholder:text-gray-400',
                'focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none',
                'caret-gray-900 text-[15px] leading-relaxed'
              )}
            />
          </div>

          <div className="flex items-center justify-between gap-2 px-2 pb-2 pt-1 border-t border-gray-200 bg-stone-50/50">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200/90 text-gray-700 hover:text-gray-900 hover:bg-gray-300/90 transition-colors disabled:opacity-40"
                aria-label="Attach file"
                title="Attach file"
              >
                <Plus className="h-5 w-5" />
              </button>
              <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={isSending}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40"
                    title="Emoji"
                    aria-label="Insert emoji"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[280px] p-3 bg-white border border-gray-200 z-[60] shadow-md"
                  align="start"
                  side="top"
                  sideOffset={8}
                >
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Quick emoji</p>
                  <div className="grid grid-cols-8 gap-1">
                    {QUICK_EMOJIS.map(emo => (
                      <button
                        key={emo}
                        type="button"
                        className="h-8 w-8 rounded-md text-lg hover:bg-stone-100 flex items-center justify-center"
                        onClick={() => {
                          insertAtCursor(emo);
                          setEmojiOpen(false);
                        }}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <button
                type="button"
                onClick={() => {
                  const el = textareaRef.current;
                  const pos = el?.selectionStart ?? draft.length;
                  const before = draft.slice(0, pos);
                  const pad =
                    pos > 0 && before.length > 0 && !/[\s\n]/.test(before[before.length - 1]!)
                      ? ' '
                      : '';
                  const ins = pad + '@';
                  const next = before + ins + draft.slice(pos);
                  setDraft(next);
                  requestAnimationFrame(() => {
                    const t = textareaRef.current;
                    const caret = pos + ins.length;
                    t?.focus();
                    t?.setSelectionRange(caret, caret);
                    updateMentionState(next, caret);
                  });
                }}
                disabled={isSending}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40"
                title="Mention"
                aria-label="Mention"
              >
                <AtSign className="h-5 w-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend || isSending}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                canSend && !isSending
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
              aria-label="Send"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              ) : (
                <Send className="h-5 w-5 translate-x-0.5" />
              )}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 mt-2">
          Pin any message from the hover icon · Files up to {formatFileSize(MAX_CHAT_FILE_BYTES)}
        </p>
      </div>
    </div>
  );
}
