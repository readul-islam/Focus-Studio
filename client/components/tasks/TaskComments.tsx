'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fetchData, patchData, postData } from '@/lib/Api';
import { gooeyToast as toast } from 'goey-toast';
import useUser from '@/hooks/useUser';
import { COLLAB_POLL_MS } from '@/hooks/useProjectCollaboration';

interface CommentUser {
  id: number;
  name: string;
  profile_picture?: string | null;
}

interface ApiComment {
  id: number;
  text: string;
  user: CommentUser;
  created_at: string;
}

function initials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function TaskComments({
  taskId,
  projectId,
  teamMembers,
}: {
  taskId: string | number;
  projectId?: string | null;
  teamMembers: { id: number; name: string }[];
}) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [text, setText] = React.useState('');
  const [mentionUser, setMentionUser] = React.useState<{ id: number; name: string } | null>(null);
  const [showMentionDropdown, setShowMentionDropdown] = React.useState(false);
  const [filteredUsers, setFilteredUsers] = React.useState<{ id: number; name: string }[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const { data: taskData, isLoading } = useQuery({
    queryKey: ['task-detail', taskId],
    queryFn: () => fetchData(`task/tasks/${taskId}/`),
    enabled: !!taskId,
    refetchInterval: COLLAB_POLL_MS,
    refetchIntervalInBackground: false,
  });

  const comments: ApiComment[] = taskData?.comments ?? [];

  const createCommentMutation = useMutation({
    mutationFn: async ({
      commentText,
      mentioned,
    }: {
      commentText: string;
      mentioned: { id: number; name: string } | null;
    }) => {
      const newComment = await postData({
        url: '/comment/comments/',
        data: { text: commentText },
      });
      const currentIds = comments.map(c => c.id);
      await patchData({
        url: `task/tasks/${taskId}/`,
        data: { comments: [...currentIds, newComment.id] },
      });
      return { commentText, mentioned };
    },
    onSuccess: async ({ commentText, mentioned }) => {
      setText('');
      setMentionUser(null);
      queryClient.invalidateQueries({ queryKey: ['task-detail', taskId] });
      if (mentioned) {
        try {
          await postData({
            url: '/collaboration/notify-mention/',
            data: {
              recipient_id: mentioned.id,
              message: commentText,
              project_id: projectId,
              task_id: taskId,
            },
          });
        } catch {
          /* non-blocking */
        }
      }
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    if (value.includes('@')) {
      const cursor = e.target.selectionStart;
      const before = value.slice(0, cursor);
      const atIndex = before.lastIndexOf('@');
      if (atIndex !== -1) {
        const search = before.slice(atIndex + 1);
        setFilteredUsers(
          teamMembers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
        );
        setShowMentionDropdown(true);
        return;
      }
    }
    setShowMentionDropdown(false);
  };

  const selectMention = (member: { id: number; name: string }) => {
    const el = textareaRef.current;
    if (!el) return;
    const cursor = el.selectionStart;
    const before = text.slice(0, cursor);
    const after = text.slice(cursor);
    const atIndex = before.lastIndexOf('@');
    const newText = `${before.slice(0, atIndex)}@${member.name} ${after}`;
    setText(newText);
    setMentionUser(member);
    setShowMentionDropdown(false);
    el.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    createCommentMutation.mutate({ commentText: text.trim(), mentioned: mentionUser });
  };

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Comments</h3>
      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white relative">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Add comment (@mention to notify)"
          className="min-h-[80px] border-0 focus-visible:ring-0 resize-none"
        />
        {showMentionDropdown && filteredUsers.length > 0 && (
          <ul className="absolute z-50 left-4 right-4 top-16 max-h-40 overflow-auto bg-white border border-gray-200 rounded-lg shadow-md">
            {filteredUsers.map(m => (
              <li
                key={m.id}
                className="px-3 py-2 text-sm hover:bg-stone-50 cursor-pointer"
                onMouseDown={e => {
                  e.preventDefault();
                  selectMention(m);
                }}
              >
                {m.name}
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end p-3 pt-0">
          <Button type="submit" size="sm" disabled={!text.trim() || createCommentMutation.isPending}>
            Comment
          </Button>
        </div>
      </form>

      {isLoading && <p className="text-sm text-gray-500 mt-3">Loading comments…</p>}

      <ul className="mt-4 space-y-3">
        {comments.map(c => (
          <li key={c.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={c.user?.profile_picture || undefined} />
                <AvatarFallback className="text-[10px]">{initials(c.user?.name || '?')}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-900">
                    {c.user?.id === user?.id ? 'You' : c.user?.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{c.text}</p>
              </div>
            </div>
          </li>
        ))}
        {!isLoading && comments.length === 0 && (
          <p className="text-sm text-gray-500">No comments yet.</p>
        )}
      </ul>
    </div>
  );
}
