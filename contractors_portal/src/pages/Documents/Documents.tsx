import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/userUser';
import { usePost } from '@/hooks/usePost';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Folder,
  FileText,
  MoreHorizontal,
  FileIcon,
  LinkIcon,
  CloudDownload,
  ArrowLeft,
  Download,
  SquareArrowOutUpRight,
  Copy,
  Link2,
  FolderIcon,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Modal from 'react-modal';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { PDFViewer } from '@/components/PDFViewer';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import 'yet-another-react-lightbox/styles.css';
import '@cyntler/react-doc-viewer/dist/index.css';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Helmet } from 'react-helmet-async';

const getFileIcon = (type: string, fileName?: string) => {
  const name = fileName?.toLowerCase() || '';

  // Check for specific file types based on extension
  if (name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)) {
    return <FileText className="w-5 h-5 text-gray-600" />;
  }
  if (name.match(/\.pdf$/i)) {
    return <FileText className="w-5 h-5 text-gray-600" />;
  }
  if (name.match(/\.(dwg|dxf|cad)$/i)) {
    return <FileIcon className="w-5 h-5 text-gray-600" />;
  }

  // Fallback to type checking
  switch (type?.toLowerCase()) {
    case 'image':
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <FileText className="w-5 h-5 text-gray-600" />;
    case 'pdf':
      return <FileText className="w-5 h-5 text-gray-600" />;
    case 'folder':
      return <FolderIcon className="w-5 h-5 text-gray-600" />;
    default:
      return <FileIcon className="w-5 h-5 text-gray-600" />;
  }
};

const getFileType = (name?: string): string => {
  if (!name) return 'File';
  if (name.match(/\\.(png|jpg|jpeg|gif|webp)$/i)) return 'Image';
  if (name.match(/\\.pdf$/i)) return 'PDF';
  if (name.match(/\\.(xls|xlsx|csv)$/i)) return 'Spreadsheet';
  if (name.match(/\\.(doc|docx)$/i)) return 'Document';
  return 'File';
};

// Helper function for nice date formatting
function formatDate(dateString?: string) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  // Format as "8 Mar 2026"
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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

