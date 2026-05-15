import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
// import AddProductModal from '../product/AddProductModal';
import { MessageSquareMore, Send, Trash2, User as UserIcon, ArrowUpDown, Pencil, X, Check, Loader2, ArrowDownUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteData, patchData, postData } from '@/lib/Api';
import useUser from '@/hooks/useUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { DeleteDialog } from '../DeleteDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface User {
    id: number;
    email: string;
    name: string;
    studio: {
        id: number;
        name: string;
    };
    phone_number?: string;
}

interface Comment {
    id: number;
    user: User | number; // API response might return ID, but item prop has object. We handle both.
    text: string;
    created_at: string;
    updated_at?: string;
    studio?: number;
}

interface ProcurementItem {
    id: number;
    comments: Comment[];
    [key: string]: any;
}

export const ProcurementComment = ({ open, onOpenChange, item }: { open: boolean, onOpenChange: (open: boolean) => void, item?: ProcurementItem | any }) => {
    const { user, isLoading: isUserLoading } = useUser();
    const [commentsList, setCommentsList] = useState<Comment[]>([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const queryClient = useQueryClient();


    // Edit state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');

    // Delete state
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    const sortData = (data: Comment[], order: 'newest' | 'oldest') => {
        return [...data].sort((a, b) => {
            const timeA = new Date(a.created_at).getTime();
            const timeB = new Date(b.created_at).getTime();
            return order === 'newest' ? timeB - timeA : timeA - timeB;
        });
    };

    useEffect(() => {
        if (item?.comments) {
            setCommentsList(sortData(item.comments, sortOrder));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item]);

    const handleSortChange = (value: string) => {
        const order = value as 'newest' | 'oldest';
        setSortOrder(order);
        setCommentsList(prev => sortData(prev, order));
    };

    // Mutation to create a comment
    const createCommentMutation = useMutation({
        mutationFn: async (text: string) => {
            if (!user) throw new Error("User not found");
            return postData({
                url: '/comment/comments/',
                data: {
                    text,
                    user: user.id,
                    studio: user.studio?.id
                }
            });
        },
        onSuccess: (newComment) => {
            linkCommentMutation.mutate(newComment);
        },
        onError: (error) => {
            console.error("Failed to post comment:", error);
        }
    });

    // Mutation to link comment to procurement
    const linkCommentMutation = useMutation({
        mutationFn: async (newComment: any) => {
            // We fetch the latest list before linking to ensure we have up-to-date IDs? 
            // Ideally we rely on local state or parent refresh, but here we just append.
            const currentIds = commentsList.map(c => c.id);
            const payload = {
                comments: [...currentIds, newComment.id]
            };
            await patchData({
                url: `/projects/procurements/${item.id}/`,
                data: payload
            });
            return newComment;
        },
        onSuccess: (newComment) => {
            const displayComment: Comment = {
                ...newComment,
                user: user as User,
            };
            // Updating list respecting sort order
            setCommentsList(prev => {
                const updated = [displayComment, ...prev];
                return sortData(updated, sortOrder);
            });
            setNewCommentText('');
            queryClient.refetchQueries({
                queryKey: [`projects/project-procurements/?project_id=${item.project}`],
            });
        },
        onError: (error) => {
            console.error("Failed to link comment:", error);
        }
    });

    // Mutation to update a comment
    const updateCommentMutation = useMutation({
        mutationFn: async ({ id, text }: { id: number, text: string }) => {
            return patchData({
                url: `/comment/comments/${id}/`,
                data: { text }
            });
        },
        onSuccess: (data, variables) => {
            setCommentsList(prev => prev.map(c => c.id === variables.id ? { ...c, text: variables.text } : c));
            setEditingId(null);
            setEditText('');
            queryClient.refetchQueries({
                queryKey: [`projects/project-procurements/?project_id=${item.project}`],
            });
        },
        onError: (error) => {
            console.error("Failed to update comment:", error);
        }
    });

    // Mutation to delete a comment
    const deleteCommentMutation = useMutation({
        mutationFn: async (commentId: number) => {
            return deleteData({
                url: `/comment/comments/${commentId}/`
            });
        },
        onSuccess: (_, commentId) => {
            setCommentsList(prev => prev.filter(c => c.id !== commentId));
            queryClient.refetchQueries({
                queryKey: [`projects/project-procurements/?project_id=${item.project}`],
            });
        },
        onError: (error) => {
            console.error("Failed to delete comment:", error);
        }
    });

    const handlePost = () => {
        if (!newCommentText.trim()) return;
        createCommentMutation.mutate(newCommentText);
    };

    const handleEditStart = (comment: Comment) => {
        setEditingId(comment.id);
        setEditText(comment.text);
    };

    const handleEditSave = () => {
        if (editingId && editText.trim()) {
            updateCommentMutation.mutate({ id: editingId, text: editText });
        }
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditText('');
    };

    // Helper to get initials
    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    // Helper to render user name safely
    const getUserName = (u: User | number | any) => {
        if (typeof u === 'object' && u?.name) return u.name;
        return "Unknown User";
    };

    return (
        <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-full w-full max-w-[600px] px-8 bg-white rounded-none ml-auto border-l shadow-2xl pt-5">
                <div className="mx-auto flex flex-col h-full w-full relative">
                    <div className="absolute -top-5 -left-5">
                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="-ml-2 h-8 w-8 text-gray-500 hover:text-black">
                            <X size={40} />
                        </Button>
                    </div>
                    {/* Content */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-white">

                        {/* List */}
                        <div className="flex item-center justify-between mb-4">
                            <p className="text-xs flex gap-2 items-center ">
                                <span className='font-semibold text-base'>Comments</span>
                                <span className='bg-black text-[10px] rounded-lg px-3 inline-block py-[2px] text-white'>{commentsList.length}</span>
                            </p>
                            <div className="flex items-center">
                                <span className="text-xs text-muted-foreground"><ArrowDownUp size={16} /></span>
                                <Select value={sortOrder} onValueChange={handleSortChange}>
                                    <SelectTrigger className="w-[120px] hover:bg-transparent h-8 text-xs border-transparent transition-colors focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder="Sort" />
                                    </SelectTrigger>
                                    <SelectContent align="end">
                                        <SelectItem value="newest">Most recent</SelectItem>
                                        <SelectItem value="oldest">Oldest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <ScrollArea className="flex-1 mt-4">
                            <div className="py-6 space-y-6">
                                {commentsList.map((comment) => (
                                    <div key={comment.id} className="group flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <Avatar className="h-9 w-9 border border-gray-00">
                                            <AvatarImage src="" />
                                            <AvatarFallback className="bg-stone-100 text-xs font-medium text-gray-600">{getInitials(getUserName(comment.user))}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1 w-full min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900 text-sm">{getUserName(comment.user)}</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                {/* Actions */}
                                                {(typeof comment.user === 'object' && comment.user.id === user?.id) && !editingId && (
                                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 text-gray-300 hover:text-black transition-all"
                                                            onClick={() => handleEditStart(comment)}
                                                        >
                                                            <Pencil size={12} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 text-gray-300 hover:text-black transition-all"
                                                            onClick={() => setDeleteTarget(comment.id)}
                                                        >
                                                            <Trash2 size={12} />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Comment Text or Edit Mode */}
                                            {editingId === comment.id ? (
                                                <div className="mt-2 text-right">
                                                    <Textarea
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        className="min-h-[80px] focus-visible:ring-offset-0 w-full resize-none  bg-transparent focus-visible:ring-0 placeholder:text-gray-400 text-gray-700"
                                                    />
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <Button variant="ghost" size="sm" onClick={handleEditCancel} className="h-8 text-xs">
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={handleEditSave}
                                                            className="h-8 text-xs  text-white"
                                                            disabled={updateCommentMutation.isPending || !editText.trim()}
                                                        >
                                                            {updateCommentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">
                                                    {comment.text}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {commentsList.length === 0 && (
                                    <div className="text-center py-10 text-gray-400 text-sm">
                                        No comments yet. Be the first to add one!
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        {/* Input Area */}
                        <div className="py-6 bg-white border-t mt-auto">
                            <div className="bg-stone-50 rounded-xl p-4 border border-gray-100  focus-within:border-black transition-all">
                                <Textarea
                                    placeholder="Add a comment..."
                                    className="min-h-[80px] focus-visible:ring-offset-0 w-full resize-none border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-gray-400 text-gray-700"
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                />
                                <div className="flex justify-end items-center mt-3 pt-3">

                                    <Button
                                        onClick={handlePost}
                                        disabled={createCommentMutation.isPending || linkCommentMutation.isPending || !newCommentText.trim()}
                                        className=" text-white px-6"
                                    >
                                        {(createCommentMutation.isPending || linkCommentMutation.isPending) ? 'Posting...' : 'Submit'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DrawerFooter className="bg-white border-t p-0 hidden">
                    </DrawerFooter>
                </div>
            </DrawerContent>

            <DeleteDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={(id: any) => deleteCommentMutation.mutateAsync(id)}
                id={deleteTarget}
                title="Delete Comment"
                description="Are you sure you want to delete this comment? This action cannot be undone."
                confirmText="Delete"
            />
        </Drawer>
    );
};