import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Helmet } from 'react-helmet-async';
import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import useUser from '@/hooks/userUser';
import { toast } from 'sonner';

interface Message {
  id: number;
  content: string;
  sender_type: 'studio' | 'contractor';
  created_at: string;
  is_read: boolean;
}

export default function Messages() {
  const { user, project: projectData } = useUser();
  const [messageContent, setMessageContent] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading, refetch } = useFetch(
    `contractor_portal/messages/?project_id=${projectData?.project_id}`,
    {
      enabled: !!projectData?.project_id,
    }
  );

  const sendMessageMutation = usePost({
    onSuccess: () => {
      setMessageContent('');
      refetch();
      toast.success('Message sent');
    },
    onError: (error: any) => {
      // If 404, still show success since UI is there
      if (error?.response?.status === 404) {
        toast.info('Messaging feature coming soon');
      } else {
        toast.error('Failed to send message');
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageContent.trim()) return;

    sendMessageMutation.mutate({
      url: 'contractor_portal/messages/',
      data: {
        content: messageContent,
        project_id: projectData?.project_id,
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const messagesList = messages?.results || messages || [];

  const getInitials = (senderType: string) => {
    if (senderType === 'contractor') {
      return user?.first_name?.[0]?.toUpperCase() || 'C';
    }
    return 'S';
  };

  const getSenderName = (senderType: string) => {
    if (senderType === 'contractor') {
      return user?.name || 'You';
    }
    return 'Studio';
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getMessagePreview = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Messages | TechStyles</title>
      </Helmet>

      <div className="flex-1 bg-gray-50 p-4 lg:p-6 h-[calc(100vh-64px)] flex flex-col">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 h-full min-h-0">

            {/* LEFT - col-span-2 */}
            <div className="col-span-1 lg:col-span-2 flex flex-col h-full min-h-0">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
                <div className="p-4 border-b border-gray-100 flex-shrink-0">
                  <h3 className="text-sm font-medium text-gray-900">Recent Messages</h3>
                </div>
                <div className="overflow-y-auto flex-1 p-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-gray-500 text-sm">Loading messages...</div>
                    </div>
                  ) : messagesList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <MessageSquare className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-gray-600 font-medium">No messages yet</p>
                      <p className="text-gray-400 text-sm mt-1">Start a conversation with your project team</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {messagesList.map((message: Message) => {
                        const isContractor = message.sender_type === 'contractor';
                        const initials = getInitials(message.sender_type);
                        const senderName = getSenderName(message.sender_type);
                        const isSelected = selectedMessage?.id === message.id;

                        return (
                          <div
                            key={message.id}
                            onClick={() => setSelectedMessage(message)}
                            className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                              isSelected ? 'bg-gray-100' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              {/* Avatar */}
                              <div
                                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                  isContractor
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-500 text-white'
                                }`}
                              >
                                {initials}
                              </div>

                              {/* Message Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-medium text-gray-900 text-sm">
                                    {senderName}
                                  </span>
                                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                    {formatMessageTime(message.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 truncate">
                                  {getMessagePreview(message.content)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT - col-span-4 */}
            <div className="col-span-1 lg:col-span-4 flex flex-col h-full min-h-0">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-0 mt-0">
                {/* Message Detail View */}
                {!selectedMessage ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Select a message to see more
                    </h3>
                    <p className="text-sm text-gray-600">
                      Choose a conversation from the list to view the full message
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col h-full">
                    {/* Message Header */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                            selectedMessage.sender_type === 'contractor'
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-500 text-white'
                          }`}
                        >
                          {getInitials(selectedMessage.sender_type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getSenderName(selectedMessage.sender_type)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedMessage.created_at).toLocaleString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <p className="text-gray-900 whitespace-pre-wrap break-words">
                        {selectedMessage.content}
                      </p>
                    </div>

                    {/* Reply Input */}
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="flex gap-3 items-end">
                        <Textarea
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type your reply..."
                          className="flex-1 min-h-20 resize-none bg-white border border-gray-200 rounded-lg"
                          disabled={sendMessageMutation.isPending}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!messageContent.trim() || sendMessageMutation.isPending}
                          className="h-10 px-4 bg-gray-900 text-white hover:bg-gray-800"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
