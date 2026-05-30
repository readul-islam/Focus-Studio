'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import type { ProjectContractor } from '@/lib/contractor/types';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { gooeyToast as toast } from 'goey-toast';
import { useTranslations } from 'next-intl';

interface ContractorMessage {
  id: number;
  content: string;
  sender_type: 'studio' | 'contractor';
  created_at: string;
  is_read: boolean;
}

interface ContractorMessageDialogProps {
  contractor: ProjectContractor | null;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessageSent?: () => void;
}

function formatMessageTime(
  timestamp: string,
  t: ReturnType<typeof useTranslations<'contractorMessageDialog'>>,
): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (diffDays === 0) return t('todayAt', { time });
  if (diffDays === 1) return t('yesterdayAt', { time });
  if (diffDays < 7) return t('daysAgoAt', { days: diffDays, time });
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ContractorMessageDialog({
  contractor,
  projectId,
  open,
  onOpenChange,
  onMessageSent,
}: ContractorMessageDialogProps) {
  const t = useTranslations('contractorMessageDialog');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages from API
  const { data: messagesData, refetch: refetchMessages } = useFetch(
    `contractor_portal/messages/?project_id=${projectId}`,
    {
      enabled: open && !!projectId,
    }
  );

  const sendMessageMutation = usePost({
    onSuccess: () => {
      setNewMessage('');
      refetchMessages();
      onMessageSent?.();
      toast.success(t('messageSent'));
    },
    onError: (error: any) => {
      toast.error(t('sendFailed'));
      console.error('Failed to send message:', error);
    },
  });

  const messages: ContractorMessage[] = messagesData?.results || messagesData || [];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !contractor) return;

    sendMessageMutation.mutate({
      url: 'contractor_portal/messages/',
      data: {
        content: newMessage.trim(),
        project_id: projectId,
        sender_type: 'studio',
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!contractor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-neutral-600" />
            {t('title', { name: contractor.name })}
          </DialogTitle>
        </DialogHeader>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[400px] space-y-3 py-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">{t('noMessages')}</p>
              <p className="text-xs text-neutral-400 mt-1">
                {t('startConversation', { name: contractor.name })}
              </p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'studio' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.sender_type === 'studio'
                      ? 'bg-umber-900 text-white'
                      : 'bg-stone-100 text-neutral-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender_type === 'studio' ? 'text-white/70' : 'text-neutral-500'
                    }`}
                  >
                    {msg.sender_type === 'contractor' && contractor && (
                      <span className="font-medium">{contractor.name} · </span>
                    )}
                    {formatMessageTime(msg.created_at, t)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-neutral-200 pt-4">
          <div className="flex gap-2">
            <Textarea
              placeholder={t('messagePlaceholder')}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] resize-none"
              disabled={sendMessageMutation.isPending}
            />
          </div>
          <div className="flex justify-end mt-3">
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="h-9 bg-umber-900 text-white hover:bg-umber-800"
            >
              {sendMessageMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('sending')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('send')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}