'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { sanitizeEmailHtml } from '@/lib/sanitize-html';
import { HomeNav } from '@/components/home-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Send,
  Loader2,
  Mail,
  Reply as ReplyIcon,
  MoreHorizontal,
  X,
  Maximize2,
  Minimize2,
  ChevronsUpDown,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { gooeyToast as toast } from 'goey-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { usePost } from '@/hooks/usePost';
import useFetch from '@/hooks/useFetch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

// extend once in your app (e.g., in _app.tsx or a utils/date.ts file)
dayjs.extend(relativeTime);

type ThreadItem = {
  thread_id: string;
  subject: string;
  snippet: string;
  sender: string;
  received_at: string;
  project: string;
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

export function extractLatestEmail(html: string) {
  if (!html) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove quoted Gmail threads
  doc.querySelectorAll('.gmail_quote, blockquote').forEach(el => el.remove());

  return doc.body.innerHTML;
}

export function splitGmailEmail(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const quoted = doc.querySelector('.gmail_quote, blockquote');
  let quotedHtml = '';

  if (quoted) {
    quotedHtml = quoted.outerHTML;
    quoted.remove();
  }

  return {
    main: sanitizeEmailHtml(doc.body.innerHTML.trim()),
    quoted: quotedHtml ? sanitizeEmailHtml(quotedHtml) : '',
  };
}

const MessageBlock = ({ msg }: { msg: MessageItem }) => {
  const [expanded, setExpanded] = useState(false);
  // Memoize parsing to avoid re-parsing on every render
  const { main, quoted } = useMemo(() => splitGmailEmail(msg.body), [msg.body]);

  return (
    <div className={`flex gap-4 `}>
      <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
        <AvatarFallback className={msg.is_sent ? 'bg-black text-white' : 'bg-stone-200'}>
          {msg?.sender?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col max-w-[99%]`}>
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-xs font-medium text-gray-900">{msg.is_sent ? 'You' : msg.sender?.split('<')[0]}</span>
          <span className="text-xs text-gray-500">{dayjs(msg.received_at).format('D MMM, h:mm A')}</span>
        </div>

        <div
          className={`rounded-2xl p-4 text-sm w-full ${
            msg.is_sent ? 'bg-stone-50 text-gray-900 rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm'
          }`}
        >
          {/* Main Content */}
          <div
            className="prose prose-sm max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:mx-auto [&_img]:inline-block"
            dangerouslySetInnerHTML={{ __html: main }}
          />

          {/* Quoted Text / Expand Button */}
          {quoted && (
            <div className="mt-3">
              {!expanded ? (
                <button
                  onClick={() => setExpanded(true)}
                  className="flex items-center justify-center px-1  bg-stone-200 hover:bg-stone-300 rounded-[5px] text-gray-500 transition-colors"
                  title="Show trimmed content"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setExpanded(false)}
                    className="flex items-center justify-center px-1  bg-stone-200 hover:bg-stone-300 rounded-[5px] text-gray-500 transition-colors"
                    title="Show trimmed content"
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
      </div>
    </div>
  );
};

export default function ProjectMessagesPage({ params }: { params: { id: string } }) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [searchText, setSearchText] = useState('');
  const [hoveredThreadId, setHoveredThreadId] = useState<string | null>(null);
  const [unlinkDialog, setUnlinkDialog] = useState<{ open: boolean; threadId: string | null }>({ open: false, threadId: null });
  const { mutate: fetchGmail } = usePost();
  const { mutate: unlinkThread, isPending: isUnlinking } = usePost();
  const projectId = params.id;
  // Fetch Threads List
  const {
    data: threads,
    isLoading: threadsLoading,
    refetch: refetchThreads,
  } = useFetch(`/gmail/threads/project/${projectId}/`, {
    enabled: !!projectId,
  });

  // Fetch Thread Details
  const {
    data: messages,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useFetch(selectedThreadId ? `/gmail/thread/${selectedThreadId}/` : null, { enabled: !!selectedThreadId });

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isReplyVisible, setIsReplyVisible] = useState(false); // State to toggle reply section in full screen
  const [messagesExpanded, setMessagesExpanded] = useState(false);

  // Reset expansion when thread changes
  useEffect(() => {
    setMessagesExpanded(false);
  }, [selectedThreadId]);

  useEffect(() => {
    fetchGmail(
      {
        url: '/gmail/fetch/',
        data: {},
      },
      {
        onSuccess: e => {
          if (e.fetched > 0) {
            refetchThreads();
          }
        },
        onError: () => {},
      },
    );
  }, []);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Send Reply Mutation
  const { mutate: sendReply, isPending: isSending } = usePost();

  useEffect(() => {
    document.title = 'My Inbox | TechStyles';
  }, []);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (messages?.length > 1 && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleThreadSelect = (threadId: string) => {
    setSelectedThreadId(threadId);
    setReplyBody(''); // Clear reply draft on switch
  };

  const handleSendReply = () => {
    if (!replyBody.trim() || !selectedThreadId || !messages?.length) return;
    const lastMsg = messages[messages.length - 1];

    let toEmail = '';
    // Extract email from "Name <email@example.com>" format
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
      thread_id: selectedThreadId,
    };

    sendReply(
      {
        url: '/gmail/send/',
        data: payload,
      },
      {
        onSuccess: () => {
          toast.success('Reply sent successfully');
          setReplyBody('');
          refetchMessages(); // Refresh conversation
        },
        onError: (err: any) => {
          toast.error('Failed to send reply: ' + (err.message || 'Unknown error'));
        },
      },
    );
  };

  const handleUnlinkThread = () => {
    if (!unlinkDialog.threadId) return;

    unlinkThread(
      {
        url: '/gmail/threads/unlink/',
        data: { thread_id: unlinkDialog.threadId, project_id: projectId },
      },
      {
        onSuccess: () => {
          toast.success('Thread removed from this project');
          setUnlinkDialog({ open: false, threadId: null });
          if (selectedThreadId === unlinkDialog.threadId) {
            setSelectedThreadId(null);
          }
          refetchThreads();
        },
        onError: () => {
          toast.error('Failed to remove thread');
        },
      },
    );
  };

  // Filter threads based on search
  const filteredThreads = (Array.isArray(threads) ? threads : []).filter(
    (t: ThreadItem) =>
      t.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
      t.sender?.toLowerCase().includes(searchText.toLowerCase()) ||
      t.snippet?.toLowerCase().includes(searchText.toLowerCase()) ||
      t.project?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className=" h-[calc(100vh-64px)] flex flex-col">
      <div className=" w-full h-full flex flex-col space-y-6">
        {/* Header / Search */}
        {/* <div className="flex items-center justify-between">
       
          

        </div> */}

        <div
          className={`grid grid-cols-1 lg:grid-cols-6 gap-6 h-full min-h-0 ${isFullScreen ? 'fixed h-screen w-screen inset-0 z-50 bg-stone-50 top-0 p-2' : ''}`}
        >
          {/* Left Column: Messages List */}
          <div className={`col-span-1 lg:col-span-2 flex flex-col h-full min-h-0 ${selectedThreadId ? 'hidden lg:flex' : 'flex'}`}>
            {/* Search Bar - Moved here for better mobile UX */}
            {/* Search Bar - Moved here for better mobile UX */}
            <div className="relative w-full mb-4 lg:hidden">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Search inbox..."
                className="pl-10 bg-white border-gray-200 focus:border-gray-300 focus:ring-0"
              />
            </div>

            <div className="bg-white border  border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="p-4 border-b border-gray-100 flex-shrink-0">
                <h3 className="text-sm font-medium text-gray-900">Recent Messages</h3>
              </div>

              <div className="overflow-y-auto flex-1 p-0">
                {threadsLoading && (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                )}

                {!threadsLoading && filteredThreads.length === 0 && (
                  <div className="p-8 text-center text-sm text-gray-500">Nothing here yet.</div>
                )}

                <div className="divide-y divide-gray-100">
                  {filteredThreads.map((thread: ThreadItem) => (
                    <div
                      key={thread.thread_id}
                      onClick={() => handleThreadSelect(thread.thread_id)}
                      onMouseEnter={() => setHoveredThreadId(thread.thread_id)}
                      onMouseLeave={() => setHoveredThreadId(null)}
                      className={`px-4 py-3.5 group flex gap-3 cursor-pointer transition-colors ${
                        selectedThreadId === thread.thread_id ? 'bg-stone-50' : 'hover:bg-stone-50/50'
                      }`}
                    >
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarFallback
                          className={`text-xs font-medium ${selectedThreadId === thread.thread_id ? 'bg-stone-200 text-gray-700' : 'bg-stone-100 text-gray-600'}`}
                        >
                          {thread.sender?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 overflow-hidden">
                        {/* Row 1: Sender + Time + Delete */}
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-gray-900 truncate flex-1">
                            {thread.sender?.split('<')[0].trim()}
                          </span>
                          <div className="flex items-center gap-0 flex-shrink-0">
                            <motion.span
                              animate={{ x: hoveredThreadId === thread.thread_id ? -6 : 0 }}
                              transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
                              className="text-[11px]  text-gray-400"
                            >
                              {dayjs(thread.received_at).fromNow(true)}
                            </motion.span>
                            <motion.button
                              initial={false}
                              animate={{
                                opacity: hoveredThreadId === thread.thread_id ? 1 : 0,
                                x: hoveredThreadId === thread.thread_id ? 0 : 8,
                              }}
                              transition={{ type: 'tween', duration: 0.12, ease: 'easeOut' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setUnlinkDialog({ open: true, threadId: thread.thread_id });
                              }}
                              className={`p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors ${hoveredThreadId === thread.thread_id ? 'pointer-events-auto' : 'pointer-events-none'}`}
                              title="Remove from project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Row 2: Subject */}
                        <p className="text-[13px] text-gray-700 truncate mb-0.5">
                          {thread.subject || '(No Subject)'}
                        </p>

                        {/* Row 3: Snippet */}
                        <p className="text-xs text-gray-400 truncate">{thread.snippet}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Conversation View */}
          <div className={`col-span-1 lg:col-span-4 flex flex-col h-full min-h-0 ${!selectedThreadId ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex items-center justify-between mb-2 lg:mb-0">
              {/* Back Button for Mobile */}
              <div className="flex items-center gap-2 lg:hidden">
                <Button variant="ghost" size="icon" onClick={() => setSelectedThreadId(null)} className="-ml-2">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Button>
              </div>

              {/* Desktop Search Bar */}
              <div className="relative w-64 xl:w-80 hidden lg:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  placeholder="Search inbox..."
                  className="pl-10 bg-white border-gray-200 focus:border-gray-300 focus:ring-0"
                />
              </div>

              <div className="flex gap-3">
                {/* <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button> */}

                <Button
                  variant="outline"
                  size="icon"
                  className="text-gray-600 border-gray-300 bg-white w-9 h-9"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Email View */}
            <div className=" bg-white border border-gray-200 flex-1 min-h-0 mt-5 rounded-xl shadow-sm overflow-hidden flex flex-col">
              {!selectedThreadId ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Mail className="w-12 h-12 mb-4 opacity-20" />
                  <p>Select a message to see more</p>
                </div>
              ) : (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-gray-100 bg-white/50 flex-shrink-0 flex justify-between items-center">
                    <div className="max-w-[90%]">
                      <h2 className="text-lg font-semibold text-gray-900 truncate w-full">
                        {messages?.[0]?.subject || filteredThreads.find(t => t.thread_id === selectedThreadId)?.subject || 'Conversation'}
                      </h2>
                      <div className="text-xs text-gray-500 mt-1">{messages?.length || 0} messages</div>
                    </div>
                    <div className="flex gap-2">{/* Header actions if needed */}</div>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 scrollbar-thin overflow-y-auto py-6 px-4 space-y-6 bg-white">
                    {messagesLoading && (
                      <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    )}

                    {!messagesLoading && (
                      <>
                        {!messages || messages.length <= 3 || messagesExpanded ? (
                          messages?.map((msg: MessageItem) => <MessageBlock key={msg.id} msg={msg} />)
                        ) : (
                          <>
                            {/* First Message */}
                            {messages.length > 0 && <MessageBlock msg={messages[0]} />}

                            {/* Divider / Expander */}
                            <div
                              className="relative py-2 flex items-center justify-start pl-4 cursor-pointer group"
                              onClick={() => setMessagesExpanded(true)}
                            >
                              <div className="absolute w-full top-1/2 left-0 h-px bg-stone-100 group-hover:bg-stone-200 transition-colors" />
                              <div className="absolute group w-full top-1/2 transform -translate-y-[5px] left-0 h-px bg-stone-100 group-hover:bg-stone-200 transition-colors" />
                              <div className="relative z-10 w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-sm font-medium text-gray-500 group-hover:border-gray-300 group-hover:text-gray-700 hover:bg-stone-100 transition-all shadow-sm">
                                <span className="group-hover:hidden">{messages.length - 3}</span>
                                <ChevronsUpDown className="group-hover:block hidden" />
                              </div>
                            </div>

                            {/* Last Two Messages */}
                            {messages.slice(-2).map((msg: MessageItem) => (
                              <MessageBlock key={msg.id} msg={msg} />
                            ))}
                          </>
                        )}
                      </>
                    )}
                    <div ref={scrollRef} />
                  </div>

                  {/* Reply Area */}
                  {!isFullScreen || isReplyVisible ? (
                    <div
                      className={`p-4 border-t flex flex-col overflow-hidden border-gray-100 bg-white ${isFullScreen ? 'fixed bottom-4 right-8 w-[600px] h-[400px] z-50 shadow-2xl rounded-xl border border-gray-200 animate-in slide-in-from-bottom-5' : ''}`}
                    >
                      {isFullScreen && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Reply</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-gray-600"
                            onClick={() => setIsReplyVisible(false)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      <div
                        className={`flex border-box gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-black/5 transition-all ${isFullScreen ? 'h-full' : ''}`}
                      >
                        <Textarea
                          value={replyBody}
                          onChange={e => setReplyBody(e.target.value)}
                          placeholder="Write a reply..."
                          className={`min-h-[60px] focus:ring-offset-0 focus:ring-0 focus:border-none  focus:outline-none  border-0 focus-visible:ring-0 resize-none bg-transparent p-2 text-sm ${isFullScreen ? 'h-full' : 'max-h-[200px]'}`}
                        />
                        <div className={`flex flex-col justify-center pb-1 pr-1 gap-2 ${isFullScreen ? 'self-end' : ''}`}>
                          <Button
                            size="icon"
                            className="h-8 w-8 rounded-full bg-black hover:bg-gray-800 transition-all shadow-sm"
                            onClick={handleSendReply}
                            disabled={isSending || !replyBody.trim()}
                          >
                            {isSending ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute bottom-6 right-8">
                      <Button
                        size="lg"
                        className="rounded-full shadow-lg bg-black text-white px-6 py-6 font-medium flex items-center gap-2 hover:bg-gray-800 hover:scale-105 transition-all"
                        onClick={() => setIsReplyVisible(true)}
                      >
                        <ReplyIcon className="w-5 h-5" />
                        Reply
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unlink Confirmation Dialog */}
      <Dialog open={unlinkDialog.open} onOpenChange={(open) => setUnlinkDialog({ open, threadId: open ? unlinkDialog.threadId : null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove from Project</DialogTitle>
            <DialogDescription>
              This will remove the email thread from this project. The thread will still be available in your inbox and other linked projects.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setUnlinkDialog({ open: false, threadId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnlinkThread} disabled={isUnlinking}>
              {isUnlinking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
