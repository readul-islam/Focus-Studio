'use client';

import * as React from 'react';
import { PermissionGuard } from '@/components/PermissionGuard';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  FileText,
  ImageIcon,
  File,
  Folder,
  Search,
  MoreHorizontal,
  Download as ImageDownload,
  Eye,
  FolderOpen,
  ChevronDown,
  Edit2,
  LinkIcon,
  Loader2,
  SquareArrowOutUpRight,
  Copy,
  SortAsc,
  Upload,
  Send,
  Trash2,
  FolderInput,
  LayoutGrid,
  List,
  Check,
  ChevronRight,
  FileSpreadsheet,
  FileType,
  Presentation,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  Users,
  Share2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotesFeed } from '@/components/notes-feed';
import { NotesSidePanel } from '@/components/notes-side-panel';
import type { Note } from '@/components/notes-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gooeyToast as toast } from 'goey-toast';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
// import Download from "yet-another-react-lightbox/plugins/download";
import 'yet-another-react-lightbox/styles.css';
import { PDFViewer } from '@/components/PDFViewer';
import { createDocument, deleteDocument, updateDocument, moveDocuments, uploadNewVersion, type DocumentItem } from '@/services/documentService';
import useFetch from '@/hooks/useFetch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Upload as UploadIcon, FileUp, Link2 } from 'lucide-react';
import { formatDistanceToNow, set } from 'date-fns';

// NEW: import dialog component
import { SentToClientDialog } from '@/components/SentToClientDialog';
import { DeleteDialog } from '@/components/DeleteDialog';
import { MoveDocumentDialog } from '@/components/MoveDocumentDialog';
import { SelectContractorDialog } from '@/components/contractor';
import { useAdmin } from '@/hooks/useAdmin';
import { usePost } from '@/hooks/usePost';
import { useEditGuard } from '@/hooks/useEditGuard';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePermissions } from '@/hooks/usePermissions';
import useUser from '@/hooks/useUser';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FOLDER_NAME_LENGTH = 50;

// Derived from storage
type DerivedFolder = {
  id: string | number;
  name: string;
  fileCount: number;
  createdAt?: string;
  lastModified?: string;
  isFolder?: boolean;
  url?: string;
  type?: string;
  metadata?: any;
  item_count?: number;
  client_access?: boolean | null;
};
type DerivedFile = {
  id: string | number;
  name: string;
  type: string;
  sizeBytes?: number;
  uploadedAt?: string;
  url?: string;
  lastModified?: string;
  client_access?: boolean | null;
};

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  // Images
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
    return <ImageIcon className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  }

  // PDFs
  if (ext === 'pdf') {
    return <FileText className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  }

  // Spreadsheets
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    return <FileSpreadsheet className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  }

  // Documents
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
    return <FileType className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  }

  // Presentations
  if (['ppt', 'pptx', 'odp'].includes(ext)) {
    return <Presentation className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  }

  // CAD files
  if (['dwg', 'dxf', 'skp', 'step', 'stp'].includes(ext)) {
    return <File className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  }

  // Videos
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)) {
    return <FileVideo className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  }

  // Audio
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(ext)) {
    return <FileAudio className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  }

  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'php', 'rb'].includes(ext)) {
    return <FileCode className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  }

  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return <FileArchive className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  }

  // Default
  return <File className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
}

function ProjectDocsPageContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shareWithContractor = searchParams.get('shareWith');
  const contractorName = searchParams.get('contractorName');
  const [activePane, setActivePane] = React.useState<'notes' | 'files'>('files');
  const [sideOpen, setSideOpen] = React.useState(false);
  const [selectedNote, setSelectedNote] = React.useState<Note | undefined>(undefined);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [uploadModal, setUploadModal] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState('');
  const [fileQueue, setFileQueue] = React.useState<File[]>([]);
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [currentDoc, setCurrentDoc] = React.useState<any>(null);
  const [renameModalOpen, setRenameModalOpen] = React.useState(false);
  const [selectedDoc, setSelectedDoc] = React.useState<any>(null);
  const [updatedFolderName, setUpdatedFolderName] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const {can} = usePermissions();
  const docsPermission = can('documents.edit')
  const docsDeletePermission = can('documents.delete')
  
  // TODO - Remove this after 
  const { user} = useUser()
  const adminEmail = ['roxi.zeeman@souqdesign.co.uk','claire@souqdesign.co.uk']

  // NEW: state to manage send-to-client dialog
  const [sentDialogOpen, setSentDialogOpen] = React.useState(false);
  const [selectedForSend, setSelectedForSend] = React.useState<any>(null);
  const [updatedFileName, setUpdatedFileName] = React.useState('');
  const [fileRenameModalOpen, setFileRenameModalOpen] = React.useState(false);
  const [linkModalOpen, setLinkModalOpen] = React.useState(false);
  const [link, setLink] = React.useState('');
  const [linkName, setLinkName] = React.useState('');
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string | number;
    name: string;
    isFolder: boolean;
  } | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [galleryImages, setGalleryImages] = React.useState<any[]>([]);
  const [pdfLightboxOpen, setPdfLightboxOpen] = React.useState(false);
  const [currentPdfIndex, setCurrentPdfIndex] = React.useState(0);
  const [galleryPdfs, setGalleryPdfs] = React.useState<any[]>([]);
  const [renamingIndex, setRenamingIndex] = React.useState(-1);
  const [newFileName, setNewFileName] = React.useState('');
  const [sortBy, setSortBy] = React.useState('date-desc');
  const [clientAccessFilter, setClientAccessFilter] = React.useState<'all' | 'shared' | 'not-shared'>('all');
  const [error, setError] = React.useState<string | null>(null);
  const [newFolderError, setNewFolderError] = React.useState('');
  const [renameFolderError, setRenameFolderError] = React.useState('');
  const [linkError, setLinkError] = React.useState('');
  const [renameFileError, setRenameFileError] = React.useState('');
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const [dragTargetId, setDragTargetId] = React.useState<string | number | null>(null);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>(() => {
  const view = searchParams.get('view');

  if (view === 'list' || view === 'grid') return view;

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('docs-view-mode');
    if (stored === 'list' || stored === 'grid') return stored;
  }

  return 'grid';
});
  const [checkedItems, setCheckedItems] = React.useState<any[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = React.useState<number>(-1);
  const [isSharingDocuments, setIsSharingDocuments] = React.useState(false);

  const queryClient = useQueryClient()

  // Save view mode to localStorage
  React.useEffect(() => {
    localStorage.setItem('docs-view-mode', viewMode);
  }, [viewMode]);

  // Move dialog state
  const [moveDialogOpen, setMoveDialogOpen] = React.useState(false);
  const [selectedForMove, setSelectedForMove] = React.useState<{
    ids: (string | number)[];
    names: string[];
    isFolder: boolean;
  } | null>(null);

  // Contractor share dialog state
  const [contractorDialogOpen, setContractorDialogOpen] = React.useState(false);
  const [selectedDocForContractor, setSelectedDocForContractor] = React.useState<{
    id: string | number;
    name: string;
  } | null>(null);

  // Update document modal state
  const [updateDocModalOpen, setUpdateDocModalOpen] = React.useState(false);
  const [selectedDocForUpdate, setSelectedDocForUpdate] = React.useState<{
    id: string | number;
    name: string;
  } | null>(null);
  const [updateFile, setUpdateFile] = React.useState<File | null>(null);

  // Fetch root documents using useFetch
  const {
    data: filesResp,
    isLoading,
    refetch,
  } = useFetch(`documents/documents/root_documents/?project_id=${params.id}`, {
    enabled: !!params.id,
  });

  const { mutate: sendToClient } = usePost();

  const allItems = React.useMemo(() => {
    const list = filesResp || [];
    return list.map((item: any) => ({ ...item, isFolder: item.type === 'FOLDER' }));
  }, [filesResp]);

  const derivedFolders = React.useMemo<DerivedFolder[]>(() => {
    return allItems
      .filter((d: any) => d.isFolder)
      .map((f: any) => ({
        id: f.id,
        name: f.name,
        fileCount: 0,
        createdAt: f.created_at,
        lastModified: f.updated_at,
        isFolder: f.isFolder,
        item_count: f?.item_count,
        client_access: f.client_access,
      }));
  }, [allItems]);

  const derivedFiles = React.useMemo<DerivedFile[]>(() => {
    return allItems
      .filter((d: any) => !d.isFolder && d.type !== 'LINK')
      .map((f: any) => ({
        id: f.id,
        name: f.name,
        fileCount: 0,
        createdAt: f.created_at,
        lastModified: f.updated_at,
        metadata: { mimetype: f.type === 'FILE' ? 'application/octet-stream' : 'application/link' },
        url: f.file || f.link_url,
        type: f.type,
        client_access: f.client_access,
      }));
  }, [allItems]);

  const driveRecentFiles = React.useMemo<DerivedFile[]>(() => {
    if (!allItems || allItems.length === 0) return []; // ⬅️ return blank

    const filesOnly = allItems.filter((d: any) => !d.isFolder);
    return filesOnly.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);
  }, [allItems]);

  const RenameOpenModal = (doc: any) => {
    setSelectedDoc(doc);
    setRenameModalOpen(true);
  };
  function RenameCloseModal() {
    setRenameModalOpen(false);
    setUpdatedFolderName('');
    setRenameFolderError('');
  }

  // Mutations
  const createFolderMutation = useMutation({
    mutationFn: (vars: any) => createDocument({ name: vars.folderName, type: 'FOLDER', project: params.id, parent: null }),
    onSuccess: () => {
      setModalOpen(false);
      setNewFolderName('');
      refetch();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (vars: any) =>
      createDocument({
        name: vars.name,
        type: 'FILE',
        file: vars.file,
        project: params.id,
        parent: null,
        signal: vars.signal,
      }),
    onSuccess: () => {
      setFileQueue([]);
      setUploadModal(false);
      refetch();
      setUploading(false);
    },
    onError: (e: any) => {
      setUploading(false);
    },
  });

  // Update document mutation
  const updateDocMutation = useMutation({
    mutationFn: (vars: { document_id: string | number; file: File }) =>
      uploadNewVersion({
        document_id: vars.document_id,
        file: vars.file,
      }),
    onSuccess: () => {
      setUpdateDocModalOpen(false);
      setSelectedDocForUpdate(null);
      setUpdateFile(null);
      refetch();
    },
  });

  const handleUploadModalClose = () => {
    if (uploading && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUploadModal(false);
    setFileQueue([]);
    setError(null);
    setRenamingIndex(-1);
  };

  const handleStartRenaming = (index: number, file: any) => {
    setRenamingIndex(index);
    const currentName = file.customName || file.name;
    const lastDot = currentName.lastIndexOf('.');
    const baseName = lastDot > 0 ? currentName.substring(0, lastDot) : currentName;
    setNewFileName(baseName);
  };

  const handleSaveRename = (index: number) => {
    const singleFile = fileQueue[index] as any;
    const currentName = singleFile.customName || singleFile.name;
    const lastDot = currentName?.lastIndexOf('.');
    const extension = lastDot > 0 ? currentName.substring(lastDot) : '';
    const renamedFile = Object.assign(singleFile, {
      customName: newFileName + extension,
    });
    const updatedFiles = [...fileQueue];
    updatedFiles[index] = renamedFile;
    setFileQueue(updatedFiles);
    setRenamingIndex(-1);
  };

  // Folder Rename Function
  const renameFolderMutation = useMutation({
    mutationFn: (vars: any) => updateDocument(vars.id, { name: vars.newFolderName }),
    onSuccess: () => {
      refetch();
      setRenameModalOpen(false);
    },
  });

  // File delete Function
  const deleteMutation = useMutation({
    mutationFn: (vars: any) => deleteDocument(vars.id),
    onSuccess: () => {
      refetch();
    },
  });

  // Move documents mutation
const moveMutation = useMutation({
  mutationFn: (vars: { document_ids: number[]; parent_id: number | null }) =>
    moveDocuments(vars),

  onSuccess: (data, variables) => {
    const { parent_id } = variables
    setMoveDialogOpen(false);
    setSelectedForMove(null);
    setCheckedItems([])
    refetch()
    queryClient.refetchQueries({
      queryKey: [`documents/documents/${parent_id}/folder_content/`],
    });
  },
});

  function LinkOpenModal() {
    setLinkModalOpen(true);
  }

  function LinkAfterCloseModal() {
    setModalOpen(false);
  }

  function LinkCloseModal() {
    setLinkModalOpen(false);
    setLinkError('');
  }



  function downloadFile(url: string, fileName: string) {
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error('Network response was not ok');
        return r.blob();
      })
      .then(blob => {
        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(objectUrl);
      })
      .catch(() => toast.error('Download failed'));
  }

  const handleLightboxDownload = async () => {
    const slide = galleryImages[currentImageIndex];
    const imageUrl = slide?.src;
    const filename = slide?.download?.filename || slide?.title || `image-${currentImageIndex + 1}.jpg`;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, '_blank');
      toast.info('Right-click the image and select "Save Image As" to download');
    }
  };

  const handlePdfLightboxDownload = async () => {
    const slide = galleryPdfs[currentPdfIndex];
    const pdfUrl = slide?.src;
    const filename = slide?.download?.filename || slide?.title || `document-${currentPdfIndex + 1}.pdf`;

    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(pdfUrl, '_blank');
      toast.info('Opening PDF in new tab');
    }
  };

  function openViewer(url: string, name: string) {
    // Check if file is an image
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const pdfExtensions = ['pdf'];
    const extension = name.split('.').pop()?.toLowerCase() || '';

    if (imageExtensions.includes(extension)) {
      // Open in lightbox gallery — use filteredFiles so order matches the grid
      const allImageFiles = filteredFiles.filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        return imageExtensions.includes(ext);
      });
      const images = allImageFiles.map(file => ({
        src: file.url || '',
        alt: file.name,
        title: file.name,
        download: {
          url: file.url,
          filename: file.name,
        },
      }));

      const startIndex = allImageFiles.findIndex(file => file.url === url);

      setGalleryImages(images);
      setCurrentImageIndex(startIndex >= 0 ? startIndex : 0);
      setLightboxOpen(true);
    } else if (pdfExtensions.includes(extension)) {
      // Open PDFs in lightbox gallery — use filteredFiles so order matches the grid
      const allPdfFiles = filteredFiles.filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        return pdfExtensions.includes(ext);
      });
      const pdfs = allPdfFiles.map(file => ({
        src: file.url || '',
        alt: file.name,
        title: file.name,
        download: {
          url: file.url,
          filename: file.name,
        },
      }));

      const startIndex = allPdfFiles.findIndex(file => file.url === url);

      setGalleryPdfs(pdfs);
      setCurrentPdfIndex(startIndex >= 0 ? startIndex : 0);
      setPdfLightboxOpen(true);
    } else {
      // Open in DocViewer for other documents
      setCurrentDoc([{ uri: url, fileName: name }]);
      setViewerOpen(true);
    }
  }

  function fileUrl(file: any) {
    return file.url || '';
  }

  function openNote(n: Note) {
    setSelectedNote(n);
    setSideOpen(true);
  }

  function RenameAfterCloseModal() {
    RenameCloseModal();
  }

  const { guard } = useEditGuard('documents.edit');

  // Rename Folder
  const handleRenameFolder = guard(() => {
    if (!updatedFolderName.trim()) return toast.error('Folder name cannot be empty');
    if (updatedFolderName.length > MAX_FOLDER_NAME_LENGTH) {
      return toast.error(`Folder name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
    }
    toast.promise(
      renameFolderMutation.mutateAsync({
        id: selectedDoc.id,
        newFolderName: updatedFolderName,
      }),
      { loading: 'Renaming...', success: 'Renamed successfully!', error: 'Failed to rename folder.' },
    );

    setUpdatedFolderName('');
  });

  // const { isAdmin } = useAdmin();
  
  const isAdmin = adminEmail.includes(user?.email)
  

  const HandleFolderOpen = (folder: any) => {
    const tempName = folder?.name?.toLowerCase();
    if (tempName === 'admin only' && !adminEmail.includes(user?.email)) {
      toast.error('You do not have permission to access this folder');
      return;
    }
    
    if(shareWithContractor){
      router.push(`/projects/${params.id}/docs/folders/${folder.id}?shareWith=${shareWithContractor}&contractorName=${contractorName}&view=list`);
    } else {
      router.push(`/projects/${params.id}/docs/folders/${folder.id}`);
    }
  };

  // Delete files or folders
  const handleDeleteTask = guard((id: string | number) => {
    toast.promise(
      deleteMutation.mutateAsync({ id }),
      { loading: 'Deleting...', success: 'Deleted successfully!', error: 'Failed to delete file.' },
    );
  });

  // No longer need useEffect for data processing - using useMemo instead

  const renameFileMutation = useMutation({
    mutationFn: (vars: any) => updateDocument(vars.id, { name: vars.newFileName }),
    onSuccess: () => {
      refetch();
      setFileRenameModalOpen(false);
    },
  });

  // Link Creation Function
  const linkMutation = useMutation({
    mutationFn: (vars: any) => createDocument({ name: vars.name, type: 'LINK', link_url: vars.link_url, project: params.id, parent: null }),
    onSuccess: () => {
      refetch();
      setLinkModalOpen(false);
      setLink('');
      setLinkName('');
      toast.success('Link added!');
    },
    onError: () => {
      toast.error('Failed to add link');
    },
  });

  // modify handleClick to accept optional message
  const handleClick = (item: any, message?: string) => {
    // Feature not available
    toast.info('Send to client not implemented in new API');
  };

  const FileRenameOpenModal = (doc: any) => {
    setSelectedDoc(doc);
    setUpdatedFileName(doc.name);
    setFileRenameModalOpen(true);
  };

  const FileRenameCloseModal = () => {
    setFileRenameModalOpen(false);
    setUpdatedFileName('');
  };

  const handleRenameFile = guard(() => {
    if (!selectedDoc) return;
    toast.promise(
      renameFileMutation.mutateAsync({
        id: selectedDoc.id,
        newFileName: updatedFileName,
      }),
      { loading: 'Renaming file...', success: 'File renamed successfully!', error: 'Failed to rename file.' },
    );
    setUpdatedFileName('');
  });

  const handleSubmitLink = guard(() => {
    if (!link.trim()) {
      toast.error('Link cannot be empty');
      return;
    }
    try {
      const url = new URL(link);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error();
      }
      const hostname = url.hostname.toLowerCase();
      const suspiciousDomains = ['example.com', 'test.com', 'localhost'];
      if (suspiciousDomains.some(domain => hostname.includes(domain))) {
        toast.error('This URL appears to be a test or example URL');
        return;
      }
      linkMutation.mutate({
        link_url: link,
        name: linkName,
      });
    } catch (error) {
      toast.error('Please enter a valid URL (starting with http:// or https://)');
    }
  });

  const filteredFolders = React.useMemo(() => {
    let list = [...derivedFolders];
    if (searchQuery.trim()) {
      list = list.filter(folder => folder.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Client access filter
    if (clientAccessFilter === 'shared') {
      list = list.filter(folder => folder.client_access === true);
    } else if (clientAccessFilter === 'not-shared') {
      list = list.filter(folder => folder.client_access !== true);
    }

    list.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-desc':
          return new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime();
        case 'date-asc':
          return new Date(a.createdAt || a.created_at).getTime() - new Date(b.createdAt || b.created_at).getTime();
        default:
          return 0;
      }
    });
    return list;
  }, [searchQuery, derivedFolders, sortBy, clientAccessFilter]);

  const filteredFiles = React.useMemo(() => {
    let list = [...derivedFiles];
    if (searchQuery.trim()) {
      list = list.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Client access filter
    if (clientAccessFilter === 'shared') {
      list = list.filter(file => file.client_access === true);
    } else if (clientAccessFilter === 'not-shared') {
      list = list.filter(file => file.client_access !== true);
    }

    list.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-desc':
          return new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime();
        case 'date-asc':
          return new Date(a.createdAt || a.created_at).getTime() - new Date(b.createdAt || b.created_at).getTime();
        default:
          return 0;
      }
    });
    return list;
  }, [searchQuery, derivedFiles, sortBy, clientAccessFilter]);

  const filterLinks = React.useMemo(() => {
    let list = allItems.filter((item: any) => item.type === 'LINK');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => item.name?.toLowerCase().includes(q) || item.url?.toLowerCase().includes(q));
    }

    // Client access filter
    if (clientAccessFilter === 'shared') {
      list = list.filter(item => item.client_access === true);
    } else if (clientAccessFilter === 'not-shared') {
      list = list.filter(item => item.client_access !== true);
    }

    list.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });
    return list;
  }, [searchQuery, allItems, sortBy, clientAccessFilter]);

  // Doc send to client

  const handleDocSendToClient = (id: string | number) => {
    if (!id) return;
    sendToClient(
      { url: `/documents/documents/${id}/update_client_access/`, data: { id: id } },
      {
        onSuccess: () => {
          toast.success('Document sent to client!');
          refetch()
        },
        onError: () => {
          toast.error('Failed to send document to client!');
        },
      },
    );
  };

  // Handle share to contractor
  const handleShareToContractor = (id: string | number, name: string) => {
    setSelectedDocForContractor({ id, name });
    setContractorDialogOpen(true);
  };

  // Handle contractor selected
  const handleContractorSelected = () => {
    // The API call is handled inside SelectContractorDialog
    // Just close the dialog and reset state
    setContractorDialogOpen(false);
    setSelectedDocForContractor(null);
    refetch(); // Refresh the documents list
  };

  // Handle update document
  const handleOpenUpdateModal = (doc: { id: string | number; name: string }) => {
    setSelectedDocForUpdate(doc);
    setUpdateFile(null);
    setUpdateDocModalOpen(true);
  };

  const handleUpdateDocument = () => {
    if (!selectedDocForUpdate || !updateFile) return;
    toast.promise(
      updateDocMutation.mutateAsync({
        document_id: selectedDocForUpdate.id,
        file: updateFile,
      }),
      { loading: 'Updating document...', success: 'Document updated successfully!', error: (e: any) => e?.message || 'Failed to update document' },
    );
  };

  // Format date for table view
  const formatDate = (input: string | Date) => {
    const date = typeof input === 'string' ? new Date(input) : input;
    return date?.toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Combine all items for table view
  const allFilteredItems = React.useMemo(() => {
    const items = [...filteredFolders.map((f: any) => ({ ...f, isFolder: true, type: 'FOLDER' })),
                   ...filteredFiles.map((f: any) => ({ ...f, isFolder: false })),
                   ...filterLinks.map((l: any) => ({ ...l, isFolder: false, type: 'LINK' }))];
    return items;
  }, [filteredFolders, filteredFiles, filterLinks]);

  // Get selectable items (non-folders)
  // const selectableItems = React.useMemo(() => {
  //   return allFilteredItems.filter(item => !item.isFolder);
  // }, [allFilteredItems]);

  // Check if all selectable items are checked
  const isAllSelected = React.useMemo(() => {
    if (allFilteredItems.length === 0) return false;
    return allFilteredItems.every(item => checkedItems.some(checked => checked.id === item.id));
  }, [allFilteredItems, checkedItems]);

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    
    if (checked) {
      const allSelectableWithUrls = allFilteredItems.map(item => ({
        ...item,
        url: item.url || (item as any).file,
      }));
      setCheckedItems(allSelectableWithUrls);
    } else {
      setCheckedItems([]);
    }
  };

  // Handle individual checkbox change
  const handleCheckboxChange = (e: any) => {
    const { value, checked } = e.target;
    setCheckedItems(prev => {
      if (checked) {
        const exists = prev.some(item => item.id === value.id);
        if (!exists) {
          return [...prev, { ...value, url: value.url || value.file }];
        }
        return prev;
      } else {
        return prev.filter(item => item.id !== value.id);
      }
    });
  };

  // Handle grid item click for multi-select
  const handleGridItemClick = (e: React.MouseEvent, item: any, currentIndex: number) => {
    const allItems = [...filteredFolders, ...filteredFiles];

    // Cmd/Ctrl + Click: Toggle single item
    if (e.metaKey || e.ctrlKey) {
      e.stopPropagation();
      const isSelected = checkedItems.some(checked => checked.id === item.id);
      if (isSelected) {
        setCheckedItems(prev => prev.filter(checked => checked.id !== item.id));
      } else {
        setCheckedItems(prev => [...prev, { ...item, url: item.url || item.file }]);
      }
      setLastSelectedIndex(currentIndex);
      return true; // Indicate selection was handled
    }

    // Shift + Click: Select range
    if (e.shiftKey && lastSelectedIndex !== -1) {
      e.stopPropagation();
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      const rangeItems = allItems.slice(start, end + 1).map(rangeItem => ({
        ...rangeItem,
        url: rangeItem.url || (rangeItem as any).file,
      }));

      // Merge with existing selections
      const newCheckedItems = [...checkedItems];
      rangeItems.forEach(rangeItem => {
        if (!newCheckedItems.some(checked => checked.id === rangeItem.id)) {
          newCheckedItems.push(rangeItem);
        }
      });
      setCheckedItems(newCheckedItems);
      return true; // Indicate selection was handled
    }

    // Regular click without modifiers
    setLastSelectedIndex(currentIndex);
    return false; // Let normal click behavior proceed
  };

  // Bulk send to client
  const { mutate: bulkSendToClient, isPending: isBulkSending } = usePost();

  const handleBulkSendToClient = () => {
    if (checkedItems.length === 0) return;
    const documentIds = checkedItems.map(item => item.id);
    bulkSendToClient(
      {
        url: `/documents/documents/bulk_update_client_access/`,
        data: { document_ids: documentIds, access: true }
      },
      {
        onSuccess: () => {
          toast.success(`${checkedItems.length} document${checkedItems.length > 1 ? 's' : ''} sent to client!`);
          setCheckedItems([]);
          refetch();
        },
        onError: () => {
          toast.error('Failed to send documents to client!');
        },
      },
    );
  };

  // Bulk share with contractor
  const { mutate: bulkShareDocuments } = usePost({
    onSuccess: () => {
      toast.success(`${checkedItems.length} document${checkedItems.length > 1 ? 's' : ''} shared with ${contractorName ? decodeURIComponent(contractorName) : 'contractor'}`);
      setCheckedItems([]);
      setIsSharingDocuments(false);
      queryClient.refetchQueries({
        queryKey: [`contractor_portal/project/${params.id}/contractors/`],
      });
      router.push(`/projects/${params.id}/contractors`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to share documents');
      setIsSharingDocuments(false);
    },
  });

  const handleBulkShareDocuments = () => {
    if (!shareWithContractor || checkedItems.length === 0) return;

    setIsSharingDocuments(true);
    bulkShareDocuments({
      url: 'contractor_portal/bulk-share-documents/',
      data: {
        contractor_id: parseInt(shareWithContractor),
        document_ids: checkedItems.map(item => item.id),
      },
    });
  };

  // Get file type for table display
  const getFileType = (name?: string) => {
    if (!name) return 'other';
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
    if (['doc', 'docx'].includes(ext)) return 'document';
    if (['dwg', 'dxf'].includes(ext)) return 'cad';
    return 'other';
  };

  return (
    <div className="">
      <div className="space-y-6">

             {/* Breadcrumbs and Back */}
                <div className="flex items-center justify-between py-0.5 ml-2">
                  <div className="flex items-center gap-3 text-sm">
                   <span>Files</span>
                   <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

        {/* Contractor Sharing Banner */}
        {shareWithContractor && contractorName && (
          <Card className="border-slatex-200 bg-white">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-slatex-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Sharing documents with {decodeURIComponent(contractorName)}</p>
                  <p className="text-xs text-neutral-500">Select documents below and click "Share Selected" to share with this contractor</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {checkedItems.length > 0 && (
                  <Button
                    size="sm"
                    className="h-8 bg-slatex-700 text-white hover:bg-slatex-800"
                    onClick={handleBulkShareDocuments}
                    disabled={isSharingDocuments}
                  >
                    {isSharingDocuments ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 mr-1.5" />
                        Share Selected ({checkedItems.length})
                      </>
                    )}
                  </Button>
                )}
                <Link href={`/projects/${params.id}/contractors`}>
                  <Button variant="outline" size="sm" className="h-8 bg-white">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Back to Contractors
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}


        {/* Actions Bar */}
        <div className="flex flex-col xl:flex-row items-center justify-center xl:justify-between gap-4 ">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative ">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
              {/* Search Input */}
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search files & notes…"
                className="w-72 pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4 text-gray-400" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Alphabet (A-Z)</SelectItem>
                <SelectItem value="name-desc">Alphabet (Z-A)</SelectItem>
                <SelectItem value="date-desc">Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={clientAccessFilter} onValueChange={(v: 'all' | 'shared' | 'not-shared') => setClientAccessFilter(v)}>
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-gray-400" />
                  <SelectValue placeholder="Client" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
                <SelectItem value="not-shared">Not Shared</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Toggle */}
            
            
            <div className="flex items-center border rounded-[10px] p-1 bg-white relative">
  {/* GRID BUTTON */}
  <button
    onClick={() => setViewMode('grid')}
    className="relative p-2 rounded-[8px] transition-colors"
    aria-label="Grid view"
  >
    {viewMode === 'grid' && (
      <motion.div
        layoutId="activeView"
        className="absolute inset-0 bg-stone-100 rounded-[8px]"
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    )}
    <LayoutGrid
      className={`w-4 h-4 relative z-10 ${
        viewMode === 'grid'
          ? 'text-neutral-900'
          : 'text-neutral-400 hover:text-neutral-600'
      }`}
    />
  </button>

  {/* LIST BUTTON */}
  <button
    onClick={() => setViewMode('list')}
    className="relative p-2 rounded-[8px] transition-colors"
    aria-label="List view"
  >
    {viewMode === 'list' && (
      <motion.div
        layoutId="activeView"
        className="absolute inset-0 bg-stone-100 rounded-[8px]"
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    )}
    <List
      className={`w-4 h-4 relative z-10 ${
        viewMode === 'list'
          ? 'text-neutral-900'
          : 'text-neutral-400 hover:text-neutral-600'
      }`}
    />
  </button>
</div>

           { docsPermission && <AnimatePresence mode="popLayout">
              {checkedItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex items-center gap-2"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="py-5"
                        variant="outline"
                        size="sm"
                        disabled={isBulkSending}
                      >
                        {isBulkSending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Share2 className="w-4 h-4 mr-2" />
                        )}
                        Share ({checkedItems.length})
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={handleBulkSendToClient}>
                        <Send className="w-4 h-4 mr-2" />
                        Send to Client
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedDocForContractor({ id: 'bulk', name: `${checkedItems.length} documents` });
                        setContractorDialogOpen(true);
                      }}>
                        <Users className="w-4 h-4 mr-2" />
                        Send to Contractor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    className="py-5"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedForMove({
                        ids: checkedItems.map(item => item.id),
                        names: checkedItems.map(item => item.name),
                        isFolder: false,
                      });
                      setMoveDialogOpen(true);
                    }}
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    Move ({checkedItems.length})
                  </Button>
                </motion.div>
              )}
            </AnimatePresence> }
            
               {checkedItems.length < 1 && docsPermission &&    <motion.div
                          layout
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 25,
                          }}
                        >
                          <Button className="py-5" variant="outline" size="sm" onClick={()=> setModalOpen(true)}>
                            <FolderOpen className="w-4 h-4 mr-2" />
                            New Folder
                          </Button>
                        </motion.div>}
        { docsPermission &&    <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
                  {'More'}
                  <ChevronDown className="ml-1 h-4 w-4 opacity-80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={LinkOpenModal}>{'Add Link'}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setUploadModal(true)}>{'Upload Files'}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> }
          </div>
        </div>

        {/* Folders Grid */}
        <div
          className={`main-upload-section bg-white relative overflow-hidden min-h-[300px] rounded-xl ${viewMode === 'list' ? 'p-0' : 'p-6 border'} transition-all duration-200 ${
            isDraggingOver ? '' : 'border-neutral-200 border-dashed'
          }`}
          onDragOver={e => {
            if (e.dataTransfer.types.includes('Files')) {
              e.preventDefault();
              e.stopPropagation();
              if (docsPermission) setIsDraggingOver(true);
            }
          }}
          onDragLeave={e => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingOver(false);
          }}
          onDrop={e => {
            if (e.dataTransfer.types.includes('Files')) {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingOver(false);

              if (!docsPermission) {
                toast.error("You don't have permission to perform this action.");
                return;
              }

              const files = Array.from(e.dataTransfer.files);
              const tooLarge = files.some(file => file.size > MAX_FILE_SIZE);

              if (tooLarge) {
                toast.error('Some files are larger than 50MB');
                return;
              }

              const processedFiles = files.map(file => {
                return Object.assign(file, {
                  preview: URL.createObjectURL(file),
                  originalName: file.name,
                });
              });

              setFileQueue(processedFiles);
              setUploadModal(true);
            }
          }}
        >
          <div className="absolute inset-0 z-10 pointer-events-none">
            {isDraggingOver && (
              <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center bg-white/50 backdrop-blur-[4px]">
                <div className="text-center">
                  <Upload className="w-14 h-14  mx-auto mb-2 animate-bounce" />
                  <p className="text-lg font-semibold">Drop files here to upload</p>
                  <p className="text-xs text-gray-600 mt-1">Any file larger than 50MB will be rejected</p>
                </div>
              </div>
            )}
          </div>
          {/* Empty state */}
          {!isLoading && filteredFolders.length === 0 && filteredFiles.length === 0 && filterLinks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-neutral-300">
              <FolderOpen className="w-12 h-12 text-neutral-300 mb-3" />
              <p className="text-sm text-neutral-500">{searchQuery ? `No results for "${searchQuery}", drop a file to upload` : 'No files attached, drop a file to upload'}</p>
            </div>
          )}

          {/* List View Loading Skeleton */}
          {viewMode === 'list' && isLoading && (
            <Card className="bg-white border rounded-xl shadow-sm overflow-hidden">
              <div className="relative overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <th scope="col" className="w-10 px-4 py-3"><Skeleton className="w-4 h-4" /></th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">File</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">Created</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">Modified</th>
                      <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-gray-600">Shared</th>
                      <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...Array(6)].map((_, i) => (
                      <tr key={i} className="hover:bg-stone-50">
                        <td className="px-4 py-3"><Skeleton className="w-4 h-4" /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-4 h-4 rounded" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-4 py-3 text-center"><Skeleton className="w-4 h-4 rounded-full mx-auto" /></td>
                        <td className="px-4 py-3 pr-6 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Skeleton className="w-8 h-8 rounded" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* List/Table View */}
          {viewMode === 'list' && !isLoading && allFilteredItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="relative overflow-x-auto">
                  <table className="min-w-full table-fixed">
                    <thead className="bg-white border-b border-gray-200">
                      <tr>
                        <th scope="col" className="w-10 px-4 py-3">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            disabled={allFilteredItems.length === 0}
                          />
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">File</th>
                        <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                        <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">Created</th>
                        <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">Modified</th>
                        <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-gray-600">Shared</th>
                        <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {/* Folders */}
                      {filteredFolders.map(folder => {
                        const isSelected = checkedItems.some(item => item.id === folder.id);
                        return (
                        <tr
                          key={folder.id}
                          onClick={() => HandleFolderOpen(folder)}
                          draggable={docsPermission}
                          onDragStart={e => {
                            if (!docsPermission) {
                              e.preventDefault();
                              toast.error("You don't have permission to perform this action.");
                              return;
                            }
                            e.dataTransfer.setData('documentid', String(folder.id));
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={e => {
                             if (e.dataTransfer.types.some(t => t.toLowerCase() === 'documentid')) {
                               e.preventDefault();
                               e.stopPropagation();
                               e.dataTransfer.dropEffect = 'move';
                               if (dragTargetId !== folder.id) setDragTargetId(folder.id);
                             }
                          }}
                          onDragEnter={e => {
                            if (e.dataTransfer.types.some(t => t.toLowerCase() === 'documentid')) {
                              setDragTargetId(folder.id);
                            }
                          }}
                          onDragLeave={() => {
                            setDragTargetId(null);
                          }}
                          onDrop={async e => {
                             setDragTargetId(null);
                             e.preventDefault();
                             e.stopPropagation();
                             if (!docsPermission) {
                               toast.error("You don't have permission to perform this action.");
                               return;
                             }
                             const draggedId = e.dataTransfer.getData('documentid');
                             if (draggedId && draggedId !== String(folder.id)) {
                               const idsToMove = checkedItems.some(item => String(item.id) === draggedId)
                                 ? checkedItems.map(item => Number(item.id))
                                 : [Number(draggedId)];

                               await toast.promise(
                                 moveMutation.mutateAsync({
                                   document_ids: idsToMove,
                                   parent_id: Number(folder.id),
                                 }),
                                 { loading: 'Moving...', success: 'Moved successfully!', error: 'Failed to move. Please try again.' },
                               );
                             }
                          }}
                          className={`hover:bg-stone-50 cursor-pointer transition-all duration-200 ${isSelected ? 'bg-[#efeae2]' : ''} ${dragTargetId === folder.id ? 'bg-neutral-900/10 ring-2 ring-inset ring-neutral-900/20 shadow-sm' : ''} ${folder?.name?.toLowerCase() === 'admin only' && !isAdmin ? 'hidden' : ''}`}
                        >
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={checked => handleCheckboxChange({ target: { value: folder, checked } })}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Tooltip delayDuration={2000} open={docsPermission ? false : undefined}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-3">
                                  <Folder className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{folder.name}</div>
                                     {folder.item_count !== undefined && folder.item_count > 0 && (
                                      <span className="text-xs text-gray-500">{folder.item_count} {folder.item_count > 1 ? 'items' : 'item'}</span>
                                    )}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top"><p>View Only</p></TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">Folder</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(folder.createdAt)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(folder.lastModified || folder.updated_at)}</td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            {folder.client_access === true ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center w-4 h-4 text-[10px] font-medium text-white bg-[#0f1729] rounded-full justify-center">
                                    <Check strokeWidth={3} className="w-2.5 h-2.5" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">Shared to client</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild><button>-</button></TooltipTrigger>
                                <TooltipContent side="top">Not shared</TooltipContent>
                              </Tooltip>
                            )}
                          </td>
                          <td className="px-4 py-3 pr-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={e => { e.stopPropagation(); HandleFolderOpen(folder); }}>
                                  <FolderOpen className="w-4 h-4 mr-2" />Open
                                </DropdownMenuItem>
                                {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); RenameOpenModal(folder); }}>
                                  <Edit2 className="w-4 h-4 mr-2" />Rename
                                </DropdownMenuItem>}
                               {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDocSendToClient(folder.id); }}>
                                  <Send className="w-4 h-4 mr-2" />Send to Client
                                </DropdownMenuItem>}
                              {docsPermission &&  <DropdownMenuItem onClick={e => { e.stopPropagation(); handleShareToContractor(folder.id, folder.name); }}>
                                  <Users className="w-4 h-4 mr-2" />Share to Contractor
                                </DropdownMenuItem>}
                                {docsPermission &&<DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedForMove({ ids: [folder.id], names: [folder.name], isFolder: true }); setMoveDialogOpen(true); }}>
                                  <FolderInput className="w-4 h-4 mr-2" />Move
                                </DropdownMenuItem>}
                               { docsDeletePermission && <DropdownMenuSeparator />}
                                {docsDeletePermission && <DropdownMenuItem className="text-red-500" onClick={e => { e.stopPropagation(); setDeleteTarget({ id: folder.id, name: folder.name, isFolder: true }); setIsDeleteOpen(true); }}>
                                  <Trash2 className="w-4 h-4 mr-2" />Delete
                                </DropdownMenuItem> }
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                      })}
                      {/* Files */}
                      {filteredFiles.map(file => {
                        const isSelected = checkedItems.some(item => item.id === file.id);
                        return (
                        <tr
                          key={file.id}
                          onClick={() => openViewer(file.url || '', file.name)}
                          draggable={docsPermission}
                          onDragStart={e => {
                            if (!docsPermission) {
                              e.preventDefault();
                              toast.error("You don't have permission to perform this action.");
                              return;
                            }
                            e.dataTransfer.setData('documentid', String(file.id));
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          className={`hover:bg-stone-50 cursor-pointer ${isSelected ? 'bg-[#efeae2]' : ''}`}
                        >
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <Checkbox
                              checked={!!checkedItems.find(item => item.id === file.id)}
                              onCheckedChange={checked => handleCheckboxChange({ target: { value: file, checked } })}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Tooltip delayDuration={2000} open={docsPermission ? false : undefined}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-3">
                                  {getFileIcon(file.name)}
                                  <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{file.name}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top"><p>View Only</p></TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize">{getFileType(file.name)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(file.createdAt || file.created_at)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(file.lastModified || file.updated_at)}</td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            {file.client_access === true ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center w-4 h-4 text-[10px] font-medium text-white bg-[#0f1729] rounded-full justify-center">
                                    <Check strokeWidth={3} className="w-2.5 h-2.5" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">Shared to client</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild><button>-</button></TooltipTrigger>
                                <TooltipContent side="top">Not shared</TooltipContent>
                              </Tooltip>
                            )}
                          </td>
                          <td className="px-4 py-3 pr-6 text-right">
                            <div className="inline-flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600" onClick={e => { e.stopPropagation(); openViewer(file.url || '', file.name); }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600" onClick={e => { e.stopPropagation(); downloadFile(file.url || '', file.name); }}>
                                <ImageDownload className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={e => { e.stopPropagation(); openViewer(file.url || '', file.name); }}>
                                    <Eye className="w-4 h-4 mr-2" />Open
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={e => { e.stopPropagation(); downloadFile(file.url || '', file.name); }}>
                                    <ImageDownload className="w-4 h-4 mr-2" />Download
                                  </DropdownMenuItem>
                                 {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); FileRenameOpenModal(file); }}>
                                    <Edit2 className="w-4 h-4 mr-2" />Rename
                                  </DropdownMenuItem>}
                                 {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleOpenUpdateModal({ id: file.id, name: file.name }); }}>
                                    <RefreshCw className="w-4 h-4 mr-2" />Update
                                  </DropdownMenuItem>}
                                 {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDocSendToClient(file.id); }}>
                                    <Send className="w-4 h-4 mr-2" />Send to Client
                                  </DropdownMenuItem>}
                                 {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleShareToContractor(file.id, file.name); }}>
                                    <Users className="w-4 h-4 mr-2" />Share to Contractor
                                  </DropdownMenuItem>}
                                 {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedForMove({ ids: [file.id], names: [file.name], isFolder: false }); setMoveDialogOpen(true); }}>
                                    <FolderInput className="w-4 h-4 mr-2" />Move
                                  </DropdownMenuItem>}
                                  {docsDeletePermission &&<DropdownMenuSeparator />}
                                  {docsDeletePermission &&<DropdownMenuItem className="text-red-500" onClick={e => { e.stopPropagation(); setDeleteTarget({ id: file.id, name: file.name, isFolder: false }); setIsDeleteOpen(true); }}>
                                    <Trash2 className="w-4 h-4 mr-2" />Delete
                                  </DropdownMenuItem>}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                      })}
                      {/* Links */}
                      {filterLinks.map((link: any) => {
                        const isSelected = checkedItems.some(item => item.id === link.id);
                        return (
                        <tr
                          key={link.id}
                          className={`hover:bg-stone-50 ${isSelected ? 'bg-[#efeae2]' : ''}`}
                          draggable={docsPermission}
                          onDragStart={e => {
                            if (!docsPermission) {
                              e.preventDefault();
                              toast.error("You don't have permission to perform this action.");
                              return;
                            }
                            e.dataTransfer.setData('documentid', String(link.id));
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                        >
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <Checkbox
                              checked={!!checkedItems.find(item => item.id === link.id)}
                              onCheckedChange={checked => handleCheckboxChange({ target: { value: link, checked } })}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Tooltip delayDuration={2000} open={docsPermission ? false : undefined}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-3">
                                  <LinkIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  <a href={link.link_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 truncate max-w-[200px] hover:underline">
                                    {link.name || link.link_url}
                                  </a>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top"><p>View Only</p></TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">Link</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(link.created_at)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(link.updated_at)}</td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            {link.client_access === true ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center w-4 h-4 text-[10px] font-medium text-white bg-[#0f1729] rounded-full justify-center">
                                    <Check strokeWidth={3} className="w-2.5 h-2.5" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">Shared to client</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild><button>-</button></TooltipTrigger>
                                <TooltipContent side="top">Not shared</TooltipContent>
                              </Tooltip>
                            )}
                          </td>
                          <td className="px-4 py-3 pr-6 text-right">
                            <div className="inline-flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600" onClick={() => window.open(link.link_url, '_blank')}>
                                <SquareArrowOutUpRight className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => window.open(link.link_url, '_blank')}>
                                    <SquareArrowOutUpRight className="w-4 h-4 mr-2" />Open Link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(link.link_url || ''); toast.success('Copied!'); }}>
                                    <Copy className="w-4 h-4 mr-2" />Copy Link
                                  </DropdownMenuItem>
                                 {docsPermission && <DropdownMenuItem onClick={() => FileRenameOpenModal(link)}>
                                    <Edit2 className="w-4 h-4 mr-2" />Rename
                                  </DropdownMenuItem>}
                                 {docsPermission && <DropdownMenuItem onClick={() => handleDocSendToClient(link.id)}>
                                    <Send className="w-4 h-4 mr-2" />Send to Client
                                  </DropdownMenuItem>}
                                 {docsPermission && <DropdownMenuItem onClick={() => handleShareToContractor(link.id, link.name)}>
                                    <Users className="w-4 h-4 mr-2" />Share to Contractor
                                  </DropdownMenuItem>}
                                 {docsPermission && <DropdownMenuItem onClick={() => { setSelectedForMove({ ids: [link.id], names: [link.name], isFolder: false }); setMoveDialogOpen(true); }}>
                                    <FolderInput className="w-4 h-4 mr-2" />Move
                                  </DropdownMenuItem>}
                                  {docsDeletePermission &&<DropdownMenuSeparator />}
                                  {docsDeletePermission && <DropdownMenuItem className="text-red-500" onClick={() => { setDeleteTarget({ id: link.id, name: link.name, isFolder: false }); setIsDeleteOpen(true); }}>
                                    <Trash2 className="w-4 h-4 mr-2" />Delete
                                  </DropdownMenuItem>}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Grid View Loading Skeleton */}
          {viewMode === 'grid' && isLoading && (
            <div>
              <h3 className="mb-4 text-sm font-medium text-neutral-900">{'Files & Folders'}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="rounded-xl border border-neutral-200 bg-white shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-1 w-full items-center gap-3">
                          <Skeleton className="h-5 w-5 rounded" />
                          <div className="w-full flex-1 min-w-0">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="mb-4 text-sm font-medium text-neutral-900">{'Files & Folders'}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFolders.map((folder, index) => {
              const isSelected = checkedItems.some(item => item.id === folder.id);
              return (
                <Tooltip key={folder.id} delayDuration={2000} open={docsPermission ? false : undefined}>
                <TooltipTrigger asChild>
                <div
                  onClick={(e) => {
                    const handled = handleGridItemClick(e, folder, index);
                    if (!handled) {
                      HandleFolderOpen(folder);
                    }
                  }}
                  draggable={docsPermission}
                  onDragStart={e => {
                    if (!docsPermission) {
                      e.preventDefault();
                      toast.error("You don't have permission to perform this action.");
                      return;
                    }
                    e.dataTransfer.setData('documentid', String(folder.id));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={e => {
                    if (e.dataTransfer.types.some(t => t.toLowerCase() === 'documentid')) {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragTargetId !== folder.id) setDragTargetId(folder.id);
                    }
                  }}
                  onDragEnter={e => {
                    if (e.dataTransfer.types.some(t => t.toLowerCase() === 'documentid')) {
                      setDragTargetId(folder.id);
                    }
                  }}
                  onDragLeave={() => {
                    setDragTargetId(null);
                  }}
                  onDrop={async e => {
                    setDragTargetId(null);
                    e.preventDefault();
                    e.stopPropagation();
                    if (!docsPermission) {
                      toast.error("You don't have permission to perform this action.");
                      return;
                    }
                    const draggedId = e.dataTransfer.getData('documentid');
                    if (draggedId && draggedId !== String(folder.id)) {
                      const idsToMove = checkedItems.some(item => String(item.id) === draggedId)
                        ? checkedItems.map(item => Number(item.id))
                        : [Number(draggedId)];

                      await toast.promise(
                        moveMutation.mutateAsync({
                          document_ids: idsToMove,
                          parent_id: Number(folder.id),
                        }),
                        { loading: 'Moving...', success: 'Moved successfully!', error: 'Failed to move. Please try again.' },
                      );
                    }
                  }}
                  className={`group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 transition-all duration-200 ${dragTargetId === folder.id ? 'ring-2 ring-neutral-900 bg-neutral-900/5 scale-[1.02]' : ''} ${folder?.name?.toLowerCase() === 'admin only' && !isAdmin ? 'hidden' : 'block'}`}
                  aria-label={`Open ${folder.name}`}
                >
                  <Card className={`cursor-pointer rounded-xl border ${isSelected ? 'border-neutral-200 bg-[#efeae2]' : 'border-neutral-200 bg-white'} shadow-sm transition-shadow hover:shadow-md`}>
                    <CardContent title={folder?.name} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-1 w-full items-center gap-3">
                          <Folder className="h-5 w-5 flex-shrink-0 text-neutral-500" aria-hidden="true" />
                          <div className="w-full flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium max-w-[200px] truncate text-neutral-900">{folder.name}</h4>
                                 {folder.client_access === true && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#5a554f] bg-[#efeae2] rounded flex-shrink-0">
                              <Send className="w-2.5 h-2.5" />
                              Shared
                            </span>
                          )}
                            </div>
                            <p className="mt-1 text-xs text-neutral-500">
                              {<span>{`${folder.item_count} ${folder.item_count > 1 ? 'files' : 'file'} • `}</span>}
                              Updated {folder.lastModified ? formatDistanceToNow(new Date(folder.lastModified), { addSuffix: true }) : '-'}
                            </p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="flex-shrink-0"
                            asChild
                            onClick={e => e.stopPropagation()} // ⬅️ Prevent parent click
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-neutral-400  flex-shrink-0 hover:text-neutral-600"
                              aria-label="Folder actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                HandleFolderOpen(folder);
                              }}
                            >
                              <FolderOpen className="w-4 h-4 mr-2" />
                              Open
                            </DropdownMenuItem>
                           {docsPermission &&  <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                RenameOpenModal(folder);
                              }}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Rename
                            </DropdownMenuItem>}
                           {docsPermission && <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                handleDocSendToClient(folder.id);
                              }}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Send to Client
                            </DropdownMenuItem> }
                           {docsPermission && <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                handleShareToContractor(folder.id, folder.name);
                              }}
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Share to Contractor
                            </DropdownMenuItem> }
                           {docsPermission && <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedForMove({
                                  ids: [folder.id],
                                  names: [folder.name],
                                  isFolder: true,
                                });
                                setMoveDialogOpen(true);
                              }}
                            >
                              <FolderInput className="w-4 h-4 mr-2" />
                              Move
                            </DropdownMenuItem> }
                           {docsDeletePermission && <DropdownMenuSeparator />}
                           {docsDeletePermission && <DropdownMenuItem
                              className="text-red-500"
                              onClick={e => {
                                e.stopPropagation();

                                setDeleteTarget({
                                  id: folder.id,
                                  name: folder.name,
                                  isFolder: folder.isFolder || false,
                                });
                                setIsDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem> }
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                </TooltipTrigger>
                <TooltipContent side="top"><p>View Only</p></TooltipContent>
                </Tooltip>
              );
            })}

            {filteredFiles.map((file, fileIndex) => {
              // Use file.url directly
              const url = file.url || '';
              const currentIndex = filteredFolders.length + fileIndex;
              const isSelected = checkedItems.some(item => item.id === file.id);

              return (
                <Tooltip key={file.id} delayDuration={2000} open={docsPermission ? false : undefined}>
                <TooltipTrigger asChild>
                <div
                  onClick={(e) => {
                    const handled = handleGridItemClick(e, file, currentIndex);
                    if (!handled) {
                      openViewer(url, file.name);
                    }
                  }}
                  draggable={docsPermission}
                  onDragStart={e => {
                    if (!docsPermission) {
                      e.preventDefault();
                      toast.error("You don't have permission to perform this action.");
                      return;
                    }
                    e.dataTransfer.setData('documentid', String(file.id));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
                  aria-label={`Open ${file.name}`}
                >
                  <Card
                    title={file?.name}
                    className={`cursor-pointer rounded-xl border ${isSelected ? 'border-neutral-200 bg-[#efeae2]' : 'border-neutral-200 bg-white'} shadow-sm transition-shadow hover:shadow-md`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        {/* File Info */}
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">{getFileIcon(file.name)}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-neutral-900 truncate max-w-[140px]">{file.name}</h4>
                                 {file.client_access === true && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#5a554f] bg-[#efeae2] rounded flex-shrink-0">
                              <Send className="w-2.5 h-2.5" />
                              Shared
                            </span>
                          )}
                            </div>
                            <p className="mt-1 text-xs text-neutral-500">
                              {/* Updated {file.lastModified ? formatDate(file.lastModified) : '-'} */}
                              Updated {file.lastModified ? formatDistanceToNow(new Date(file.lastModified), { addSuffix: true }) : '-'}
                            </p>
                          </div>
                        </div>

                        {/* File Options */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                              aria-label="File actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                openViewer(url, file.name);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Open
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                downloadFile(url, file.name);
                              }}
                            >
                              <ImageDownload className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>

                         {docsPermission && <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                FileRenameOpenModal(file);
                              }}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Rename
                            </DropdownMenuItem>}
                           {docsPermission && <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                handleOpenUpdateModal({ id: file.id, name: file.name });
                              }}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Update
                            </DropdownMenuItem>}
                           {docsPermission && <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                handleDocSendToClient(file.id);
                              }}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Send to Client
                            </DropdownMenuItem>}
                           {docsPermission && <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                handleShareToContractor(file.id, file.name);
                              }}
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Share to Contractor
                            </DropdownMenuItem>}
                         {docsPermission && <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedForMove({
                                  ids: [file.id],
                                  names: [file.name],
                                  isFolder: false,
                                });
                                setMoveDialogOpen(true);
                              }}
                            >
                              <FolderInput className="w-4 h-4 mr-2" />
                              Move
                            </DropdownMenuItem>}
                          {docsDeletePermission &&  <DropdownMenuSeparator />}
                           {docsDeletePermission &&  <DropdownMenuItem
                              className="text-red-500"
                              onClick={e => {
                                e.stopPropagation();
                                setDeleteTarget({
                                  id: file.id,
                                  name: file.name,
                                  isFolder: false,
                                });
                                setIsDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem> }
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                </TooltipTrigger>
                <TooltipContent side="top"><p>View Only</p></TooltipContent>
                </Tooltip>
              );
            })}

            {/* // LinksSection component */}
            {filterLinks.map((link, linkIndex) => {
              const fileName = link.name || link.link_url?.split('/').pop() || 'Untitled Link';
              const currentIndex = filteredFolders.length + filteredFiles.length + linkIndex;
              const isSelected = checkedItems.some(item => item.id === link.id);

              return (
                <Tooltip key={link.id} delayDuration={2000} open={docsPermission ? false : undefined}>
                <TooltipTrigger asChild>
                <div
                  onClick={(e) => {
                    const handled = handleGridItemClick(e, link, currentIndex);
                    if (!handled) {
                      window.open(link.link_url, '_blank');
                    }
                  }}
                  draggable={docsPermission}
                  onDragStart={e => {
                    if (!docsPermission) {
                      e.preventDefault();
                      toast.error("You don't have permission to perform this action.");
                      return;
                    }
                    e.dataTransfer.setData('documentid', String(link.id));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
                  aria-label={`Open ${fileName}`}
                >
                  <Card
                    title={fileName}
                    className={`cursor-pointer rounded-xl border ${isSelected ? 'border-neutral-200 bg-[#efeae2]' : 'border-neutral-200 bg-white'} shadow-sm transition-shadow hover:shadow-md`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        {/* Link Info */}
                        <div className="flex items-center gap-3">
                          <LinkIcon className="h-5 w-5 " aria-hidden="true" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-neutral-900 truncate max-w-[140px]">
                                {fileName}
                              </h4>
                               {link?.client_access === true && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#5a554f] bg-[#efeae2] rounded flex-shrink-0">
                              <Send className="w-2.5 h-2.5" />
                              Shared
                            </span>
                          )}
                            </div>

                            <p className="mt-1 text-xs text-neutral-400 truncate max-w-[200px]">{link.link_url}</p>
                          </div>
                        </div>

                        {/* Link Options */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                              aria-label="Link actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                window.open(link.link_url, '_blank');
                              }}
                            >
                              <SquareArrowOutUpRight className="w-4 h-4 mr-2" />
                              Open Link
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(link.link_url || '');
                                toast.success('Copied !');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                        {docsPermission &&  <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                FileRenameOpenModal(link);
                              }}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Rename
                            </DropdownMenuItem>}
                           { docsPermission && <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                handleDocSendToClient(link.id);
                              }}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Send to Client
                            </DropdownMenuItem>}
                           { docsPermission && <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                handleShareToContractor(link.id, link.name);
                              }}
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Share to Contractor
                            </DropdownMenuItem>}
                           {docsPermission && <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedForMove({
                                  ids: [link.id],
                                  names: [link.name],
                                  isFolder: false,
                                });
                                setMoveDialogOpen(true);
                              }}
                            >
                              <FolderInput className="w-4 h-4 mr-2" />
                              Move
                            </DropdownMenuItem>}

                           { docsDeletePermission && <DropdownMenuSeparator />}

                           {docsDeletePermission &&  <DropdownMenuItem
                              className="text-red-500"
                              onClick={e => {
                                e.stopPropagation();
                                setDeleteTarget({
                                  id: link.id,
                                  name: link.name,
                                  isFolder: false,
                                });
                                setIsDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem> }
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                </TooltipTrigger>
                <TooltipContent side="top"><p>View Only</p></TooltipContent>
                </Tooltip>
              );
            })}

            </div>
            </motion.div>
          )}

          {/* Drop Zone Indicator */}
          {docsPermission && (filteredFolders.length > 0 || filteredFiles.length > 0 || filterLinks.length > 0) && (
            <div
              className={`rounded-xl mt-10  border-1 border-dashed flex flex-col items-center justify-center p-8 transition-all duration-200`}
            >
              <UploadIcon className="w-10 h-10 text-neutral-400 mb-2" />
              <p className="text-sm font-medium text-neutral-600">Drop files here to upload</p>
              <p className="text-xs text-neutral-500 mt-1">or click "Upload Files" button</p>
            </div>
          )}
        </div>

        {/* Two-state panel: Latest Notes (default) / Recent Files */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-neutral-300 bg-white p-0.5">
              {(['notes', 'files'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActivePane(tab);
                  }}
                  aria-pressed={activePane === tab}
                  className={[
                    'rounded-full px-3 py-1 text-xs font-medium',
                    activePane === tab ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-stone-50',
                  ].join(' ')}
                >
                  {tab === 'notes' ? 'Latest Notes' : 'Recent Files'}
                </button>
              ))}
            </div>
          </div>

          {activePane === 'notes' ? (
            <NotesFeed notes={[]} onOpen={n => openNote(n)} className="border border-neutral-200" />
          ) : (
            <Card className="rounded-xl border border-neutral-200">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {driveRecentFiles?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 bg-white rounded-xl border border-dashed border-neutral-300">
                      <FolderOpen className="w-12 h-12 text-neutral-300 mb-3" />
                      <p className="text-sm text-neutral-500">No recent files found</p>
                    </div>
                  )}
                  {driveRecentFiles.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-3 transition-colors hover:bg-stone-50"
                    >
                      <div className="flex-shrink-0">{getFileIcon(file.name)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="truncate font-medium text-neutral-900">{file.name}</h4>
                          {file.client_access === true && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#5a554f] bg-[#efeae2] rounded flex-shrink-0">
                              <Send className="w-2.5 h-2.5" />
                              Shared
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-neutral-600">
                          {/* <span>{formatSize(file.sizeBytes)}</span> */}
                          {/* <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={`/placeholder.svg?height=16&width=16&query=uploaded-by`} alt="" />
                              <AvatarFallback className="bg-neutral-900 text-[9px] text-white">{'TS'}</AvatarFallback>
                            </Avatar>
                            {'Team'}
                          </div> */}
                          <div className="flex items-center gap-1">
                            Uploaded {file.created_at ? formatDistanceToNow(new Date(file.created_at), { addSuffix: true }) : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                          onClick={() => {
                            if (file.type == 'LINK') {
                              window.open(file.link_url, '_blank');
                            } else {
                              openViewer(fileUrl(file), file.name);
                            }
                          }}
                        >
                          {file.type == 'LINK' ? <SquareArrowOutUpRight className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        {file.type == 'LINK' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                            onClick={() => {
                              (navigator.clipboard.writeText(file.link_url), toast.success('Link copied to clipboard'));
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                            onClick={() => downloadFile(fileUrl(file), file.name)}
                          >
                            <ImageDownload className="h-4 w-4" />
                          </Button>
                        )}
                        {/* <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Side Panel for notes */}
      <NotesSidePanel open={sideOpen} onOpenChange={setSideOpen} note={selectedNote} />

      {/* Rename Folder Dialog */}
      <Dialog
        open={renameModalOpen}
        onOpenChange={open => {
          setRenameModalOpen(open);
          if (open) setRenameFolderError('');
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>Enter a new name for this folder.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Folder Name"
              value={updatedFolderName}
              onChange={e => {
                setUpdatedFolderName(e.target.value);
                if (e.target.value.length > MAX_FOLDER_NAME_LENGTH) {
                  setRenameFolderError(`Folder name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
                } else {
                  setRenameFolderError('');
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (!updatedFolderName.trim()) {
                    setRenameFolderError('Folder name cannot be empty');
                    return;
                  }
                  if (updatedFolderName.length > MAX_FOLDER_NAME_LENGTH) {
                    setRenameFolderError(`Folder name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
                    return;
                  }
                  handleRenameFolder();
                }
              }}
              maxLength={100}
            />
            {renameFolderError && <p className="text-xs text-red-500 font-medium">{renameFolderError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={RenameCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleRenameFolder}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog
        open={modalOpen}
        onOpenChange={open => {
          setModalOpen(open);
          if (open) setNewFolderError('');
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter a name for your new folder. Click create when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Folder Name"
              value={newFolderName}
              onChange={e => {
                setNewFolderName(e.target.value);
                if (e.target.value.length > MAX_FOLDER_NAME_LENGTH) {
                  setNewFolderError(`Folder name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
                } else {
                  setNewFolderError('');
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (!newFolderName.trim()) {
                    setNewFolderError('Folder name cannot be empty');
                    return;
                  }
                  if (newFolderName.length > MAX_FOLDER_NAME_LENGTH) {
                    setNewFolderError(`Folder name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
                    return;
                  }
                  toast.promise(
                    createFolderMutation.mutateAsync({ folderName: newFolderName }),
                    { loading: 'Creating folder...', success: 'Folder created successfully!', error: 'Failed to create folder.' },
                  );
                }
              }}
              maxLength={100}
            />
            {newFolderError && <p className="text-xs text-red-500 font-medium">{newFolderError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newFolderName.trim()) {
                  setNewFolderError('Folder name cannot be empty');
                  return;
                }
                if (newFolderName.length > MAX_FOLDER_NAME_LENGTH) {
                  setNewFolderError(`Folder name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
                  return;
                }
                toast.promise(
                  createFolderMutation.mutateAsync({ folderName: newFolderName }),
                  { loading: 'Creating folder...', success: 'Folder created successfully!', error: 'Failed to create folder.' },
                );
              }}
            >
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog - Modern Design */}
      <Dialog
        open={uploadModal}
        onOpenChange={open => {
          if (!open) handleUploadModalClose();
          else setUploadModal(true);
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5" />
              Upload Documents
            </DialogTitle>
            <DialogDescription>Upload files to your project. You can select multiple files at once.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Drop Zone */}
            <div
              onClick={() => document.getElementById('fileInput')?.click()}
              onDragOver={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={e => {
                e.preventDefault();
                e.stopPropagation();
                const files = Array.from(e.dataTransfer.files);
                const tooLarge = files.some(file => file.size > MAX_FILE_SIZE);

                if (tooLarge) {
                  setError('Some files are larger than 50MB');
                  return;
                }

                setError(null);
                const processedFiles = files.map(file => {
                  return Object.assign(file, {
                    preview: URL.createObjectURL(file),
                    originalName: file.name,
                  });
                });
                setFileQueue(prev => [...prev, ...processedFiles]);
              }}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-stone-50 transition-all"
            >
              <input
                id="fileInput"
                type="file"
                multiple
                className="hidden"
                onChange={e => {
                  const selectedFiles = Array.from(e.target.files || []);
                  const tooLarge = selectedFiles.some(file => file.size > MAX_FILE_SIZE);

                  if (tooLarge) {
                    setError('Some files are larger than 50MB');
                    e.target.value = '';
                    return;
                  }

                  setError(null);
                  const processedFiles = selectedFiles.map(file => {
                    return Object.assign(file, {
                      preview: URL.createObjectURL(file),
                      originalName: file.name,
                    });
                  });
                  setFileQueue(prev => [...prev, ...processedFiles]);
                  e.target.value = '';
                }}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                  <FileUp className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">Maximum file size: 50MB</p>
                </div>
                {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
              </div>
            </div>

            {/* File List */}
            {fileQueue.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Selected Files ({fileQueue.length})</p>
                  <Button variant="ghost" size="sm" onClick={() => setFileQueue([])} className="h-8 text-xs">
                    Clear All
                  </Button>
                </div>

                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                  {fileQueue.map((file, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:bg-stone-100 transition-colors"
                    >
                      {renamingIndex === index ? (
                        <div className="flex items-center flex-1 min-w-0">
                          <input
                            type="text"
                            value={newFileName}
                            onChange={e => setNewFileName(e.target.value)}
                            className="flex-1 border rounded-l-md p-2 focus:outline-none text-sm"
                            autoFocus
                          />
                          <span className="bg-stone-200 px-2 py-2 text-gray-700 text-sm">
                            {((file as any).customName || (file as any).name).substring(
                              ((file as any).customName || (file as any).name).lastIndexOf('.'),
                            )}
                          </span>
                          <Button size="sm" onClick={() => handleSaveRename(index)} className="rounded-l-none h-9">
                            <Check size={16} />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 w-full">
                          <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm max-w-[400px] font-medium text-gray-900 truncate"
                              title={(file as any).customName || file.name}
                            >
                              {(file as any).customName || file.name}
                            </p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            <Button variant="ghost" size="sm" onClick={() => handleStartRenaming(index, file)} className="h-8 w-8 p-0">
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFileQueue(fileQueue.filter((_, i) => i !== index))}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleUploadModalClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!fileQueue.length) return toast.error('Select files first');
                if (fileQueue.length === 1) {
                  setUploading(true);
                  // Create new abort controller
                  abortControllerRef.current = new AbortController();

                  toast.promise(
                    uploadMutation.mutateAsync({
                      file: fileQueue[0],
                      name: (fileQueue[0] as any).customName || fileQueue[0].name,
                      signal: abortControllerRef.current.signal,
                    }),
                    {
                      loading: 'Uploading...',
                      success: 'Uploaded successfully!',
                      error: (e: any) =>
                        e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED' || axios.isCancel(e)
                          ? 'Upload canceled'
                          : 'Failed to upload document.',
                    },
                  );
                } else {
                  setUploading(true);
                  // Create new abort controller
                  abortControllerRef.current = new AbortController();
                  const signal = abortControllerRef.current.signal;

                  const uploadToastId = toast(`Uploading ${fileQueue.length} files...`);
                  let completed = 0;
                  let failed = 0;

                  fileQueue.forEach(f => {
                    createDocument({
                      file: f,
                      name: (f as any).customName || f.name,
                      type: 'FILE',
                      project: params.id,
                      parent: null,
                      signal: signal,
                    })
                      .then(() => {
                        completed++;
                        if (completed + failed === fileQueue.length) {
                          toast.update(uploadToastId, { title: `Uploaded ${completed}/${fileQueue.length} files`, type: 'success' });
                          setUploading(false);
                          setFileQueue([]);
                          setUploadModal(false);
                          refetch();
                          abortControllerRef.current = null;
                        }
                      })
                      .catch(err => {
                        // Ignore abort errors
                        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || axios.isCancel(err)) {
                          setUploading(false);
                          toast.update(uploadToastId, { title: 'Upload canceled', type: 'error' });
                          return;
                        }

                        failed++;
                        if (completed + failed === fileQueue.length) {
                          toast.update(uploadToastId, { title: 'Some uploads failed', type: 'error' });
                          setUploading(false);
                          refetch();
                          abortControllerRef.current = null;
                        }
                      });
                  });
                }
              }}
              disabled={fileQueue.length === 0 || uploading || renamingIndex !== -1}
            >
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadIcon className="w-4 h-4 mr-2" />}
              {uploading ? 'Uploading...' : 'Upload'} {fileQueue.length > 0 && `(${fileQueue.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-[95vw] h-[90vh] p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <DialogTitle className="text-lg py-2 font-semibold">
              {/* {currentDoc && currentDoc[0]?.fileName ? currentDoc[0].fileName : 'Document Viewer'} */}
            </DialogTitle>
            {/* <div className="flex items-center gap-2">
              {currentDoc && currentDoc[0]?.fileName && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadFile(currentDoc[0].uri, currentDoc[0].fileName)}
                  className="h-8 w-8 p-0"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div> */}
          </div>
          <div className="flex-1 overflow-auto p-4">
            <DocViewer
              pluginRenderers={DocViewerRenderers}
              className="DocViewr"
              documents={currentDoc || []}
              config={{
                header: {
                  disableHeader: false,
                  disableFileName: false,
                  retainURLParams: false,
                },
              }}
              style={{ height: '100%', minHeight: '600px' }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Sent to Client Dialog */}
      <SentToClientDialog
        open={sentDialogOpen}
        onOpenChange={v => {
          setSentDialogOpen(v);
          if (!v) setSelectedForSend(null);
        }}
        itemName={selectedForSend?.name}
        onConfirm={async (message: string) => {
          if (!selectedForSend) return;
          // send doc
          handleClick(selectedForSend, message);
        }}
      />

      {/* Rename File Dialog */}
      <Dialog
        open={fileRenameModalOpen}
        onOpenChange={open => {
          setFileRenameModalOpen(open);
          if (open) setRenameFileError('');
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>Enter a new name for this file.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="New File Name"
              value={updatedFileName}
              onChange={e => {
                setUpdatedFileName(e.target.value);
                if (e.target.value.length > MAX_FOLDER_NAME_LENGTH) {
                  setRenameFileError(`Name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
                } else {
                  setRenameFileError('');
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (!updatedFileName.trim()) {
                    setRenameFileError('Name cannot be empty');
                    return;
                  }
                  if (updatedFileName.length > MAX_FOLDER_NAME_LENGTH) {
                    setRenameFileError(`Name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
                    return;
                  }
                  handleRenameFile();
                }
              }}
              maxLength={100}
            />
            {renameFileError && <p className="text-xs text-red-500 font-medium">{renameFileError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={FileRenameCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!updatedFileName.trim()) {
                  setRenameFileError('Name cannot be empty');
                  return;
                }
                if (updatedFileName.length > MAX_FOLDER_NAME_LENGTH) {
                  setRenameFileError(`Name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
                  return;
                }
                handleRenameFile();
              }}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Link Dialog */}
      <Dialog
        open={linkModalOpen}
        onOpenChange={open => {
          setLinkModalOpen(open);
          if (open) setLinkError('');
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Add Link
            </DialogTitle>
            <DialogDescription>Add a link to an external resource or website.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Link Name (optional)"
                value={linkName}
                onChange={e => {
                  setLinkName(e.target.value);
                  if (e.target.value.length > MAX_FOLDER_NAME_LENGTH) {
                    setLinkError(`Link name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
                  } else {
                    setLinkError('');
                  }
                }}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="url"
                placeholder="Enter URL (https://...)"
                value={link}
                onChange={e => setLink(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    if (link.trim()) {
                      if (linkName.length > MAX_FOLDER_NAME_LENGTH) {
                        setLinkError(`Link name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
                        return;
                      }
                      handleSubmitLink();
                    }
                  }
                }}
              />
            </div>
            {linkError && <p className="text-xs text-red-500 font-medium">{linkError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={LinkCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (linkName.length > MAX_FOLDER_NAME_LENGTH) {
                  setLinkError(`Link name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
                  return;
                }
                handleSubmitLink();
              }}
            >
              <Link2 className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) {
            handleDeleteTask(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title={deleteTarget?.isFolder ? 'Delete Folder' : 'Delete File'}
        description="Are you sure you want to delete this item? This action cannot be undone."
        itemName={deleteTarget?.name}
        requireConfirmation={false}
      />

      {/* Image Gallery Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={galleryImages}
        index={currentImageIndex}
        on={{
          view: ({ index }) => setCurrentImageIndex(index),
        }}
        plugins={[Zoom, Fullscreen ]}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true,
        }}
        animation={{ fade: 300 }}
        carousel={{ finite: true }}
        controller={{ closeOnBackdropClick: true }}
        toolbar={{
          buttons: [
            <button
              key="download"
              type="button"
              className="yarl__button"
              onClick={handleLightboxDownload}
            >
              <ImageDownload className="h-6 w-6" />
            </button>,
            'close',
          ],
        }}
      />

      {/* PDF Gallery Lightbox */}
      <Lightbox
        open={pdfLightboxOpen}
        close={() => setPdfLightboxOpen(false)}
        slides={galleryPdfs}
        index={currentPdfIndex}
        on={{
          view: ({ index }) => setCurrentPdfIndex(index),
        }}
        render={{
          slide: ({ slide }) => (
            <PDFViewer url={slide.src} fileName={slide.alt || 'Document'} />
          ),
        }}
        animation={{ fade: 300 }}
        carousel={{ finite: true }}
        controller={{ closeOnBackdropClick: true }}
        toolbar={{
          buttons: [
            <button
              key="download"
              type="button"
              className="yarl__button"
              onClick={handlePdfLightboxDownload}
            >
              <ImageDownload className="h-6 w-6" />
            </button>,
            'close',
          ],
        }}
      />

      {/* Move Document Dialog */}
      <MoveDocumentDialog
        isOpen={moveDialogOpen}
        onClose={() => {
          setMoveDialogOpen(false);
          setSelectedForMove(null);
        }}
        onConfirm={async parentId => {
          if (!selectedForMove) return;
          await toast.promise(
            moveMutation.mutateAsync({
              document_ids: selectedForMove.ids.map(Number),
              parent_id: parentId,
            }),
            { loading: 'Moving...', success: 'Moved successfully!', error: 'Failed to move. Please try again.' },
          );
        }}
        documentIds={selectedForMove?.ids || []}
        documentNames={selectedForMove?.names || []}
        currentParentId={null}
        projectId={params.id}
        excludeFolderIds={selectedForMove?.isFolder ? selectedForMove.ids : []}
      />

      {/* Contractor Share Dialog */}
      <SelectContractorDialog
        projectId={params.id}
        isOpen={contractorDialogOpen}
        onClose={() => {
          setContractorDialogOpen(false);
          setSelectedDocForContractor(null);
        }}
        onSelect={handleContractorSelected}
        documentId={selectedDocForContractor?.id && selectedDocForContractor.id !== 'bulk' ? Number(selectedDocForContractor.id) : undefined}
        documentIds={selectedDocForContractor?.id === 'bulk' ? checkedItems.map(item => Number(item.id)) : undefined}
        title={selectedDocForContractor ? `Share "${selectedDocForContractor.name}" with...` : 'Select Contractor'}
      />

      {/* Update Document Modal */}
      <Dialog open={updateDocModalOpen} onOpenChange={setUpdateDocModalOpen}>
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-neutral-600" />
              Update Document
            </DialogTitle>
            <DialogDescription>
              Upload a new version of "{selectedDocForUpdate?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                updateFile ? 'border-green-400 bg-green-50' : 'border-neutral-300 hover:border-neutral-400'
              }`}
            >
              <input
                type="file"
                id="update-file-input"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setUpdateFile(file);
                }}
              />
              <label htmlFor="update-file-input" className="cursor-pointer">
                {updateFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileUp className="w-8 h-8 text-green-600" />
                    <p className="text-sm font-medium text-green-700">{updateFile.name}</p>
                    <p className="text-xs text-neutral-500">
                      {(updateFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.preventDefault();
                        setUpdateFile(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <UploadIcon className="w-8 h-8 text-neutral-400" />
                    <p className="text-sm text-neutral-600">
                      Click to select a file
                    </p>
                    <p className="text-xs text-neutral-400">
                      or drag and drop
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUpdateDocModalOpen(false);
                setSelectedDocForUpdate(null);
                setUpdateFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDocument}
              disabled={!updateFile || updateDocMutation.isPending}
              className="bg-neutral-900 text-white hover:bg-neutral-800"
            >
              {updateDocMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProjectDocsPage({ params }: { params: { id: string } }) {
  return (
    <PermissionGuard permission="documents.view" redirectTo={`/projects/${params.id}`}>
      <ProjectDocsPageContent params={params} />
    </PermissionGuard>
  );
}
