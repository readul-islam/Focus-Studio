import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/userUser';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Search,
  FolderIcon,
  FileText,
  MoreHorizontal,
  FileIcon,
  LinkIcon,
  CloudDownload,
  ArrowLeft,
  Download,
  Eye,
  ChevronRight,
  SquareArrowOutUpRight,
  Copy,
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
import { fetchData } from '@/lib/Api';

// Helper functions
const formatDate = (input: string | Date) => {
  const date = typeof input === 'string' ? new Date(input) : input;
  return date?.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

async function downloadFile(url: string, fileName: string) {
  try {
    toast.loading('Preparing download...', { id: 'download-toast' });

    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);

    toast.dismiss('download-toast');
    toast.success('Download started');
  } catch (error) {
    console.error('Download failed:', error);
    toast.dismiss('download-toast');
    toast.error('Download failed. The file may be opening in a new tab instead.');
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
}

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

const DocumentFolder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, project } = useUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<any>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  // Fetch folder content
  const {
    data: filesResp,
    isLoading,
  } = useFetch(`client_portal/documents/${id}/folder_content/`, {
    enabled: !!id,
  });

  // Fetch folder info for breadcrumb
  const { data: folderInfo } = useFetch(`client_portal/documents/${id}/`, {
    enabled: !!id,
  });

  const [breadcrumbPath, setBreadcrumbPath] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchBreadcrumbs = async () => {
      if (!folderInfo || String(folderInfo.id) !== String(id)) {
        setBreadcrumbPath([]);
        return;
      }

      if (!folderInfo.parent) {
        setBreadcrumbPath([]);
        return;
      }

      try {
        const path = [];
        let currentParentId = folderInfo.parent;
        let depth = 0;
        const MAX_DEPTH = 10; // Prevent infinite loops

        while (currentParentId && depth < MAX_DEPTH) {
          const parentData = await fetchData(`client_portal/documents/${currentParentId}/`);
          path.unshift(parentData);
          currentParentId = parentData.parent;
          depth++;
        }
        setBreadcrumbPath(path);
      } catch (error) {
        console.error('Failed to fetch breadcrumbs', error);
      }
    };

    fetchBreadcrumbs();
  }, [folderInfo, id]);

  const allItems = useMemo(() => {
    const list = filesResp || [];
    const items = Array.isArray(list) ? list : list.results || [];
    return items.map((item: any) => ({
      ...item,
      isFolder: item.type === 'FOLDER',
      url: item.file || item.link_url,
    }));
  }, [filesResp]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    const q = searchQuery.toLowerCase();
    return allItems.filter((item: any) => item.name?.toLowerCase().includes(q));
  }, [searchQuery, allItems]);

  const isImageFile = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const handleClickFile = (url: string, fileName: string) => {
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

  const handleFolderClick = (folderId: string) => {
    navigate(`/documents/folder/${folderId}`);
  };

  const goBack = () => {
    if (folderInfo?.parent) {
      navigate(`/documents/folder/${folderInfo.parent}`);
    } else {
      navigate('/documents');
    }
  };

  const copyLinkToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <DashboardLayout>
      <div className="flex-1 bg-gray-50 p-3 md:p-6 h-full">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          {/* Breadcrumbs and Back */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={goBack}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                Up
              </button>
              <span className="text-gray-300 flex-shrink-0">|</span>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink className="cursor-pointer text-xs md:text-sm" onClick={() => navigate('/documents')}>
                      Documents
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  {breadcrumbPath.map((bc: any) => (
                    <React.Fragment key={bc.id}>
                      <BreadcrumbSeparator>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </BreadcrumbSeparator>
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          className="cursor-pointer text-xs md:text-sm"
                          onClick={() => navigate(`/documents/folder/${bc.id}`)}
                        >
                          {bc.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}

                  {folderInfo && (
                    <>
                      <BreadcrumbSeparator>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </BreadcrumbSeparator>
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-xs md:text-sm">{folderInfo.name}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}

                  {!folderInfo && (
                    <>
                      <BreadcrumbSeparator>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </BreadcrumbSeparator>
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-xs md:text-sm">Loading...</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="pl-9 bg-white w-full"
                />
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <Card className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th scope="col" className="w-10 px-4 py-3"></th>
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
                      <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {!isLoading &&
                      filteredFiles.map((doc: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex-shrink-0">
                                {doc.isFolder ? (
                                  <FolderIcon className="w-4 h-4 text-gray-500" />
                                ) : doc.type === 'LINK' ? (
                                  <LinkIcon className="w-4 h-4 text-gray-500" />
                                ) : (
                                  getFileIcon(getFileType(doc.name))
                                )}
                              </div>
                              <div className="min-w-0">
                                <div
                                  onClick={() => {
                                    if (doc.isFolder) {
                                      handleFolderClick(doc.id);
                                    } else if (doc.type === 'LINK') {
                                      window.open(doc.url, '_blank');
                                    } else {
                                      handleClickFile(doc.url || '', doc.name);
                                    }
                                  }}
                                  className="text-sm cursor-pointer hover:underline font-medium text-gray-900 truncate"
                                  title={doc.name}
                                >
                                  {doc.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {doc.isFolder ? 'Folder' : doc.type === 'LINK' ? 'Link' : getFileType(doc.name)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(doc.created_at)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {formatDate(doc.updated_at || doc.created_at)}
                          </td>
                          <td className="px-4 py-3 pr-6 text-right">
                            <div className="inline-flex items-center gap-1">
                              {/* {!doc.isFolder && doc.type !== 'LINK' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
                                    aria-label="Preview"
                                    onClick={() => handleClickFile(doc.url || '', doc.name)}
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
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </>
                              )} */}
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
                                        handleFolderClick(doc.id);
                                      } else if (doc.type === 'LINK') {
                                        window.open(doc.url, '_blank');
                                      } else {
                                        handleClickFile(doc.url || '', doc.name);
                                      }
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Open
                                  </DropdownMenuItem>
                                  {!doc.isFolder && doc.type !== 'LINK' && (
                                    <DropdownMenuItem onClick={() => downloadFile(doc.url || '', doc.name)}>
                                      <Download className="w-4 h-4 mr-2" />
                                      Download
                                    </DropdownMenuItem>
                                  )}
                                  {doc.type === 'LINK' && (
                                    <>
                                      <DropdownMenuItem onClick={() => window.open(doc.url, '_blank')}>
                                        <SquareArrowOutUpRight className="w-4 h-4 mr-2" />
                                        Open Link
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => copyLinkToClipboard(doc.url)}>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy Link
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {!isLoading && filteredFiles.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                          No files found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {!isLoading &&
              filteredFiles.map((doc: any, index: number) => (
                <Card
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100"
                  onClick={() => {
                    if (doc.isFolder) {
                      handleFolderClick(doc.id);
                    } else if (doc.type === 'LINK') {
                      window.open(doc.url, '_blank');
                    } else {
                      handleClickFile(doc.url || '', doc.name);
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
                                handleClickFile(doc.url || '', doc.name);
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
                                downloadFile(doc.url || '', doc.name);
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
            {!isLoading && filteredFiles.length === 0 && (
              <div className="text-center py-12 text-gray-500">No files found.</div>
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => downloadFile(currentDoc[0].uri, currentDoc[0].fileName)}
                >
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
      </div>
    </DashboardLayout>
  );
};

export default DocumentFolder;
