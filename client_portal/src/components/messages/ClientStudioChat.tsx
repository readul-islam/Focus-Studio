'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import useUser from '@/hooks/userUser';
import { fetchData, postData } from '@/lib/Api';
import { useTranslations } from 'next-intl';

type Message = {
  id: number;
  content: string;
  sender_type: 'studio' | 'client';
  created_at: string;
};

export function ClientStudioChat() {
  const t = useTranslations('messagesPage.studioChat');
  const { project } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const projectId = project?.project_id;

  const loadMessages = async () => {
    if (!projectId) return;
    try {
      const data = await fetchData(`client_portal/project-messages/?project_id=${projectId}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      toast.error(t('loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    if (!projectId) return;
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !projectId || sending) return;
    setSending(true);
    setInput('');
    try {
      await postData({
        url: 'client_portal/project-messages/',
        data: { project_id: projectId, content: trimmed },
      });
      await loadMessages();
    } catch {
      toast.error(t('sendFailed'));
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  };

  if (!projectId) {
    return <p className="p-6 text-center text-sm text-gray-500">{t('noProject')}</p>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-medium text-gray-900">{t('title')}</p>
        <p className="text-xs text-gray-500">{t('subtitle')}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500">{t('empty')}</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={msg.sender_type === 'client' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    msg.sender_type === 'client'
                      ? 'max-w-[85%] rounded-2xl rounded-br-md bg-gray-900 px-3 py-2 text-sm text-white'
                      : 'max-w-[85%] rounded-2xl rounded-bl-md bg-gray-100 px-3 py-2 text-sm text-gray-900'
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
      <form
        className="flex items-end gap-2 border-t border-gray-100 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('placeholder')}
          rows={1}
          className="min-h-[44px] resize-none"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || sending}>
          <ArrowUp className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
