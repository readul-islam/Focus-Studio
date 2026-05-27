'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { sanitizeEmailHtml } from '@/lib/sanitize-html';
import { HomeNav } from '@/components/home-nav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Search,
  Loader2,
  Mail,
  Reply as ReplyIcon,
  MoreHorizontal,
  X,
  Maximize2,
  Minimize2,
  ChevronsUpDown,
  ArrowLeft,
  FolderPlus,
  AlertCircle,
} from 'lucide-react';
import GmailIntegration from '@/components/settings/GmailIntegration';
import { gooeyToast as toast } from 'goey-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { usePost } from '@/hooks/usePost';
import useFetch from '@/hooks/useFetch';
import { getApiErrorMessage } from '@/lib/api-error';
import useUser from '@/hooks/useUser';
import { messageIsSentByUser, resolveReplyToEmail } from '@/lib/gmail-reply';
import { EmailAttachments, type EmailAttachmentMeta } from '@/components/inbox/EmailAttachments';
import { postFormData } from '@/lib/Api';
import { htmlHasContent } from '@/lib/html-content';
import { sanitizeComposeHtml } from '@/lib/sanitize-html';
import { EMAIL_BODY_PROSE_CLASS } from '@/lib/email-body-styles';
import { InboxReplyComposer } from '@/components/inbox/InboxReplyComposer';
import { markGmailThreadRead } from '@/lib/gmail-inbox';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";


// extend once in your app (e.g., in _app.tsx or a utils/date.ts file)
dayjs.extend(relativeTime);

type ThreadItem = {
  thread_id: string;
  subject: string;
  snippet: string;
  sender: string;
  received_at: string;
  is_read?: boolean;
  project: string;
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
};

export function extractLatestEmail(html: string) {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove quoted Gmail threads
  doc.querySelectorAll(".gmail_quote, blockquote").forEach(el => el.remove());

  return doc.body.innerHTML;
}

