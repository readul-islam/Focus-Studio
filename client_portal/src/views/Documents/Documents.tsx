import React, { useState, useMemo } from 'react';
import { useNavigate } from '@/lib/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/userUser';
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
  Link,
  FolderIcon,
  Eye
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
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import 'yet-another-react-lightbox/styles.css';
import '@cyntler/react-doc-viewer/dist/index.css';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Helmet } from 'react-helmet-async';

const getFileIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'image':
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <FileText className="w-4 h-4 text-gray-500" />;
    case 'pdf':
      return <FileText className="w-4 h-4 text-gray-500" />;
    case 'folder':
      return <FolderIcon className="w-4 h-4 text-gray-500" />;
    default:
      return <FileIcon className="w-4 h-4 text-gray-500" />;
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

// Helper function
function formatDate(dateString?: string) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
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

  const { user, project } = useUser();

  // Fetch documents (root only)
  const {
    data: filesResp,
    isLoading,
  } = useFetch(`client_portal/documents/root_documents/?project_id=${project?.project_id}`, {
    enabled: !!project?.project_id,
  });

  const allItems = useMemo(() => {
    const list = filesResp || [];
    const items = Array.isArray(list) ? list : (list.results || []);
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
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const openViewer = (url: string, name: string) => {
    console.log(url, name);
    if (isImageFile(url)) {
      // Open in lightbox for images
      setGalleryImages([{ src: url }]);
      setCurrentImageIndex(0);
      setLightboxOpen(true);
    } else {
      // Use DocViewer for other files
      setCurrentDoc([{ uri: url, fileName: name }]);
      setViewerOpen(true);
    }
  };

  const handleFolderClick = (id: any) => {
    navigate(`/documents/folder/${id}`);
  };

  const copyLinkToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleClickFile = (url: string, fileName: string) => {
    console.log(url, fileName);
    if (isImageFile(url)) {
      // Open in lightbox
      const allImageFiles = allItems.filter((item: any) => {
        if (item.isFolder || item.type === 'LINK') return false;
        return isImageFile(item.url || '');
      });

      const images = allImageFiles.map((file: any) => ({
        src: file.url || '',
        alt: file.name,
        title: file.name,
      }));

      const startIndex = allImageFiles.findIndex((file: any) => file.url === url);
      setGalleryImages(images);
      setCurrentImageIndex(startIndex >= 0 ? startIndex : 0);
      setLightboxOpen(true);
    } else {
      // Use DocViewer for documents
      setCurrentDoc([{ uri: url, fileName: fileName }]);
      setViewerOpen(true);
    }
  };



  return (
    <DashboardLayout>
       <Helmet title="Documents | TechStyle" />
      <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents…"
                className="bg-white pl-9"
              />
            </div>
          </div>

          {/* Content Grid */}
          <div className='hidden md:block'>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Folders */}
              {filteredFolders.map((folder: any) => (
                <div
                  key={`folder-${folder.id}`}
                  onClick={() => handleFolderClick(folder.id)}
                  className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                >
                  <Card className="cursor-pointer rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Folder className="h-5 w-5 text-gray-500" aria-hidden="true" />
                          <div>
                            <h4 className="font-medium text-gray-900">{folder.name}</h4>
                            <p className="mt-1 text-xs text-gray-500">
                              Updated{' '}
                              {folder.lastModified
                                ? formatDistanceToNow(new Date(folder.lastModified), { addSuffix: true })
                                : '-'}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                              aria-label="Folder actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFolderClick(folder.id);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Open
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* Files */}
              {filteredFiles.map((file: any) => {
                const url = file.url || '';
                return (
                  <div
                    key={`file-${file.id}`}
                    onClick={() => openViewer(url, file.name)}
                    className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                  >
                    <Card className="cursor-pointer rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <FileIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                            <div>
                              <h4 className="font-medium text-gray-900 truncate max-w-xs">{file.name}</h4>
                              <p className="mt-1 text-xs text-gray-500">
                                Updated{' '}
                                {file.lastModified
                                  ? formatDistanceToNow(new Date(file.lastModified), { addSuffix: true })
                                  : '-'}
                              </p>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openViewer(url, file.name);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Open
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadFile(url, file.name);
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}

              {/* Links */}
              {filteredLinks.map((link: any) => {
                const fileName = link.name || link.link_url?.split('/').pop() || 'Untitled Link';
                return (
                  <div
                    key={`link-${link.id}`}
                    onClick={() => window.open(link.link_url, '_blank')}
                    className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                  >
                    <Card className="cursor-pointer rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <LinkIcon className="h-5 w-5" aria-hidden="true" />
                            <div>
                              <h4 className="font-medium text-gray-900 truncate max-w-xs">{fileName}</h4>
                              <p className="mt-1 text-xs text-gray-400 truncate max-w-[200px]">{link.link_url}</p>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(link.link_url, '_blank');
                                }}
                              >
                                <SquareArrowOutUpRight className="h-4 w-4 mr-2" />
                                Open Link
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyLinkToClipboard(link.link_url);
                                }}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {!isLoading && filteredFolders.length === 0 && filteredFiles.length === 0 && filteredLinks.length === 0 && (
              <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FolderIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">No documents yet</h3>
                <p className="text-sm text-gray-500 max-w-xs">Your studio will share documents, drawings, and files here. Check back soon.</p>
              </div>
            )}
            {isLoading && (
              <div className="col-span-3 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gray-200 rounded" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {!isLoading &&
              filteredItems.map((doc: any, index: number) => (
                <Card
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100"
                  onClick={() => {
                    if (doc.isFolder) {
                      handleFolderClick(doc.id);
                    } else if (doc.type === 'LINK') {
                      window.open(doc.url, '_blank');
                    } else {
                      handleClickFile(doc.file || '', doc.name);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {doc.isFolder ? (
                          <FolderIcon className="w-5 h-5 text-gray-500" />
                        ) : doc.type === 'LINK' ? (
                          <LinkIcon className="w-5 h-5 text-gray-500" />
                        ) : (
                          getFileIcon(getFileType(doc.name))
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm break-words">
                          {doc.name}
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Type:</span>
                            <span className="font-medium">
                              {doc.isFolder ? 'Folder' : doc.type === 'LINK' ? 'Link' : getFileType(doc.name)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Created:</span>
                            <span className="font-medium">{formatDate(doc.created_at)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Modified:</span>
                            <span className="font-medium">{formatDate(doc.updated_at || doc.created_at)}</span>
                          </div>
                        </div>

                        {/* Action buttons for mobile */}
                        {!doc.isFolder && doc.type !== 'LINK' && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClickFile(doc.file || '', doc.name);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadFile(doc.file || '', doc.name);
                              }}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {!isLoading && filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <FolderIcon className="w-7 h-7 text-gray-400" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">No documents yet</h2>
                <p className="text-sm text-gray-500 max-w-xs">Your studio will share documents, drawings, and files here. Check back soon.</p>
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
            <h2 className="text-base font-semibold text-gray-900 truncate max-w-[80%]">{currentDoc?.[0]?.fileName}</h2>
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
    </DashboardLayout>
  );
};

export default Documents;
