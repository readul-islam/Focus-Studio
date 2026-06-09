'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { gooeyToast as toast } from 'goey-toast';
import { useTranslations } from 'next-intl';

type ClientMessage = {
  id: number;
  content: string;
  sender_type: 'studio' | 'client';
  created_at: string;
};

type Props = {
  projectId: string;
  clientId: number | string | null | undefined;
  clientName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ClientMessageDialog({ projectId, clientId, clientName, open, onOpenChange }: Props) {
  const t = useTranslations('clientMessageDialog');
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], refetch, isLoading } = useFetch<ClientMessage[]>(
    clientId ? `projects/client-messages/?project_id=${projectId}&client_id=${clientId}` : null,
    { enabled: open && !!clientId, refetchInterval: open ? 5000 : false },
  );

  const sendMutation = usePost({
    onSuccess: () => {
      setDraft('');
      refetch();
      toast.success(t('sent'));
    },
    onError: () => toast.error(t('sendFailed')),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!draft.trim() || !clientId) return;
    sendMutation.mutate({
      url: 'projects/client-messages/',
      data: {
        project_id: Number(projectId),
        client_id: Number(clientId),
        content: draft.trim(),
        sender_type: 'studio',
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t('title', { name: clientName || t('client') })}
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-[280px] flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-stone-50 p-3">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-gray-500">{t('empty')}</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={msg.sender_type === 'studio' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={
                      msg.sender_type === 'studio'
                        ? 'max-w-[85%] rounded-2xl rounded-br-md bg-gray-900 px-3 py-2 text-sm text-white'
                        : 'max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm text-gray-900 shadow-sm'
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('placeholder')}
            rows={2}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button className="shrink-0 self-end" onClick={handleSend} disabled={!draft.trim() || sendMutation.isPending}>
            {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