export function splitGmailEmail(html: string) {
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

const MessageBlock = ({ msg, userEmail }: { msg: MessageItem; userEmail?: string | null }) => {
  const [expanded, setExpanded] = useState(false);
  const { main, quoted } = useMemo(() => splitGmailEmail(msg.body), [msg.body]);
  const sentByMe = messageIsSentByUser(msg.sender, userEmail);
  const senderLabel =
    msg.sender_label ||
    (sentByMe ? 'You' : msg.sender?.split('<')[0]?.trim().replace(/^["']|["']$/g, '') || 'Unknown');

  return (
    <div className={`flex gap-4 `}>
      <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
        <AvatarFallback className={sentByMe ? 'bg-black text-white' : 'bg-stone-200'}>
          {senderLabel.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col max-w-[99%]`}>
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-xs font-medium text-gray-900">
            {senderLabel}
          </span>
          <span className="text-xs text-gray-500">
            {dayjs(msg.received_at).format('MMM D, h:mm A')}
          </span>
        </div>

        <div className={`rounded-2xl p-4 text-sm w-full ${sentByMe
          ? 'bg-stone-50 text-gray-900 rounded-tr-sm'
          : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm'
          }`}>
          {/* Main Content */}
          <div
            className={EMAIL_BODY_PROSE_CLASS}
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

          {msg.attachments && msg.attachments.length > 0 && (
            <EmailAttachments emailId={msg.id} attachments={msg.attachments} />
          )}
        </div>
      </div>
    </div>
  );
};



export default function InboxPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [projectOpen, setProjectOpen] = useState(false);
  const { mutate: fetchGmail } = usePost();
  // Fetch Threads List
  const { data: threads, isLoading: threadsLoading, refetch: refetchThreads, error: threadsError } = useFetch('gmail/threads/');
  const { data: integrationStatus, isLoading: integrationStatusLoading } = useFetch('user/integration-status/');

  // Fetch Thread Details
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useFetch(
    selectedThreadId ? `gmail/thread/${selectedThreadId}/` : null,
    { enabled: !!selectedThreadId }
  );

  const { data: projects, isLoading: projectsLoading } = useFetch('projects/user-projects/');
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const filteredProjects = useMemo(() => {
    if (!projects || !Array.isArray(projects)) return [];
    if (!projectSearch) return projects;
    return (projects as any[]).filter((p: any) => 
       p?.project_name?.toLowerCase().includes(projectSearch.toLowerCase()) || 
       p?.project_code?.toLowerCase().includes(projectSearch.toLowerCase())
    );
 }, [projects, projectSearch]);

 const handleAddToProject = () => {
   if (!selectedProjectId) return;
    fetchGmail({
      url: 'gmail/threads/link/',
      data: {
        thread_id: selectedThreadId,
        project_ids: [selectedProjectId],
      },
    },
    {
      onSuccess: () => {
        toast.success('Email added to project');
        setProjectOpen(false);
        setProjectSearch('');
        setSelectedProjectId(null);
      },
    }
  );
 }



  const [filter, setFilter] = useState("all");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isReplyVisible, setIsReplyVisible] = useState(false); // State to toggle reply section in full screen
  const [messagesExpanded, setMessagesExpanded] = useState(false);
  const [gmailDisconnected, setGmailDisconnected] = useState(false);
  const [fetchError , setFetchError] = useState(false);


  // Reset expansion when thread changes
  useEffect(() => {
    setMessagesExpanded(false);
  }, [selectedThreadId]);


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
        setFetchError(true)
        // setGmailDisconnected(true);
        // toast.error('Please connect your gmail account');
      }
    });
  }, [])

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Send Reply Mutation

  useEffect(() => {
    document.title = 'My Inbox | Focuspilot';
  }, []);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (messages?.length > 1 && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleThreadSelect = (threadId: string, isRead?: boolean) => {
    setSelectedThreadId(threadId);
    setReplyBody('');
    if (isRead === false) {
      markGmailThreadRead(threadId)
        .then(() => queryClient.invalidateQueries({ queryKey: ['gmail/threads/'] }))
        .catch(() => {});
    }
  };

  const handleSendReply = async (attachmentFiles: File[] = []) => {
    const bodyHtml = sanitizeComposeHtml(replyBody);
    if ((!htmlHasContent(bodyHtml) && !attachmentFiles.length) || !selectedThreadId || !messages?.length) return;

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
    attachmentFiles.forEach((f) => formData.append('attachments', f));

    setIsSending(true);
    try {
      await postFormData({ url: 'gmail/send/', data: formData });
      toast.success('Reply sent successfully');
      setReplyBody('');
      refetchMessages();
      refetchThreads();
    } catch (err: unknown) {
      toast.error(`Failed to send reply: ${getApiErrorMessage(err, 'Unknown error')}`);
    } finally {
      setIsSending(false);
    }
  };

  const threadList = useMemo(() => {
    if (Array.isArray(threads)) return threads as ThreadItem[];
    if (threads && typeof threads === 'object' && 'results' in threads) {
      return ((threads as { results?: ThreadItem[] }).results) ?? [];
    }
    return [];
  }, [threads]);

  // Filter threads based on search and read filter
  const filteredThreads = threadList.filter((t: ThreadItem) => {
    if (filter === 'unread' && t.is_read !== false) return false;
    const search = searchText.toLowerCase();
    if (!search) return true;
    return (
      (t.subject && t.subject.toLowerCase().includes(search)) ||
      (t.sender && t.sender.toLowerCase().includes(search)) ||
      (t.snippet && t.snippet.toLowerCase().includes(search)) ||
      (t.project && typeof t.project === 'string' && t.project.toLowerCase().includes(search)) ||
      ((t.project as any)?.name && (t.project as any).name.toLowerCase().includes(search))
    );
  });
  
  useEffect(()=>{
    if(fetchError && threadsError){
      setGmailDisconnected(true);
    }
  },[fetchError , threadsError])
  

  return (
    <div className="flex-1 bg-stone-50 p-4 lg:p-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col space-y-6">
        <div className={`grid grid-cols-1 lg:grid-cols-6 gap-6 h-full min-h-0 ${isFullScreen ? 'fixed h-screen w-screen inset-0 z-50 bg-stone-50 top-0 p-2' : ''}`}>
          {/* Left Column: Messages List */}
          <div className={`col-span-1 lg:col-span-2 flex flex-col h-full min-h-0 ${selectedThreadId ? 'hidden lg:flex' : 'flex'}`}>
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

            <div className="flex items-center w-full overflow-x-auto gap-1 bg-stone-100 border border-stone-200 rounded-lg p-1 scrollbar-thin">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-sm font-medium hover:text-gray-600 ${filter === "all" ? "text-white hover:text-white" : "text-gray-600"}`}
                style={filter === "all" ? { backgroundColor: "rgb(17, 24, 39)" } : {}}
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-sm font-medium hover:text-gray-600 ${filter === "unread" ? "text-white hover:text-white" : "text-gray-600"}`}
                style={filter === "unread" ? { backgroundColor: "rgb(17, 24, 39)" } : {}}
                onClick={() => setFilter("unread")}
              >
                Unread
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-sm font-medium hover:text-gray-600 ${filter === "mentions" ? "text-white hover:text-white" : "text-gray-600"}`}
                style={filter === "mentions" ? { backgroundColor: "rgb(17, 24, 39)" } : {}}
                onClick={() => setFilter("mentions")}
              >
                Mentions
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-sm font-medium hover:text-gray-600 ${filter === "system" ? "text-white hover:text-white" : "text-gray-600"}`}
                style={filter === "system" ? { backgroundColor: "rgb(17, 24, 39)" } : {}}
                onClick={() => setFilter("system")}
              >
                System
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-sm font-medium hover:text-gray-600 ${filter === "emails" ? "text-white hover:text-white" : "text-gray-600"}`}
                style={filter === "emails" ? { backgroundColor: "rgb(17, 24, 39)" } : {}}
                onClick={() => setFilter("emails")}
              >
                Emails
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-sm font-medium hover:text-gray-600 ${filter === "ai-notes" ? "text-white hover:text-white" : "text-gray-600"}`}
                style={filter === "ai-notes" ? { backgroundColor: "rgb(17, 24, 39)" } : {}}
                onClick={() => setFilter("ai-notes")}
              >
                AI Notes
              </Button>
            </div>

            <div className="bg-white border mt-5 border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
              {/* Gmail connect banner — shown when not connected */}
              {!integrationStatusLoading && !integrationStatus?.gmail_connected && (
                <div className="border-b border-stone-200 bg-stone-50 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="h-4 w-4 text-stone-400 flex-shrink-0" />
                    <span className="text-xs text-stone-600 truncate">Connect your Gmail to see emails here</span>
                  </div>
                  <GmailIntegration isLoading={integrationStatusLoading} isConnected={integrationStatus?.gmail_connected} compact />
                </div>
              )}

              <div className="p-4 border-b border-gray-100 flex-shrink-0">
                <h3 className="text-sm font-medium text-gray-900">Recent Messages</h3>
              </div>

              <div className="overflow-y-auto flex-1 p-0">
                {!gmailDisconnected && threadsLoading && (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                )}

                {filteredThreads.length === 0 && (
                  gmailDisconnected ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4">
                        <Mail className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Connect your Gmail</p>
                      <p className="text-xs text-gray-500">Connect your Gmail account to see your emails automatically categorised with AI summaries.</p>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm text-gray-500"></div>
                  )
                )}

                <div className="divide-y divide-gray-100">
                  {filteredThreads.map((thread: ThreadItem) => {
                    const isUnread = thread.is_read === false;
                    return (
                    <div
                      key={thread.thread_id}
                      onClick={() => handleThreadSelect(thread.thread_id, thread.is_read)}
                      className={`group flex items-start gap-4 p-4 hover:bg-stone-50 transition-colors cursor-pointer ${
                        selectedThreadId === thread.thread_id
                          ? 'bg-[#f3f4f6] hover:bg-blue-50'
                          : isUnread
                            ? 'bg-white'
                            : 'bg-stone-50/30'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2 pt-2 flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full ${isUnread ? 'bg-gray-900' : 'bg-transparent'}`} />
                      </div>
                      <div className="flex-shrink-0">
                        <Avatar className="w-10 h-10">
                          {/* Simple fallback based on sender name */}
                          <AvatarFallback className={`${selectedThreadId === thread.thread_id ? 'bg-stone-200 text-gray-700' : 'bg-stone-100 text-gray-600'}`}>
                            {thread.sender?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`font-medium truncate text-sm ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {thread.sender?.split('<')[0].trim()}
                          </span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {dayjs(thread.received_at).fromNow(true)}
                          </span>
                        </div>
                        <p className={`text-sm mb-1 line-clamp-1 ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                          {thread.subject || '(No Subject)'}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {thread.snippet}
                        </p>
                        {thread?.project && <div className='text-xs mt-3 text-gray-500'>
                          <p>Projects: <span className='text-black'>{thread?.project?.name}</span> </p>
                        </div>}
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Conversation View */}
          <div className={`col-span-1 lg:col-span-4 flex flex-col h-full min-h-0 ${!selectedThreadId ? 'hidden lg:flex' : 'flex'}`}>
            <div className='flex items-center justify-between mb-2 lg:mb-0'>
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
                {selectedThreadId && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-gray-600 border-gray-300 bg-white"
                    onClick={() => setProjectOpen(true)}
                  >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Add to project
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="text-gray-600 border-gray-300 bg-white w-9 h-9"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            {/* Email View */}
            <div className=' bg-white border border-gray-200 flex-1 min-h-0 mt-5 rounded-xl shadow-sm overflow-hidden flex flex-col'>
              {!selectedThreadId ? (
                gmailDisconnected ? (
                  <div className="h-full flex flex-col items-center justify-center px-6">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6">
                      <Mail className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect your Gmail</h3>
                    <p className="text-sm text-gray-500 text-center max-w-xs mb-6">
                      Connect your Gmail account to see emails automatically from your client and supplier from CRM.
                    </p>
                    {/* <div className="bg-white border border-gray-200 rounded-xl p-4 w-full max-w-lg space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-700">Action required emails highlighted</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-gray-700">Procurement emails automatically grouped</span>
                      </div>c
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 3l1.5 4.5H18l-3.5 2.5 1.5 4.5L12 12l-4 2.5 1.5-4.5L6 7.5h4.5L12 3z" />
                        </svg>
                        <span className="text-sm text-gray-700">AI summaries and suggested actions</span>
                      </div>
                    </div> */}
                    <Button
                      className="bg-black text-white hover:bg-gray-800 px-6"
                      onClick={() => window.location.href = '/settings/studio/integrations'}
                    >
                      Connect Gmail
                    </Button>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Mail className="w-12 h-12 mb-4 opacity-20" />
                    <p>Select a conversation to view details</p>
                  </div>
                )
              ) : (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-gray-100 bg-white flex-shrink-0 flex justify-between items-center">
                    <div className="max-w-[90%]">
                      <h2 className="text-lg font-semibold text-gray-900 truncate w-full">
                        {messages?.[0]?.subject || (filteredThreads.find(t => t.thread_id === selectedThreadId)?.subject) || 'Conversation'}
                      </h2>
                      <div className="text-xs text-gray-500 mt-1">
                        {messages?.length || 0} messages
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {/* Header actions if needed */}
                    </div>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 bg-white">
                    {messagesLoading && (
                      <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    )}

                    {!messagesLoading && (
                      <>
                        {(!messages || messages.length <= 3 || messagesExpanded) ? (
                            messages?.map((msg: MessageItem) => (
                              <MessageBlock key={msg.id} msg={msg} userEmail={user?.email} />
                            ))
                        ) : (
                          <>
                            {/* First Message */}
                            {messages.length > 0 && <MessageBlock msg={messages[0]} userEmail={user?.email} />}

                            {/* Divider / Expander */}
                            <div className="relative py-2 flex items-center justify-start pl-4 cursor-pointer group" onClick={() => setMessagesExpanded(true)}>
                                <div className="absolute w-full top-1/2 left-0 h-px bg-stone-100 group-hover:bg-stone-50 transition-colors" />
                                 <div className="absolute group w-full top-1/2 transform -translate-y-[5px] left-0 h-px bg-stone-100 group-hover:bg-stone-50 transition-colors" />
                                <div className="relative z-10 w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-sm font-medium text-gray-500 group-hover:border-gray-300 group-hover:text-gray-700 hover:bg-stone-100 transition-all shadow-sm">
                                  <span className='group-hover:hidden'>{messages.length - 3}</span>
                                  <ChevronsUpDown className='group-hover:block hidden' />
                                </div>
                            </div>

                            {/* Last Two Messages */}
                            {messages.slice(-2).map((msg: MessageItem) => (
                              <MessageBlock key={msg.id} msg={msg} userEmail={user?.email} />
                            ))}
                          </>
                        )}
                      </>
                    )}
                    <div ref={scrollRef} />
                  </div>

                  {/* Reply Area */}
                  {!isFullScreen || isReplyVisible ? (
                    <div className={`p-4 border-t flex flex-col overflow-hidden border-gray-100 bg-white ${isFullScreen ? 'fixed bottom-4 right-8 w-[600px] h-[400px] z-50 shadow-2xl rounded-xl border border-gray-200 animate-in slide-in-from-bottom-5' : ''}`}>
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
                      <InboxReplyComposer
                        replyBody={replyBody}
                        setReplyBody={setReplyBody}
                        onSend={handleSendReply}
                        isSending={isSending}
                        threadId={selectedThreadId}
                        subject={
                          (Array.isArray(messages) && messages.find((m) => m.subject)?.subject) ||
                          undefined
                        }
                      />
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

      {/* Share to Project Drawer - Placeholder for structure, hidden logic for now */}
      {/* Add directly to project Dialog */}
      {/* Add directly to project Dialog */}
      <Dialog open={projectOpen} onOpenChange={(open) => {
          setProjectOpen(open);
          if(!open) {
             setProjectSearch('');
             setSelectedProjectId(null);
          }
      }}>
        <DialogContent className="sm:max-w-md bg-white ">
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
             
             <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr">
                {projectsLoading ? (
                     <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-400 w-5 h-5"/></div>
                ) : filteredProjects.length > 0 ? (
                  filteredProjects.map((project: any) => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      className={`px-3 py-2 rounded-lg cursor-pointer border transition-all flex items-center justify-between group ${
                          selectedProjectId === project.id 
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
            <Button onClick={handleAddToProject} disabled={!selectedProjectId} className='bg-black text-white hover:bg-gray-800'>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
