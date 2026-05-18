'use client';
import { PermissionGuard } from '@/components/PermissionGuard';

import Link from 'next/link';
import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ArrowLeft,
  ChevronRight,
  Download as ImageDownload,
  Eye,
  File,
  FileText,
  Filter,
  FolderIcon,
  ImageIcon,
  MoreHorizontal,
  Search,
  SortAsc,
  Upload,
  User,
  Check,
  Edit2,
  X,
  Trash2,
  FolderPen,
  Link as LinkIcon,
  MessageSquareShare,
  Loader2,
  CloudDownload,
  ChevronDown,
  SquareArrowOutUpRight,
  FolderOpen,
  Send,
  FolderInput,
  Copy,
  LayoutGrid,
  List,
  Folder,
  FileSpreadsheet,
  FileType,
  Presentation,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  Users,
  Share2,
  RefreshCw,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { gooeyToast as toast } from 'goey-toast';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Download from "yet-another-react-lightbox/plugins/download";
import 'yet-another-react-lightbox/styles.css';
import { PDFViewer } from '@/components/PDFViewer';
import { createDocument, deleteDocument, updateDocument, moveDocuments, uploadNewVersion, type DocumentItem } from '@/services/documentService';
import useFetch from '@/hooks/useFetch';
import { fetchData } from '@/lib/Api';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteDialog } from '@/components/DeleteDialog';
import { MoveDocumentDialog } from '@/components/MoveDocumentDialog';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SentToClientDialog } from '@/components/SentToClientDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload as UploadIcon, FileUp, Link2 } from 'lucide-react';
import { usePost } from '@/hooks/usePost';
import { SelectContractorDialog } from '@/components/contractor';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePermissions } from '@/hooks/usePermissions';

type FileType = 'image' | 'pdf' | 'spreadsheet' | 'document' | 'cad' | 'design' | 'other';

interface FileItem {
  id: string | number;
  name: string;
  isFolder: boolean;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
  created_at: string;
  updated_at: string;
  item_count: number;
  preview?: string;
  originalName?: string;
  url?: string;
  type?: string;
  client_access?: boolean | null;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  // Images
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
    return <ImageIcon className="w-4 h-4 text-neutral-500" />;
  }

  // PDFs
  if (ext === 'pdf') {
    return <FileText className="w-4 h-4 text-neutral-500" />;
  }

  // Spreadsheets
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    return <FileSpreadsheet className="w-4 h-4 text-neutral-500" />;
  }

  // Documents
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
    return <FileType className="w-4 h-4 text-neutral-500" />;
  }

  // Presentations
  if (['ppt', 'pptx', 'odp'].includes(ext)) {
    return <Presentation className="w-4 h-4 text-neutral-500" />;
  }

  // CAD files
  if (['dwg', 'dxf', 'skp', 'step', 'stp'].includes(ext)) {
    return <File className="w-4 h-4 text-neutral-500" />;
  }

  // Videos
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)) {
    return <FileVideo className="w-4 h-4 text-neutral-500" />;
  }

  // Audio
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(ext)) {
    return <FileAudio className="w-4 h-4 text-neutral-500" />;
  }

  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'php', 'rb'].includes(ext)) {
    return <FileCode className="w-4 h-4 text-neutral-500" />;
  }

  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return <FileArchive className="w-4 h-4 text-neutral-500" />;
  }

  // Default
  return <File className="w-4 h-4 text-neutral-500" />;
};