const Documents = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<any>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [pdfLightboxOpen, setPdfLightboxOpen] = useState(false);
  const [galleryPdfs, setGalleryPdfs] = useState<any[]>([]);
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);

  const { user, project } = useUser();

  const { mutate: markViewedMutate } = usePost();

  const { data: filesResp, isLoading, refetch } = useFetch(`contractor_portal/documents/root_documents/?project_id=${project?.project_id}&contractor_id=${user?.id}`, {
    enabled: !!project?.project_id,
  });

  const handleMarkViewed = (id: number) => {
    markViewedMutate(
      { url: `contractor_portal/documents/${id}/mark_viewed/?contractor_id=${user?.id}`, data: {} },
      { onSuccess: () => refetch() },
    );
  };

  const allItems = useMemo(() => {
    const list = filesResp || [];
    const items = Array.isArray(list) ? list : list.results || [];
    return items.map((item: any) => ({ ...item, isFolder: item.type === 'FOLDER' }));
  }, [filesResp]);

  const derivedFolders = useMemo(() => {
    return allItems
      .filter((d: any) => d.isFolder)
      .map((f: any) => ({
        id: f.id,
        name: f.name,
        fileCount: 0,
        createdAt: f.created_at,
        lastModified: f.updated_at,
        isFolder: true,
        is_viewed: f.is_viewed,
        viewed_at: f.viewed_at,
      }));
  }, [allItems]);

  const derivedFiles = useMemo(() => {
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
        is_viewed: f.is_viewed,
        viewed_at: f.viewed_at,
      }));
  }, [allItems]);

  const derivedLinks = useMemo(() => {
    return allItems
      .filter((d: any) => d.type === 'LINK')
      .map((f: any) => ({
        id: f.id,
        name: f.name,
        link_url: f.link_url,
        createdAt: f.created_at,
        lastModified: f.updated_at,
        is_viewed: f.is_viewed,
        viewed_at: f.viewed_at,
      }));
  }, [allItems]);

  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return derivedFolders;
    return derivedFolders.filter((folder: any) => folder.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, derivedFolders]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return derivedFiles;
    return derivedFiles.filter((file: any) => file.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, derivedFiles]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    return allItems.filter((item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, allItems]);

  const filteredLinks = useMemo(() => {
    if (!searchQuery.trim()) return derivedLinks;
    const q = searchQuery.toLowerCase();
    return derivedLinks.filter((item: any) => item.name?.toLowerCase().includes(q) || item.link_url?.toLowerCase().includes(q));
  }, [searchQuery, derivedLinks]);

  // Check if file is an image
  const isImageFile = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const isPdfFile = (url: string) => url.toLowerCase().includes('.pdf');

  const openViewer = (url: string, name: string) => {
    if (isImageFile(url)) {
      setGalleryImages([{ src: url }]);
      setCurrentImageIndex(0);
      setLightboxOpen(true);
    } else if (isPdfFile(url)) {
      const allPdfFiles = allItems.filter((item: any) => {
        if (item.isFolder || item.type === 'LINK') return false;
        return isPdfFile(item.file || '');
      });
      const pdfs = allPdfFiles.map((f: any) => ({ src: f.file || '', alt: f.name }));
      const startIndex = allPdfFiles.findIndex((f: any) => f.file === url);
      setGalleryPdfs(pdfs.length ? pdfs : [{ src: url, alt: name }]);
      setCurrentPdfIndex(startIndex >= 0 ? startIndex : 0);
      setPdfLightboxOpen(true);
    } else {
      setCurrentDoc([{ uri: url, fileName: name }]);
      setViewerOpen(true);
    }
  };

  const handleFolderClick = (id: any) => {
    handleMarkViewed(id);
    navigate(`/documents/folder/${id}`);
  };

  const copyLinkToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handlePdfLightboxDownload = () => {
    const current = galleryPdfs[currentPdfIndex];
    if (current) downloadFile(current.src, current.alt || 'document.pdf');
  };

  const handleClickFile = (url: string, fileName: string) => {
    console.log(url, fileName);
    if (isImageFile(url)) {
      const allImageFiles = allItems.filter((item: any) => {
        if (item.isFolder || item.type === 'LINK') return false;
        return isImageFile(item.file || '');
      });
      const images = allImageFiles.map((file: any) => ({
        src: file.file || '',
        alt: file.name,
        title: file.name,
      }));
      const startIndex = allImageFiles.findIndex((file: any) => file.file === url);
      setGalleryImages(images);
      setCurrentImageIndex(startIndex >= 0 ? startIndex : 0);
      setLightboxOpen(true);
    } else if (isPdfFile(url)) {
      const allPdfFiles = allItems.filter((item: any) => {
        if (item.isFolder || item.type === 'LINK') return false;
        return isPdfFile(item.file || '');
      });
      const pdfs = allPdfFiles.map((f: any) => ({ src: f.file || '', alt: f.name }));
      const startIndex = allPdfFiles.findIndex((f: any) => f.file === url);
      setGalleryPdfs(pdfs.length ? pdfs : [{ src: url, alt: fileName }]);
      setCurrentPdfIndex(startIndex >= 0 ? startIndex : 0);
      setPdfLightboxOpen(true);
    } else {
      setCurrentDoc([{ uri: url, fileName: fileName }]);
      setViewerOpen(true);
    }
  };

  return (
    <DashboardLayout>
      <Helmet title="Documents | TechStyle" />
      <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search documents…"
                className="bg-white pl-9 border-gray-200"
              />
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block space-y-8">
            {/* Folders Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Folders</h2>
              {filteredFolders.length > 0 ? (
                <div className="space-y-2">
                  {filteredFolders.map((folder: any) => (
                    <div
                      key={`folder-${folder.id}`}
                      onClick={() => handleFolderClick(folder.id)}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Folder className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900 flex-1 min-w-0 truncate">{folder.name}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 flex-shrink-0">
                        Folder
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(folder.lastModified)}</span>
                      {folder.is_viewed ? (
                        <span className="inline-flex flex-col items-end flex-shrink-0">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" /> Viewed
                          </span>
                          {folder.viewed_at && <span className="text-xs text-gray-400 mt-0.5">{formatDate(folder.viewed_at)}</span>}
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleMarkViewed(folder.id); }}
                          className="text-xs text-gray-400 hover:text-emerald-700 flex-shrink-0"
                        >
                          Mark viewed
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleFolderClick(folder.id); }}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">No items</p>
              )}
            </div>

            {/* Files Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Files</h2>
              {filteredFiles.length > 0 ? (
                <div className="space-y-2">
                  {filteredFiles.map((file: any) => {
                    const url = file.url || '';
                    const fileType = getFileType(file.name);
                    return (
                      <div
                        key={`file-${file.id}`}
                        onClick={() => { handleMarkViewed(file.id); openViewer(url, file.name); }}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {getFileIcon(file.type, file.name)}
                        <span className="font-medium text-gray-900 flex-1 min-w-0 truncate">{file.name}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 flex-shrink-0">
                          {fileType}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(file.lastModified)}</span>
                        {file.is_viewed ? (
                          <span className="inline-flex flex-col items-end flex-shrink-0">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3" /> Viewed
                            </span>
                            {file.viewed_at && <span className="text-xs text-gray-400 mt-0.5">{formatDate(file.viewed_at)}</span>}
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleMarkViewed(file.id); }}
                            className="text-xs text-gray-400 hover:text-emerald-700 flex-shrink-0"
                          >
                            Mark viewed
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); downloadFile(url, file.name); }}
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleMarkViewed(file.id); openViewer(url, file.name); }}
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">No items</p>
              )}
            </div>

            {/* Links Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Links</h2>
              {filteredLinks.length > 0 ? (
                <div className="space-y-2">
                  {filteredLinks.map((link: any) => {
                    const fileName = link.name || link.link_url?.split('/').pop() || 'Untitled Link';
                    return (
                      <div
                        key={`link-${link.id}`}
                        onClick={() => { handleMarkViewed(link.id); window.open(link.link_url, '_blank'); }}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Link2 className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900 flex-1 min-w-0 truncate">{fileName}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 flex-shrink-0">
                          Link
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(link.lastModified)}</span>
                        {link.is_viewed ? (
                          <span className="inline-flex flex-col items-end flex-shrink-0">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3" /> Viewed
                            </span>
                            {link.viewed_at && <span className="text-xs text-gray-400 mt-0.5">{formatDate(link.viewed_at)}</span>}
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleMarkViewed(link.id); }}
                            className="text-xs text-gray-400 hover:text-emerald-700 flex-shrink-0"
                          >
                            Mark viewed
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleMarkViewed(link.id); window.open(link.link_url, '_blank'); }}
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          <SquareArrowOutUpRight className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">No items</p>
              )}
            </div>

            {/* Empty State */}
            {!isLoading && filteredFolders.length === 0 && filteredFiles.length === 0 && filteredLinks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">No documents found</p>
              </div>
            )}
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {!isLoading &&
              filteredItems.map((doc: any, index: number) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100"
                  onClick={() => {
                    if (doc.isFolder) {
                      handleFolderClick(doc.id);
                    } else if (doc.type === 'LINK') {
                      handleMarkViewed(doc.id);
                      window.open(doc.link_url, '_blank');
                    } else {
                      handleMarkViewed(doc.id);
                      handleClickFile(doc.file || '', doc.name);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {doc.isFolder ? (
                        <Folder className="w-5 h-5 text-gray-600" />
                      ) : doc.type === 'LINK' ? (
                        <Link2 className="w-5 h-5 text-gray-600" />
                      ) : (
                        getFileIcon(doc.type, doc.name)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm break-words">{doc.name}</div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            {doc.isFolder ? 'Folder' : doc.type === 'LINK' ? 'Link' : getFileType(doc.name)}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(doc.created_at)}</span>
                          {doc.is_viewed && (
                            <span className="inline-flex flex-col">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                                <CheckCircle2 className="w-3 h-3" /> Viewed
                              </span>
                              {doc.viewed_at && <span className="text-xs text-gray-400 mt-0.5 pl-1">{formatDate(doc.viewed_at)}</span>}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons for mobile */}
                      <div className="flex gap-2 mt-3">
                        {!doc.is_viewed && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={e => { e.stopPropagation(); handleMarkViewed(doc.id); }}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Mark viewed
                          </Button>
                        )}
                        {!doc.isFolder && doc.type !== 'LINK' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={e => { e.stopPropagation(); handleMarkViewed(doc.id); handleClickFile(doc.file || '', doc.name); }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={e => { e.stopPropagation(); downloadFile(doc.file || '', doc.name); }}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {!isLoading && filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">No documents found</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Viewer Modal */}
        <Modal
          className="!h-[90vh] !max-w-[1200px] !py-7 outline-none bg-white rounded-lg shadow-xl mx-auto mt-10 p-4 relative"
          isOpen={viewerOpen}
          onRequestClose={() => setViewerOpen(false)}
          contentLabel="Document Viewer"
          style={{
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              zIndex: 1000,
            },
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 truncate max-w-[80%]">{currentDoc?.[0]?.fileName}</h3>
            <div className="flex items-center gap-2">
              {currentDoc && (
                <Button variant="ghost" size="icon" onClick={() => downloadFile(currentDoc[0].uri, currentDoc[0].fileName)}>
                  <CloudDownload className="h-5 w-5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setViewerOpen(false)}>
                <span className="text-xl">&times;</span>
              </Button>
            </div>
          </div>
          <div className="h-[calc(100%-60px)] w-full">
            {currentDoc && <DocViewer documents={currentDoc} pluginRenderers={DocViewerRenderers} />}
          </div>
        </Modal>

        {/* Lightbox for images */}
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={galleryImages}
          index={currentImageIndex}
          plugins={[Zoom, Fullscreen]}
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
            slide: ({ slide }) => <PDFViewer url={(slide as any).src} fileName={(slide as any).alt || 'Document'} />,
          }}
          animation={{ fade: 300 }}
          carousel={{ finite: true }}
          controller={{ closeOnBackdropClick: true }}
          toolbar={{
            buttons: [
              <button key="download" type="button" className="yarl__button" onClick={handlePdfLightboxDownload}>
                <Download className="h-6 w-6" />
              </button>,
              'close',
            ],
          }}
        />
    </DashboardLayout>
  );
};

export default Documents;