const formatDate = (input: string | Date) => {
  const date = typeof input === 'string' ? new Date(input) : input;
  return date?.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FOLDER_NAME_LENGTH = 50;

function ProjectFolderPageContent({ params }: { params: { id: string; folderId: string | string[] } }) {
  // Parse folderId as array (catch-all route)
  const folderIdArray = Array.isArray(params.folderId) ? params.folderId : [params.folderId];
  const currentFolderId = folderIdArray[folderIdArray.length - 1]; // Last item is current folder

  const router = useRouter();
  const searchParams = useSearchParams();
  const shareWithContractor = searchParams.get('shareWith');
  const contractorName = searchParams.get('contractorName');

  // State management
  const [modalOpen, setModalOpen] = useState(false);
  const [isSharingDocuments, setIsSharingDocuments] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [fileRenameModalOpen, setFileRenameModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [link, setLink] = useState('');
  const [linkName, setLinkName] = useState('');
  const [updatedFolderName, setUpdatedFolderName] = useState('');
  const [updatedFileName, setUpdatedFileName] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<FileItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string | number;
    name: string;
    isFolder: boolean;
  } | null>(null);
  const [checkedItems, setCheckedItems] = useState<any[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<any>(null);
  const [file, setFile] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [renamingIndex, setRenamingIndex] = useState(-1);
  const [newFileName, setNewFileName] = useState('');
  const [sentDialogOpen, setSentDialogOpen] = useState(false);
  const [selectedForSend, setSelectedForSend] = useState<any>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { mutate: sendToClient } = usePost();
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [galleryImages, setGalleryImages] = React.useState<any[]>([]);
  const [pdfLightboxOpen, setPdfLightboxOpen] = React.useState(false);
  const [currentPdfIndex, setCurrentPdfIndex] = React.useState(0);
  const [galleryPdfs, setGalleryPdfs] = React.useState<any[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [sortBy, setSortBy] = useState('date-desc');
  const [clientAccessFilter, setClientAccessFilter] = useState<'all' | 'shared' | 'not-shared'>('all');
  const [newFolderError, setNewFolderError] = useState('');
  const [renameFolderError, setRenameFolderError] = useState('');
  const [linkError, setLinkError] = useState('');
  const [renameFileError, setRenameFileError] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragTargetId, setDragTargetId] = useState<string | number | null>(null);
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

  const { can } = usePermissions();
  const docsPermission = can('documents.edit');
  const docsDeletePermission = can('documents.delete');

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>(() => {
  const view = searchParams.get('view');

  if (view === 'list' || view === 'grid') return view;

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('docs-view-mode');
    if (stored === 'list' || stored === 'grid') return stored;
  }

  return 'grid';
});
  
  const queryClient = useQueryClient()

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem('docs-view-mode', viewMode);
  }, [viewMode]);

  // Move dialog state
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedForMove, setSelectedForMove] = useState<{
    ids: (string | number)[];
    names: string[];
    isFolder: boolean;
  } | null>(null);

  const openFolder = (doc: FileItem) => {
    // Append the new folder ID to the current path
    const newPath = [...folderIdArray, String(doc.id)].join('/');
    router.push(`/projects/${params.id}/docs/folders/${newPath}`);
  };

  const goUp = () => {
    if (folderIdArray.length <= 1) {
      // Go back to docs root
      router.push(`/projects/${params.id}/docs`);
      return;
    }
    // Remove the last folder ID to go up one level
    const parentPath = folderIdArray.slice(0, -1).join('/');
    router.push(`/projects/${params.id}/docs/folders/${parentPath}`);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      file.forEach(file => {
        if ((file as any).preview) URL.revokeObjectURL((file as any).preview);
      });
    };
  }, [file]);

  // Fetch folder content using useFetch
  const {
    data: filesResp,
    isLoading,
    refetch,
  } = useFetch(`documents/documents/${currentFolderId}/folder_content/`, {
    enabled: !!currentFolderId,
  });

  // Fetch folder names for breadcrumb path using useQueries
  // This dynamically creates queries for each folder in the path, regardless of depth
  const folderQueries = useQueries({
    queries: folderIdArray.map(folderId => ({
      queryKey: [`documents/documents/${folderId}/`],
      queryFn: () => fetchData(`documents/documents/${folderId}/`),
      enabled: !!folderId,
    })),
  });

  // Build breadcrumb items from folder IDs and fetched names
  const breadcrumbItems = useMemo(() => {
    return folderIdArray.map((folderId, index) => ({
      id: folderId,
      name: folderQueries[index]?.data?.name || folderId, // Show name if available, otherwise show ID
      isLoading: folderQueries[index]?.isLoading,
    }));
  }, [folderIdArray.join(','), ...folderQueries.map(q => q.data?.name)]);

  // Fetch Links - Removed separate query
  const { isLoading: linkLoading } = { isLoading: false };

  // Process files data using useMemo
  const allItems = useMemo(() => {
    if (!filesResp || !Array.isArray(filesResp)) return [];
    return filesResp.map((item: any) => ({
      ...item,
      isFolder: item.type === 'FOLDER',
      url: item.file || item.link_url,
      metadata: { ...item.metadata, mimetype: item.type === 'FILE' ? 'File' : item?.type == 'FOLDER' ? 'Folder' : 'Link' },
      item_count: item?.item_count,
      client_access: item.client_access,
    })) as FileItem[];
  }, [filesResp]);

  const totalDocs = useMemo(() => allItems, [allItems]);

  const linkList = useMemo(() => {
    return allItems
      .filter(d => d.type === 'LINK')
      .map(d => ({
        id: d.id,
        link: d.url || '',
        name: d.name,
        path: '',
        url: d.url,
      }));
  }, [allItems]);

  // Removed separate link effect

  // File operations
  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  const handlePdfLightboxDownload = async () => {
    const slide = galleryPdfs[currentPdfIndex];
    const pdfUrl = slide?.src;
    const filename = slide?.download?.filename || slide?.alt || `document-${currentPdfIndex + 1}.pdf`;

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

  // Handle grid item click for multi-select
  const handleGridItemClick = (e: React.MouseEvent, item: any, currentIndex: number) => {
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

  const handleClickDocs = (url: string, fileName: string) => {
    // Check if file is an image
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const pdfExtensions = ['pdf'];
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    if (imageExtensions.includes(extension)) {
      // Open in lightbox gallery — use filteredTotalDocs so order matches the grid
      const allImageFiles = filteredTotalDocs.filter(item => {
        if (item.isFolder || item.type === 'LINK') return false;
        const ext = item.name.split('.').pop()?.toLowerCase() || '';
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
      // Open PDFs in lightbox gallery — use filteredTotalDocs so order matches the grid
      const allPdfFiles = filteredTotalDocs.filter(item => {
        if (item.isFolder || item.type === 'LINK') return false;
        const ext = item.name.split('.').pop()?.toLowerCase() || '';
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
      setCurrentDoc([{ uri: url, fileName: fileName }]);
      setShowViewer(true);
    }
  };

  // File upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.some(file => file.size > MAX_FILE_SIZE)) {
        setError('One or more files exceed the 50MB limit');
        return;
      }
      const processedFiles = droppedFiles.map(file => {
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
          originalName: file.name,
          id: Math.random().toString(36).substring(2),
        });
      }) as any[];
      setFile(prev => [...prev, ...processedFiles]);
      setError('');
    }
  };

  const handleSelectByClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.some(file => file.size > MAX_FILE_SIZE)) {
      setError('One or more files exceed the 50MB limit');
      return;
    }
    const processedFiles = selectedFiles.map(file => {
      return Object.assign(file, {
        preview: URL.createObjectURL(file),
        originalName: file.name,
        id: Math.random().toString(36).substring(2),
      });
    }) as any[];
    setFile(prev => [...prev, ...processedFiles]);
    setError('');
    // Reset the input value so the same file can be selected again if needed
    event.target.value = '';
  };

  const handleStartRenaming = (index: number, file: any) => {
    setRenamingIndex(index);
    const currentName = file.customName || file.name;
    const lastDot = currentName.lastIndexOf('.');
    const baseName = lastDot > 0 ? currentName.substring(0, lastDot) : currentName;
    setNewFileName(baseName);
  };

  const handleSaveRename = (index: number) => {
    const singleFile = file[index] as any;
    const currentName = singleFile.customName || singleFile.name;
    const lastDot = currentName?.lastIndexOf('.');
    const extension = lastDot > 0 ? currentName.substring(lastDot) : '';
    const renamedFile = Object.assign(singleFile, {
      customName: newFileName + extension,
    });
    const updatedFiles = [...file];
    updatedFiles[index] = renamedFile as any;
    setFile(updatedFiles);
    setRenamingIndex(-1);
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = file[index] as any;
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    const updatedFiles = file.filter((_, i) => i !== index);
    setFile(updatedFiles);
    if (renamingIndex === index) {
      setRenamingIndex(-1);
    }
  };

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: (vars: any) => createDocument({ ...vars, type: 'FILE', project: params.id, parent: Number(currentFolderId) }),
    onSuccess: () => {
      refetch();
      setFile([]);
      setUploadModal(false);
      setUploading(false);
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: (vars: any) =>
      createDocument({ ...vars, name: newFolderName, type: 'FOLDER', project: params.id, parent: Number(currentFolderId) }),
    onSuccess: () => {
      refetch();
      setModalOpen(false);
      setNewFolderName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: any) => deleteDocument(vars.id),
    onSuccess: () => {
      refetch();
    },
  });

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

  const linkMutation = useMutation({
    mutationFn: (vars: any) => createDocument({ ...vars, type: 'LINK', project: params.id, parent: Number(currentFolderId) }),
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

  const renameFolderMutation = useMutation({
    mutationFn: (vars: any) => updateDocument(vars.id, { name: vars.newFolderName }),
    onSuccess: () => {
      refetch();
      setRenameModalOpen(false);
    },
  });

  const renameFileMutation = useMutation({
    mutationFn: (vars: any) => updateDocument(vars.id, { name: vars.newFileName }),
    onSuccess: () => {
      refetch();
      setFileRenameModalOpen(false);
    },
  });

  // Move documents mutation
  const moveMutation = useMutation({
    mutationFn: (vars: { document_ids: number[]; parent_id: number | null }) => moveDocuments(vars),
    onSuccess: () => {
      setMoveDialogOpen(false);
      setSelectedForMove(null);
      setCheckedItems([]);
      refetch();
      queryClient.refetchQueries({queryKey: [`documents/documents/root_documents/?project_id=${params.id}`]})
    },
  });

  // Event handlers
  const handleFileChange = (event: any) => {
    const selectedFiles = file;
    if (selectedFiles.length > 0) {
      const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        setFile([]);
        toast.error(`${oversizedFiles.length} file(s) exceed the 50MB size limit!`);
      } else {
        setFile(selectedFiles);
        setUploading(true);
        if (selectedFiles.length === 1) {
          toast.promise(
            uploadMutation.mutateAsync({
              file: selectedFiles[0],
              name: (selectedFiles[0] as any).customName || selectedFiles[0].name,
              type: 'FILE',
              project: params.id,
              parent: Number(currentFolderId),
            }),
            { loading: 'Uploading...', success: 'Uploaded successfully!', error: 'Failed to upload document.' },
          );
        } else {
          const uploadToastId = toast(`Uploading ${selectedFiles.length} files...`);
          let completed = 0;
          let failed = 0;
          selectedFiles.forEach(file => {
            createDocument({
              file,
              name: (file as any).customName || file.name,
              type: 'FILE',
              project: params.id,
              parent: Number(currentFolderId),
            })
              .then(() => {
                completed++;
                if (completed + failed === selectedFiles.length) {
                  if (failed === 0) {
                    toast.update(uploadToastId, { title: `All ${selectedFiles.length} files uploaded successfully!`, type: 'success' });
                  } else {
                    toast.update(uploadToastId, { title: `Uploaded ${completed}/${selectedFiles.length} files successfully.`, type: 'warning' });
                  }
                  refetch();
                  setFile([]);
                  setUploadModal(false);
                  setUploading(false);
                }
              })
              .catch(() => {
                setUploading(false);
                failed++;
                if (completed + failed === selectedFiles.length) {
                  if (failed === selectedFiles.length) {
                    toast.update(uploadToastId, { title: 'Failed to upload all files.', type: 'error' });
                  } else {
                    toast.update(uploadToastId, { title: `Uploaded ${completed}/${selectedFiles.length} files successfully.`, type: 'warning' });
                  }
                  refetch();
                }
              });
          });
        }
      }
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }
    if (newFolderName.length > MAX_FOLDER_NAME_LENGTH) {
      toast.error(`Folder name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
      return;
    }
    toast.promise(
      createFolderMutation.mutateAsync({
        projectId: params.id,
        folderName: newFolderName,
        // path: currentPath, // Not needed
      }),
      { loading: 'Creating folder...', success: 'Folder created successfully!', error: 'Failed to create folder.' },
    );
  };

  const handleDeleteTask = (id: string | number) => {
    toast.promise(
      deleteMutation.mutateAsync({ id }),
      { loading: 'Deleting...', success: 'Deleted successfully!', error: 'Failed to delete file.' },
    );
  };

  const handleSubmitLink = () => {
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
  };

  const handleRenameFolder = () => {
    if (!selectedDoc) return;
    if (!updatedFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }
    if (updatedFolderName.length > MAX_FOLDER_NAME_LENGTH) {
      toast.error(`Folder name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
      return;
    }
    toast.promise(
      renameFolderMutation.mutateAsync({
        id: selectedDoc.id,
        newFolderName: updatedFolderName,
      }),
      { loading: 'Renaming...', success: 'Renamed successfully!', error: 'Failed to rename folder.' },
    );
    setUpdatedFolderName('');
  };

  const handleRenameFile = () => {
    if (!selectedDoc) return;
    toast.promise(
      renameFileMutation.mutateAsync({
        id: selectedDoc.id,
        newFileName: updatedFileName,
      }),
      { loading: 'Renaming file...', success: 'File renamed successfully!', error: 'Failed to rename file.' },
    );
    setUpdatedFileName('');
  };

  // Modal handlers
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openUploadModal = () => {
    setUploadModal(true);
    setFile([]);
  };
  const UploadCloseModal = () => {
    setUploadModal(false);
    setError('');
    setFile([]);
  };
  const LinkOpenModal = () => setLinkModalOpen(true);
  const LinkCloseModal = () => {
    setLinkModalOpen(false);
    setLinkError('');
  };
  const RenameOpenModal = (doc: FileItem) => {
    setSelectedDoc(doc);
    setRenameModalOpen(true);
    setUpdatedFolderName(doc.name);
  };

  const RenameCloseModal = () => {
    setRenameModalOpen(false);
    setUpdatedFolderName('');
    setRenameFolderError('');
  };
  const FileRenameOpenModal = (doc: FileItem) => {
    setSelectedDoc(doc);
    setUpdatedFileName(doc.name);
    setFileRenameModalOpen(true);
  };
  const FileRenameCloseModal = () => {
    setFileRenameModalOpen(false);
    setUpdatedFileName('');
    setRenameFileError('');
  };

  // Share to contractor handlers
  const handleShareToContractor = (id: string | number, name: string) => {
    setSelectedDocForContractor({ id, name });
    setContractorDialogOpen(true);
  };

  const handleContractorSelected = () => {
    setContractorDialogOpen(false);
    setSelectedDocForContractor(null);
    refetch();
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

  const getFileType = (name?: string): FileType => {
    if (!name) return 'other';
    if (name.includes('png') || name.includes('jpg') || name.includes('jpeg') || name.includes('gif') || name.includes('webp'))
      return 'image';
    if (name.includes('pdf')) return 'pdf';
    if (name.includes('sheet') || name.includes('excel')) return 'spreadsheet';
    if (name.includes('word') || name.includes('document')) return 'document';
    if (name.includes('dwg') || name.includes('cad')) return 'cad';
    return 'other';
  };

  const handleChange = (e: any) => {
    const { value, checked } = e.target;

    setCheckedItems(prev => {
      let updatedItems = [...prev];
      if (checked && value) {
        if (value.link) {
          const exists = updatedItems.some(item => item.link === value.link);
          if (!exists) {
            updatedItems.push(value);
          }
        }
        if (value.metadata && value.metadata.mimetype) {
          const itemWithUrl = {
            ...value,
            url: value.url || value.file,
          };

          const exists = updatedItems.some(item => item.id === itemWithUrl.id);
          if (!exists) {
            updatedItems.push(itemWithUrl);
          }
        }
      } else {
        updatedItems = updatedItems.filter(item => item.create_time !== value.create_time || item.id !== value.id);
      }

      return updatedItems;
    });
  };

  // Update Product
  const sendDoctoClient = useMutation({
    mutationFn: (vars: any) => Promise.resolve(), // Feature disabled
    onSuccess: () => {
      toast.info('Feature not available');
      setButtonLoading(false);
      setCheckedItems([]);
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // NEW: normalize items and send (single or multiple), then optionally create chat
  const handleSendConfirmed = async (message?: string) => {
    setButtonLoading(true);
    try {
      // choose items: single selectedForSend (when opened per-file) or checkedItems (bulk)
      const itemsToSend = selectedForSend ? [selectedForSend] : checkedItems;
      if (!itemsToSend || itemsToSend.length === 0) {
        toast.error('No documents selected to send');
        return;
      }

      const updatedDocs = itemsToSend.map((item: any) => {
        // if it's a storage file without URL, use the file URL from backend
        if (item.metadata?.mimetype) {
          return {
            ...item,
            url: item.url || item.file,
          };
        }
        // for links or already-augmented items
        return { ...item };
      });

      // send documents
      await sendDoctoClient.mutateAsync({
        projectID: params.id,
        newDocs: updatedDocs,
      });

      // create chat if message provided (use document names or ids)
      if (message && message.trim()) {
        // handleCreateChat(message, updatedDocs); // Disabled or needs update
      }

      // success cleanup
      setCheckedItems([]);
      setSelectedForSend(null);
      setSentDialogOpen(false);
    } catch (err) {
      console.error('Send failed:', err);
      // errors handled via mutation toasts as well
    } finally {
      setButtonLoading(false);
    }
  };

  const filteredTotalDocs = React.useMemo(() => {
    let items = [...totalDocs];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => item.name?.toLowerCase().includes(q));
    }

    // Client access filter
    if (clientAccessFilter === 'shared') {
      items = items.filter(item => item.client_access === true);
    } else if (clientAccessFilter === 'not-shared') {
      items = items.filter(item => item.client_access !== true);
    }

    items.sort((a, b) => {
      // Keep folders at the top
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;

      const getDocSize = (doc: any) => {
        return doc.metadata?.size || doc.size || doc.file_size || 0;
      };

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

    return items;
  }, [searchQuery, totalDocs, sortBy, clientAccessFilter]);

  // Get all selectable items (non-folders only)
  // const selectableItems = useMemo(() => {
  //   return filteredTotalDocs.filter(doc => !doc.isFolder);
  // }, [filteredTotalDocs]);

  // Check if all selectable items are checked
  const isAllSelected = useMemo(() => {
    if (filteredTotalDocs.length === 0) return false;
    return filteredTotalDocs.every(item => checkedItems.some(checked => checked.id === item.id));
  }, [filteredTotalDocs, checkedItems]);

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all non-folder items
      const allSelectableWithUrls = filteredTotalDocs.map(item => ({
        ...item,
        url: item.url || (item as any).file,
      }));
      setCheckedItems(allSelectableWithUrls);
    } else {
      // Deselect all
      setCheckedItems([]);
    }
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

  const handleDocSendToClient = (id: string | number) => {
    if (!id) return;
    sendToClient(
      { url: `/documents/documents/${id}/update_client_access/`, data: { id: id } },
      {
        onSuccess: () => {
          toast.success('Document sent to client!');
          refetch();
        },
        onError: () => {
          toast.error('Failed to send document to client!');
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
        project_id: parseInt(params.id as string),
      },
    });
  };


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

  return (
    <div className="">
      <div className="space-y-6">
        {/* Breadcrumbs and Back */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => goUp()} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Up
            </button>
            <span className="text-gray-300">{'|'}</span>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink className="cursor-pointer" onClick={() => router.push(`/projects/${params.id}/docs`)}>
                    Files
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </BreadcrumbSeparator>
                {/* Build breadcrumb from API data */}
                {breadcrumbItems.map((item, idx) => {
                  const pathTo = folderIdArray.slice(0, idx + 1).join('/');
                  const isLast = idx === breadcrumbItems.length - 1;
                  return (
                    <span key={item.id} className="flex items-center">
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{item.isLoading ? '...' : item.name}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            onClick={() => router.push(`/projects/${params.id}/docs/folders/${pathTo}`)}
                            className="cursor-pointer"
                          >
                            {item.isLoading ? '...' : item.name}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {idx < breadcrumbItems.length - 1 && (
                        <BreadcrumbSeparator>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </BreadcrumbSeparator>
                      )}
                    </span>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Sharing Banner */}
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
        <div className="flex flex-col flex-col xl:flex-row items-center justify-center xl:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="pl-10 w-72"
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

        {(checkedItems.length < 1 && docsPermission) &&    <motion.div
              layout
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
            >
              <Button className="py-5" variant="outline" size="sm" onClick={openModal}>
                <FolderOpen className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </motion.div>}
         {docsPermission &&   <AnimatePresence mode="popLayout">
              {checkedItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
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
                    <FolderIcon className="w-4 h-4 mr-2" />
                    Move ({checkedItems.length})
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>}

           { docsPermission && <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
                  More
                  <ChevronDown className="ml-1 h-4 w-4 opacity-80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={LinkOpenModal}>{'Add Link'}</DropdownMenuItem>
                <DropdownMenuItem onSelect={openUploadModal}>{'Upload Files'}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>}
          </div>
        </div>

        {/* Grid View Loading Skeleton */}
        {viewMode === 'grid' && isLoading && (
          <div className="main-upload-section bg-white relative overflow-hidden min-h-[300px] rounded-xl border p-6 border-neutral-200 border-dashed">
            <h3 className="mb-4 text-sm font-medium text-neutral-900">Files & Folders</h3>
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
            className={`main-upload-section bg-white relative overflow-hidden min-h-[300px] rounded-xl border p-6 transition-all duration-200 ${
              isDraggingOver ? '' : 'border-neutral-200 border-dashed'
            }`}
            onDragOver={e => {
                if (e.dataTransfer.types.includes('Files')) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (docsPermission) setIsDraggingOver(true);
                }
            }}
            onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); }}
            onDrop={e => {
              if (e.dataTransfer.types.includes('Files')) {
                e.preventDefault();
                e.stopPropagation();
                setIsDraggingOver(false);
                if (!docsPermission) {
                  toast.error("You don't have permission to perform this action.");
                  return;
                }
                const droppedFiles = Array.from(e.dataTransfer.files);
                if (droppedFiles.some(file => file.size > MAX_FILE_SIZE)) {
                  setError('One or more files exceed the 50MB limit');
                  return;
                }
                const processedFiles = droppedFiles.map(file => Object.assign(file, {
                  preview: URL.createObjectURL(file),
                  originalName: file.name,
                  id: Math.random().toString(36).substring(2),
                })) as any[];
                setFile(prev => [...prev, ...processedFiles]);
                setError('');
                setUploadModal(true);
              }
            }}
          >
            {/* Drag overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {isDraggingOver && (
                <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center bg-white/50 backdrop-blur-[4px]">
                  <div className="text-center">
                    <Upload className="w-14 h-14 mx-auto mb-2 animate-bounce" />
                    <p className="text-lg font-semibold">Drop files here to upload</p>
                    <p className="text-xs text-gray-600 mt-1">Any file larger than 50MB will be rejected</p>
                  </div>
                </div>
              )}
            </div>

            {/* Empty state */}
            {filteredTotalDocs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-neutral-300">
                <FolderOpen className="w-12 h-12 text-neutral-300 mb-3" />
                <p className="text-sm text-neutral-500">{searchQuery ? `No results for "${searchQuery}", drop a file to upload` : 'No files attached, drop a file to upload'}</p>
              </div>
            )}

            {/* Grid content */}
            {filteredTotalDocs.length > 0 && (
              <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <h3 className="mb-4 text-sm font-medium text-neutral-900">Files & Folders</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Folders */}
                    {filteredTotalDocs.filter(doc => doc.isFolder).map((folder, folderIndex) => {
                      const isSelected = checkedItems.some(item => item.id === folder.id);
                      return (
                      <Tooltip key={folder.id} delayDuration={2000} open={docsPermission ? false : undefined}>
                      <TooltipTrigger asChild>
                      <div
                        onClick={(e) => {
                          const handled = handleGridItemClick(e, folder, folderIndex);
                          if (!handled) {
                            openFolder(folder);
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
                        className={`group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 transition-all duration-200 ${dragTargetId === folder.id ? 'ring-2 ring-neutral-900 bg-neutral-900/5 scale-[1.02]' : ''}`}
                        aria-label={`Open ${folder.name}`}
                      >
                        <Card className={`cursor-pointer rounded-xl border ${isSelected ? 'border-neutral-200 bg-[#efeae2]' : 'border-neutral-200 bg-white'} shadow-sm transition-all hover:shadow-md group-hover:border-neutral-300`}>
                          <CardContent title={folder?.name} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-1 w-full items-center gap-3">
                                <Folder className="h-5 w-5 flex-shrink-0 text-neutral-500" />
                                <div className="w-full flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium max-w-[200px] truncate text-neutral-900">{folder.name}</h4>
                                    {folder.client_access === true && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#5a554f] bg-[#efeae2] rounded flex-shrink-0">
                                        <Send className="w-2.5 h-2.5" />Shared
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-xs text-neutral-500">
                                    {folder.item_count > 0 && <span>{`${folder.item_count} ${folder.item_count > 1 ? 'items' : 'item'} • `}</span>}
                                    Modified {formatDate(folder.updated_at)}
                                  </p>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger className="flex-shrink-0" asChild onClick={e => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-neutral-400 flex-shrink-0 hover:text-neutral-600">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={e => { e.stopPropagation(); openFolder(folder); }}>
                                    <FolderOpen className="w-4 h-4 mr-2" />Open
                                  </DropdownMenuItem>
                                {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); RenameOpenModal(folder); }}>
                                    <Edit2 className="w-4 h-4 mr-2" />Rename
                                  </DropdownMenuItem>}
                                {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDocSendToClient(folder.id); }}>
                                    <Send className="w-4 h-4 mr-2" />Send to Client
                                  </DropdownMenuItem>}
                                  {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleShareToContractor(folder.id, folder.name); }}>
                                    <Users className="w-4 h-4 mr-2" />Share to Contractor
                                  </DropdownMenuItem>}
                                  {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedForMove({ ids: [folder.id], names: [folder.name], isFolder: true }); setMoveDialogOpen(true); }}>
                                    <FolderInput className="w-4 h-4 mr-2" />Move
                                  </DropdownMenuItem>}
                                 {docsDeletePermission &&  <DropdownMenuSeparator />}
                                  {docsDeletePermission && <DropdownMenuItem className="text-red-500" onClick={e => { e.stopPropagation(); setDeleteTarget({ id: folder.id, name: folder.name, isFolder: true }); setIsDeleteOpen(true); }}>
                                    <Trash2 className="w-4 h-4 mr-2" />Delete
                                  </DropdownMenuItem>}
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

                    {/* Files */}
                    {filteredTotalDocs.filter(doc => !doc.isFolder && doc.type !== 'LINK').map((file, fileIndex) => {
                      const folderCount = filteredTotalDocs.filter(doc => doc.isFolder).length;
                      const currentIndex = folderCount + fileIndex;
                      const isSelected = checkedItems.some(item => item.id === file.id);
                      return (
                      <Tooltip key={file.id} delayDuration={2000} open={docsPermission ? false : undefined}>
                      <TooltipTrigger asChild>
                      <div
                        onClick={(e) => {
                          const handled = handleGridItemClick(e, file, currentIndex);
                          if (!handled) {
                            handleClickDocs(file.url || '', file.name);
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
                        <Card title={file?.name} className={`cursor-pointer rounded-xl border ${isSelected ? 'border-neutral-200 bg-[#efeae2]' : 'border-neutral-200 bg-white'} shadow-sm transition-shadow hover:shadow-md`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getFileIcon(file?.name || '')}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-neutral-900 truncate max-w-[140px]">{file.name}</h4>
                                    {file.client_access === true && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#5a554f] bg-[#efeae2] rounded flex-shrink-0">
                                        <Send className="w-2.5 h-2.5" />Shared
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-xs text-neutral-500">Modified {formatDate(file.updated_at)}</p>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={e => { e.stopPropagation(); handleClickDocs(file.url || '', file.name); }}>
                                    <Eye className="w-4 h-4 mr-2" />Open
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={e => { e.stopPropagation(); downloadFile(file.url || '', file.name); }}>
                                    <ImageDownload className="w-4 h-4 mr-2" />Download
                                  </DropdownMenuItem>
                            {docsPermission &&      <DropdownMenuItem onClick={e => { e.stopPropagation(); FileRenameOpenModal(file); }}>
                                    <Edit2 className="w-4 h-4 mr-2" />Rename
                                  </DropdownMenuItem>}
                                {docsPermission &&  <DropdownMenuItem onClick={e => { e.stopPropagation(); handleOpenUpdateModal({ id: file.id, name: file.name }); }}>
                                    <RefreshCw className="w-4 h-4 mr-2" />Update
                                  </DropdownMenuItem>}
                                {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDocSendToClient(file.id); }}>
                                    <Send className="w-4 h-4 mr-2" />Send to Client
                                  </DropdownMenuItem>}
                                {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleShareToContractor(file.id, file.name); }}>
                                    <Users className="w-4 h-4 mr-2" />Share to Contractor
                                  </DropdownMenuItem>}
                                {docsPermission &&  <DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedForMove({ ids: [file.id], names: [file.name], isFolder: false }); setMoveDialogOpen(true); }}>
                                    <FolderInput className="w-4 h-4 mr-2" />Move
                                  </DropdownMenuItem>}
                                  {docsDeletePermission && <DropdownMenuSeparator />}
                                  {docsDeletePermission && <DropdownMenuItem className="text-red-500" onClick={e => { e.stopPropagation(); setDeleteTarget({ id: file.id, name: file.name, isFolder: false }); setIsDeleteOpen(true); }}>
                                    <Trash2 className="w-4 h-4 mr-2" />Delete
                                  </DropdownMenuItem>}
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

                    {/* Links */}
                    {filteredTotalDocs.filter(doc => doc.type === 'LINK').map((link, linkIndex) => {
                      const folderCount = filteredTotalDocs.filter(doc => doc.isFolder).length;
                      const fileCount = filteredTotalDocs.filter(doc => !doc.isFolder && doc.type !== 'LINK').length;
                      const currentIndex = folderCount + fileCount + linkIndex;
                      const isSelected = checkedItems.some(item => item.id === link.id);

                      return (
                        <Tooltip key={link.id} delayDuration={2000} open={docsPermission ? false : undefined}>
                        <TooltipTrigger asChild>
                        <div
                          onClick={(e) => {
                            const handled = handleGridItemClick(e, link, currentIndex);
                            if (!handled) {
                              window.open(link.url, '_blank');
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
                          aria-label={`Open ${link.name}`}
                        >
                          <Card title={link.name} className={`cursor-pointer rounded-xl border ${isSelected ? 'border-neutral-200 bg-[#efeae2]' : 'border-neutral-200 bg-white'} shadow-sm transition-shadow hover:shadow-md`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <LinkIcon className="h-5 w-5" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-neutral-900 truncate max-w-[140px]">{link.name || link.url}</h4>
                                    {link.client_access === true && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#5a554f] bg-[#efeae2] rounded flex-shrink-0">
                                        <Send className="w-2.5 h-2.5" />Shared
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-xs text-neutral-400 truncate max-w-[200px]">{link.url}</p>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={e => { e.stopPropagation(); window.open(link.url, '_blank'); }}>
                                    <SquareArrowOutUpRight className="w-4 h-4 mr-2" />Open Link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(link.url || ''); toast.success('Copied!'); }}>
                                    <Copy className="w-4 h-4 mr-2" />Copy Link
                                  </DropdownMenuItem>
                               {docsPermission &&   <DropdownMenuItem onClick={e => { e.stopPropagation(); FileRenameOpenModal(link); }}>
                                    <Edit2 className="w-4 h-4 mr-2" />Rename
                                  </DropdownMenuItem>}
                                {docsPermission &&  <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDocSendToClient(link.id); }}>
                                    <Send className="w-4 h-4 mr-2" />Send to Client
                                  </DropdownMenuItem>}
                                {docsPermission &&  <DropdownMenuItem onClick={e => { e.stopPropagation(); handleShareToContractor(link.id, link.name); }}>
                                    <Users className="w-4 h-4 mr-2" />Share to Contractor
                                  </DropdownMenuItem>}
                                {docsPermission &&  <DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedForMove({ ids: [link.id], names: [link.name], isFolder: false }); setMoveDialogOpen(true); }}>
                                    <FolderInput className="w-4 h-4 mr-2" />Move
                                  </DropdownMenuItem>}
                          {docsDeletePermission &&        <DropdownMenuSeparator />}
                               {docsDeletePermission &&   <DropdownMenuItem className="text-red-500" onClick={e => { e.stopPropagation(); setDeleteTarget({ id: link.id, name: link.name, isFolder: false }); setIsDeleteOpen(true); }}>
                                    <Trash2 className="w-4 h-4 mr-2" />Delete
                                  </DropdownMenuItem>}
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

            {/* Drop zone hint */}
            {docsPermission && filteredTotalDocs.length > 0 && (
              <div className="rounded-xl mt-10 border-1 border-dashed flex flex-col items-center justify-center p-8 transition-all duration-200">
                <UploadIcon className="w-10 h-10 text-neutral-400 mb-2" />
                <p className="text-sm font-medium text-neutral-600">Drop files here to upload</p>
                <p className="text-xs text-neutral-500 mt-1">or click "Upload Files" button</p>
              </div>
            )}
          </motion.div>
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

        {/* Files List (Table View) */}
        {viewMode === 'list' && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={`bg-white relative border rounded-xl shadow-sm overflow-hidden  transition-all duration-200 ${
                isDraggingOver ? ' border-solid bg-blue-50' : 'border-gray-200'
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
                const droppedFiles = Array.from(e.dataTransfer.files);
                if (droppedFiles.some(file => file.size > MAX_FILE_SIZE)) {
                setError('One or more files exceed the 50MB limit');
                return;
                }
                const processedFiles = droppedFiles.map(file => {
                return Object.assign(file, {
                    preview: URL.createObjectURL(file),
                    originalName: file.name,
                    id: Math.random().toString(36).substring(2),
                });
                }) as any[];
                setFile(prev => [...prev, ...processedFiles]);
                setError('');
                setUploadModal(true);
            }
          }}
        >
          {/* Drag overlay */}
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
          <CardContent className="p-0">
            {filteredTotalDocs.length > 0 ? (
              <div className="relative overflow-x-auto scrollbar scrollbar-thin">
                <table className="min-w-full table-fixed">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <th scope="col" className="w-10 px-4 py-3">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          disabled={filteredTotalDocs?.length === 0}
                        />
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        File
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Type
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Created
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Modified
                      </th>
                      <th scope="col" className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                        Shared
                      </th>
                      {/* <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Owner
                    </th> */}
                      <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {!isLoading &&
                      filteredTotalDocs
                        .filter(doc => doc.type !== 'LINK')
                        ?.map((doc, index) => {
                          const isSelected = checkedItems.some(item => item.id === doc.id);
                          return (
                          <tr
                            onClick={() => {
                              if (doc.isFolder) {
                                openFolder(doc);
                              } else {
                                handleClickDocs(doc.url || '', doc.name);
                              }
                            }}
                            key={doc.id}
                            draggable={docsPermission}
                            onDragStart={e => {
                                if (!docsPermission) {
                                  e.preventDefault();
                                  toast.error("You don't have permission to perform this action.");
                                  return;
                                }
                                e.dataTransfer.setData('documentid', String(doc.id));
                                e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={e => {
                                if (doc.isFolder && e.dataTransfer.types.some(t => t.toLowerCase() === 'documentid')) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.dataTransfer.dropEffect = 'move';
                                    if (dragTargetId !== doc.id) setDragTargetId(doc.id);
                                }
                            }}
                            onDragEnter={e => {
                                if (doc.isFolder && e.dataTransfer.types.some(t => t.toLowerCase() === 'documentid')) {
                                    setDragTargetId(doc.id);
                                }
                            }}
                            onDragLeave={() => {
                                setDragTargetId(null);
                            }}
                            onDrop={async e => {
                                if (doc.isFolder) {
                                    setDragTargetId(null);
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!docsPermission) {
                                      toast.error("You don't have permission to perform this action.");
                                      return;
                                    }
                                    const draggedId = e.dataTransfer.getData('documentid');
                                    if (draggedId && draggedId !== String(doc.id)) {
                                        const idsToMove = checkedItems.some(item => String(item.id) === draggedId)
                                            ? checkedItems.map(item => Number(item.id))
                                            : [Number(draggedId)];

                                        await toast.promise(
                                          moveMutation.mutateAsync({
                                            document_ids: idsToMove,
                                            parent_id: Number(doc.id),
                                          }),
                                          { loading: 'Moving...', success: 'Moved successfully!', error: 'Failed to move. Please try again.' },
                                        );
                                    }
                                }
                            }}
                            className={`hover:bg-stone-50 cursor-pointer transition-all duration-200 ${isSelected ? 'bg-[#efeae2]' : ''} ${dragTargetId === doc.id ? 'bg-neutral-900/10 ring-2 ring-inset ring-neutral-900/20 shadow-sm' : ''}`}
                          >
                             {!doc.isFolder ? (
                         <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <Checkbox
                              key={doc.id}
                              value={doc.id}
                              checked={!!checkedItems.find(items => items.id == doc.id)}
                              onCheckedChange={checked =>
                                handleChange({
                                  target: { value: doc, checked },
                                })
                              }
                            />
                        
                        </td> ) : (
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <Checkbox
                              key={doc.id}
                              value={doc.id}
                              checked={isSelected}
                              onCheckedChange={checked =>
                                handleChange({
                                  target: { value: doc, checked },
                                })
                              }
                            />
                          </td>
                        ) }
                            <td className="px-4 py-3">
                              <Tooltip delayDuration={2000} open={docsPermission ? false : undefined}>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex-shrink-0">
                                      {doc.isFolder ? (
                                        <FolderIcon className="w-4 h-4 text-gray-500" />
                                      ) : (
                                        getFileIcon(doc?.name || '')
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div
                                        className={`text-sm flex flex-col cursor-pointer  font-medium text-gray-900 truncate`}
                                        title={doc.name}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="truncate">{doc.name}</span>
                                        </div>
                                        {doc.item_count > 0 && (
                                          <span className=" text-xs text-gray-500">
                                            {doc.item_count} {doc.item_count > 1 ? 'items' : 'item'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top"><p>View Only</p></TooltipContent>
                              </Tooltip>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{doc.isFolder ? 'Folder' : getFileType(doc?.name)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(doc.created_at)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(doc.updated_at)}</td>
                            
                                <td className="px-4 py-3 text-center text-sm text-gray-600">
                                  {doc.client_access === true ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center w-4 h-4 text-[10px] font-medium text-white bg-[#0f1729] rounded-full justify-center flex-shrink-0">
                                          <Check strokeWidth={3} className="w-2.5 h-2.5" />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        Shared to client
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                           <Tooltip>
                                      <TooltipTrigger asChild>
                                       <button>-</button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        Not shared to client
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </td>
                            {/* <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={`/placeholder.svg?height=20&width=20&query=owner-avatar`} />
                              <AvatarFallback className="bg-gray-900 text-white text-[10px] font-semibold">TS</AvatarFallback>
                            </Avatar>
                            <span className="truncate">Team</span>
                          </div>
                        </td> */}
                            <td className="px-4 py-3 pr-6 text-right">
                              <div className="inline-flex items-center gap-1">
                                {!doc.isFolder && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
                                      aria-label="Preview"
                                      onClick={() => handleClickDocs(doc.url || '', doc.name)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
                                      aria-label="Download"
                                      onClick={() => downloadFile(doc.url || '', doc.name)}
                                    >
                                      <ImageDownload className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
                                      aria-label="More"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        if (doc.isFolder) {
                                          openFolder(doc);
                                        } else {
                                          handleClickDocs(doc.url || '', doc.name);
                                        }
                                      }}
                                    >
                                      {doc.isFolder ? (
                                        <FolderOpen className="w-4 h-4 mr-2" />
                                      ) : (
                                        <Eye className="w-4 h-4 mr-2" />
                                      )}
                                      Open
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={e => {
                                        e.stopPropagation();
                                        downloadFile(doc.url || '', doc.name);
                                      }}
                                    >
                                      <ImageDownload className="w-4 h-4 mr-2" />
                                      Download
                                    </DropdownMenuItem>
                                    {doc.isFolder ? (
                                      docsPermission &&  <DropdownMenuItem
                                        onClick={e => {
                                          e.stopPropagation();
                                          RenameOpenModal(doc);
                                        }}
                                      >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Rename
                                      </DropdownMenuItem>
                                    ) : (
                                    docsPermission && <DropdownMenuItem
                                        onClick={e => {
                                          e.stopPropagation();
                                          FileRenameOpenModal(doc);
                                        }}
                                      >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Rename
                                      </DropdownMenuItem>
                                    )}

                                    {/* Update option - only for files, not folders or links */}
                                    {!doc.isFolder && doc.type !== 'LINK' && (
                                      docsPermission && <DropdownMenuItem
                                        onClick={e => {
                                          e.stopPropagation();
                                          handleOpenUpdateModal({ id: doc.id, name: doc.name });
                                        }}
                                      >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Update
                                      </DropdownMenuItem>
                                    )}
{docsPermission &&  <DropdownMenuItem
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleDocSendToClient(doc.id);
                                      }}
                                    >
                                      <Send className="w-4 h-4 mr-2" />
                                      Send to Client
                                    </DropdownMenuItem> }
                                    {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleShareToContractor(doc.id, doc.name); }}>
                                      <Users className="w-4 h-4 mr-2" />Share to Contractor
                                    </DropdownMenuItem>}
                                   {docsPermission && <DropdownMenuItem
                                      onClick={e => {
                                        e.stopPropagation();
                                        setSelectedForMove({
                                          ids: [doc.id],
                                          names: [doc.name],
                                          isFolder: doc.isFolder,
                                        });
                                        setMoveDialogOpen(true);
                                      }}
                                    >
                                      <FolderInput className="w-4 h-4 mr-2" />
                                      Move
                                    </DropdownMenuItem>}
                                  {docsDeletePermission &&  <DropdownMenuSeparator />}

                                {docsDeletePermission &&    <DropdownMenuItem
                                      className="text-red-500"
                                      onClick={e => {
                                        e.stopPropagation();
                                        setDeleteTarget({
                                          id: doc.id,
                                          name: doc.name,
                                          isFolder: doc.isFolder,
                                        });
                                        setIsDeleteOpen(true);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        );
                        })}

                    {/* Links */}
                    {!isLoading &&
                      filteredTotalDocs
                        .filter(doc => doc.type == 'LINK')
                        ?.map((doc, index) => {
                          const isSelected = checkedItems.some(item => item.id === doc.id);
                          return (
                          <tr
                            key={doc.id}
                            className={`hover:bg-stone-50 ${isSelected ? 'bg-[#efeae2]' : ''}`}
                            draggable={docsPermission}
                            onDragStart={e => {
                              if (!docsPermission) {
                                e.preventDefault();
                                toast.error("You don't have permission to perform this action.");
                                return;
                              }
                              e.dataTransfer.setData('documentid', String(doc.id));
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                          >
                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <Checkbox
                            key={doc.id}
                            value={doc.id}
                            checked={!!checkedItems.find(items => items.id == doc.id)}
                            onCheckedChange={checked =>
                              handleChange({
                                target: { value: doc, checked },
                              })
                            }
                          />
                        </td>
                            <td className="px-4 py-3">
                              <Tooltip delayDuration={2000} open={docsPermission ? false : undefined}>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex-shrink-0">
                                      <LinkIcon className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="min-w-0 flex items-center gap-2">
                                      <Link
                                        href={doc.url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm cursor-pointer hover:underline font-medium text-gray-900 truncate"
                                        title={doc.name}
                                      >
                                        {doc.name}
                                      </Link>
                                      {doc.client_access === true && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#5a554f] bg-[#efeae2] rounded flex-shrink-0">
                                          <Send className="w-2.5 h-2.5" />
                                          Shared
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top"><p>View Only</p></TooltipContent>
                              </Tooltip>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">Link</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(doc?.created_at)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(doc?.updated_at)}</td>
                         
                                <td className="px-4 py-3 text-center text-sm text-gray-600">
                                  {doc.client_access === true ? (
                                       <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center w-4 h-4 text-[10px] font-medium text-white bg-[#0f1729] rounded-full justify-center flex-shrink-0">
                                          <Check strokeWidth={3} className="w-2.5 h-2.5" />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        Shared to client
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                              <Tooltip>
                                      <TooltipTrigger asChild>
                                       <button>-</button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" >
                                        Not shared to client
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </td>
                            <td className="px-4 py-3 pr-6 text-right">
                              <div className="inline-flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8  h-8 p-0 text-gray-400 hover:text-gray-600"
                                  aria-label="Preview"
                                  // onClick={() => handleClickDocs(doc.url || '', doc.name)}
                                >
                                  <Link
                                    className="w-8 flex items-center justify-center h-8 p-0 text-gray-400 hover:text-gray-600 rounded-md hover:bg-stone-100"
                                    aria-label="Preview"
                                    href={doc?.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <SquareArrowOutUpRight className="w-4 h-4" />
                                  </Link>
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
                                      aria-label="More"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={e => {
                                        e.stopPropagation();
                                        window.open(doc.url, '_blank');
                                      }}
                                    >
                                      <SquareArrowOutUpRight className="w-4 h-4 mr-2" />
                                      Open Link
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={e => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(doc.url || '');
                                        toast.success('Copied !');
                                      }}
                                    >
                                      <Copy className="w-4 h-4 mr-2" />
                                      Copy Link
                                    </DropdownMenuItem>
                                    {doc.isFolder ? (docsPermission &&
                                      <DropdownMenuItem
                                        onClick={e => {
                                          e.stopPropagation();
                                          RenameOpenModal(doc);
                                        }}
                                      >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Rename
                                      </DropdownMenuItem>
                                    ) : (docsPermission &&
                                      <DropdownMenuItem
                                        onClick={e => {
                                          e.stopPropagation();
                                          FileRenameOpenModal(doc);
                                        }}
                                      >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Rename
                                      </DropdownMenuItem>
                                    )}

                                    {/* Update option - only for files, not folders or links */}
                                    {!doc.isFolder && doc.type !== 'LINK' && docsPermission && (
                                      <DropdownMenuItem
                                        onClick={e => {
                                          e.stopPropagation();
                                          handleOpenUpdateModal({ id: doc.id, name: doc.name });
                                        }}
                                      >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Update
                                      </DropdownMenuItem>
                                    )}

                                    {docsPermission && <DropdownMenuItem
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleDocSendToClient(doc.id);
                                      }}
                                    >
                                      <Send className="w-4 h-4 mr-2" />
                                      Send to Client
                                    </DropdownMenuItem> }
                                   {docsPermission && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleShareToContractor(doc.id, doc.name); }}>
                                      <Users className="w-4 h-4 mr-2" />Share to Contractor
                                    </DropdownMenuItem>}
                                    {docsPermission && <DropdownMenuItem
                                      onClick={e => {
                                        e.stopPropagation();
                                        setSelectedForMove({
                                          ids: [doc.id],
                                          names: [doc.name],
                                          isFolder: false,
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
                                          id: doc.id,
                                          name: doc.name,
                                          isFolder: doc.isFolder,
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
                            </td>
                          </tr>
                        );
                        })}
                  </tbody>
                </table>
                {!isLoading && filteredTotalDocs?.length === 0 && (
                  <div className="p-8 text-center text-sm text-gray-500">
                    No files in this folder yet. Drop a file to upload or use the Upload button.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-[80px] bg-white rounded-xl">
                <FolderOpen className="w-12 h-12 text-neutral-300 mb-3" />
               <p className="text-sm text-neutral-500">{searchQuery ? `No results for "${searchQuery}", drop a file to upload` : 'No files attached, drop a file to upload'}</p>
              </div>
            )}

            {/* Drop Zone Indicator */}
            {/* {!isLoading && filteredTotalDocs?.length > 0 && (
              <div
                className={`rounded-xl mt-10  border-1 border-dashed flex flex-col items-center justify-center p-8 transition-all duration-200 `}
              >
                <UploadIcon className="w-10 h-10 text-neutral-400 mb-2" />
                <p className="text-sm font-medium text-neutral-600">Drop files here to upload</p>
                <p className="text-xs text-neutral-500 mt-1">or click "Upload Files" button</p>
              </div>
            )} */}
          </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

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
                  handleCreateFolder();
                }
              }}
              maxLength={100}
            />
            {newFolderError && <p className="text-xs text-red-500 font-medium">{newFolderError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
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
                handleCreateFolder();
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
          if (!open) UploadCloseModal();
          else setUploadModal(true);
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5" />
              Upload Documents
            </DialogTitle>
            <DialogDescription>Upload files to this folder. You can select multiple files at once.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-stone-50 transition-all"
            >
              <input id="fileInput" type="file" multiple onChange={handleSelectByClick} className="hidden" />
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
            {file.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Selected Files ({file.length})</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      file.forEach(file => {
                        if ((file as any).preview) URL.revokeObjectURL((file as any).preview);
                      });
                      setFile([]);
                      setRenamingIndex(-1);
                    }}
                    className="h-8 text-xs"
                  >
                    Clear All
                  </Button>
                </div>

                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                  {file.map((file, index) => (
                    <div
                      key={(file as any).id || index}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:bg-stone-100 transition-colors"
                    >
                      {renamingIndex === index ? (
                        <div className="flex items-center flex-1">
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
                        <>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium max-w-[400px] text-gray-900 truncate">
                                {(file as any).customName || (file as any).name}
                              </p>
                              <p className="text-xs text-gray-500">{((file as any).size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleStartRenaming(index, file)} className="h-8 w-8 p-0">
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={UploadCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleFileChange} disabled={file.length === 0 || uploading || renamingIndex !== -1}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Upload {file.length > 0 && `(${file.length})`}
                </>
              )}
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
            <Button
              onClick={() => {
                if (!updatedFolderName.trim()) {
                  setRenameFolderError('Folder name cannot be empty');
                  return;
                }
                if (updatedFolderName.length > MAX_FOLDER_NAME_LENGTH) {
                  setRenameFolderError(`Folder name cannot exceed ${MAX_FOLDER_NAME_LENGTH} characters`);
                  return;
                }
                handleRenameFolder();
              }}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Document Viewer Dialog */}
      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-[95vw] h-[90vh] p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <DialogTitle className="text-lg py-2 font-semibold">
              {/* {currentDoc && (currentDoc as any)[0]?.fileName ? (currentDoc as any)[0].fileName : 'Document Viewer'} */}
            </DialogTitle>
            {/* <div className="flex items-center gap-2">
              {currentDoc && (currentDoc as any)[0]?.fileName && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadFile((currentDoc as any)[0].uri, (currentDoc as any)[0].fileName)}
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
          if (!v) {
            setSelectedForSend(null);
          }
        }}
        itemName={
          selectedForSend
            ? selectedForSend?.name
            : checkedItems.length === 1
              ? checkedItems[0].name || checkedItems[0].id
              : checkedItems.length > 1
                ? `${checkedItems.length} items`
                : ''
        }
        onConfirm={async (message: string) => {
          await handleSendConfirmed(message);
        }}
      />

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
        plugins={[Zoom, Fullscreen]}
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
        currentParentId={Number(currentFolderId)}
        projectId={params.id}
        excludeFolderIds={selectedForMove?.isFolder ? selectedForMove.ids : []}
      />

      {/* Contractor Dialog */}
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
                id="update-file-input-folder"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setUpdateFile(file);
                }}
              />
              <label htmlFor="update-file-input-folder" className="cursor-pointer">
                {updateFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-green-600" />
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
                    <Upload className="w-8 h-8 text-neutral-400" />
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

export default function ProjectFolderPage({ params }: { params: { id: string; folderId: string | string[] } }) {
  return (
    <PermissionGuard permission="documents.view" redirectTo="/projects">
      <ProjectFolderPageContent params={params} />
    </PermissionGuard>
  );
}
