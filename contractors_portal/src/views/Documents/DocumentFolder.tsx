import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from '@/lib/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/userUser';
import { usePost } from '@/hooks/usePost';
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
import { fetchData } from '@/lib/Api';
import { useTranslations } from 'next-intl';
import { useFileTypeLabel, useShortDate } from '@/lib/i18n-helpers';

const getFileIcon = (type: string, fileName?: string) => {
  const name = fileName?.toLowerCase() || '';

  if (name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)) {
    return <FileText className="w-4 h-4 text-gray-500" />;
  }
  if (name.match(/\.pdf$/i)) {
    return <FileText className="w-4 h-4 text-gray-500" />;
  }
  if (name.match(/\.(dwg|dxf|cad)$/i)) {
    return <FileIcon className="w-4 h-4 text-gray-500" />;
  }

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

const DocumentFolder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, project } = useUser();
  const t = useTranslations('documents');
  const tc = useTranslations('common');
  const labelFile = useFileTypeLabel();
  const formatDate = useShortDate();

  const downloadFile = async (url: string, fileName: string) => {
    try {
      toast.loading(t('preparingDownload'), { id: 'download-toast' });

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

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      toast.dismiss('download-toast');
      toast.success(t('downloadStarted'));
    } catch (error) {
      console.error('Download failed:', error);
      toast.dismiss('download-toast');
      toast.error(t('downloadFailedTab'));
      window.open(url, '_blank');
    }
  };

  const { mutate: markViewedMutate } = usePost();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<any>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [pdfLightboxOpen, setPdfLightboxOpen] = useState(false);
  const [galleryPdfs, setGalleryPdfs] = useState<any[]>([]);
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);

  // Fetch folder content
  const {
    data: filesResp,
    isLoading,
    refetch,
  } = useFetch(`contractor_portal/documents/${id}/folder_content/?contractor_id=${user?.id}`, {
    enabled: !!id,
  });

  const handleMarkViewed = (docId: number | string) => {
    markViewedMutate(
      { url: `contractor_portal/documents/${docId}/mark_viewed/?contractor_id=${user?.id}`, data: {} },
      { onSuccess: () => refetch() },
    );
  };

  // Fetch folder info for breadcrumb
  const { data: folderInfo } = useFetch(`contractor_portal/documents/${id}/?contractor_id=${user?.id}`, {
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
          const parentData = await fetchData(`contractor_portal/documents/${currentParentId}/?contractor_id=${user?.id}`);
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

  const isPdfFile = (url: string) => url.toLowerCase().includes('.pdf');

  const handlePdfLightboxDownload = () => {
    const current = galleryPdfs[currentPdfIndex];
    if (current) downloadFile(current.src, current.alt || t('defaultFilename'));
  };

  const handleClickFile = (url: string, fileName: string) => {
    if (isImageFile(url)) {
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
    } else if (isPdfFile(url)) {
      const allPdfFiles = allItems.filter((item: any) => {
        if (item.isFolder || item.type === 'LINK') return false;
        return isPdfFile(item.url || '');
      });
      const pdfs = allPdfFiles.map((f: any) => ({ src: f.url || '', alt: f.name }));
      const startIndex = allPdfFiles.findIndex((f: any) => f.url === url);
      setGalleryPdfs(pdfs.length ? pdfs : [{ src: url, alt: fileName }]);
      setCurrentPdfIndex(startIndex >= 0 ? startIndex : 0);
      setPdfLightboxOpen(true);
    } else {
      setCurrentDoc([{ uri: url, fileName: fileName }]);
      setViewerOpen(true);
    }
  };

  const handleFolderClick = (folderId: string) => {
    handleMarkViewed(folderId);
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
    toast.success(t('linkCopied'));
  };

  return (
    <DashboardLayout>
      <div className="flex-1 bg-gray-50 p-3 md:p-6 h-full">
        <div className=" space-y-4 md:space-y-6">
          {/* Breadcrumbs and Back */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={goBack}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('up')}
              </button>
              <span className="text-gray-300 flex-shrink-0">|</span>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink className="cursor-pointer text-xs md:text-sm" onClick={() => navigate('/documents')}>
                      {t('breadcrumbRoot')}
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
                        <BreadcrumbPage className="text-xs md:text-sm">{tc('loading')}</BreadcrumbPage>
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
                  placeholder={t('searchFiles')}
                  className="pl-10 bg-white w-full"
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
                        {t('fileColumn')}
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        {t('typeColumn')}
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        {t('created')}
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        {t('modified')}
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-24">
                        {t('actions')}
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
                                  getFileIcon(doc.type, doc.name)
                                )}
                              </div>
                              <div className="min-w-0">
                                <div
                                  onClick={() => {
                                    if (doc.isFolder) {
                                      handleFolderClick(doc.id);
                                    } else if (doc.type === 'LINK') {
                                      handleMarkViewed(doc.id);
                                      window.open(doc.url, '_blank');
                                    } else {
                                      handleMarkViewed(doc.id);
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
                            {doc.isFolder ? t('folder') : doc.type === 'LINK' ? t('link') : labelFile(doc.name)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(doc.created_at)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {formatDate(doc.updated_at || doc.created_at)}
                          </td>
                          <td className="px-4 py-3 pr-6 text-right">
                            <div className="inline-flex items-center gap-2">
                              {doc.is_viewed ? (
                                <span className="inline-flex flex-col items-end">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                                    <CheckCircle2 className="w-3 h-3" /> {tc('viewed')}
                                  </span>
                                  {doc.viewed_at && <span className="text-xs text-gray-400 mt-0.5">{formatDate(doc.viewed_at)}</span>}
                                </span>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-gray-400 hover:text-emerald-700"
                                  onClick={(e) => { e.stopPropagation(); handleMarkViewed(doc.id); }}
                                >
                                  {tc('markViewed')}
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
                                    aria-label={t('more')}
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
                                        handleMarkViewed(doc.id);
                                        window.open(doc.url, '_blank');
                                      } else {
                                        handleMarkViewed(doc.id);
                                        handleClickFile(doc.url || '', doc.name);
                                      }
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    {t('open')}
                                  </DropdownMenuItem>
                                  {!doc.isFolder && doc.type !== 'LINK' && (
                                    <DropdownMenuItem onClick={() => downloadFile(doc.url || '', doc.name)}>
                                      <Download className="w-4 h-4 mr-2" />
                                      {tc('download')}
                                    </DropdownMenuItem>
                                  )}
                                  {doc.type === 'LINK' && (
                                    <>
                                      <DropdownMenuItem onClick={() => { handleMarkViewed(doc.id); window.open(doc.url, '_blank'); }}>
                                        <SquareArrowOutUpRight className="w-4 h-4 mr-2" />
                                        {t('openLink')}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => copyLinkToClipboard(doc.url)}>
                                        <Copy className="w-4 h-4 mr-2" />
                                        {t('copyLink')}
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
                          {t('noFilesFound')}
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
                      handleMarkViewed(doc.id);
                      window.open(doc.url, '_blank');
                    } else {
                      handleMarkViewed(doc.id);
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
                          getFileIcon(doc.type, doc.name)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm break-words">
                          {doc.name}
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{t('typeLabel')}</span>
                            <span className="font-medium">
                              {doc.isFolder ? t('folder') : doc.type === 'LINK' ? t('link') : labelFile(doc.name)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{t('createdLabel')}</span>
                            <span className="font-medium">{formatDate(doc.created_at)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{t('modifiedLabel')}</span>
                            <span className="font-medium">{formatDate(doc.updated_at || doc.created_at)}</span>
                          </div>
                          {doc.is_viewed && (
                            <div className="flex justify-between text-xs">
                              <span className="inline-flex flex-col">
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                  <CheckCircle2 className="w-3 h-3" /> {tc('viewed')}
                                </span>
                                {doc.viewed_at && <span className="text-gray-400 mt-0.5">{formatDate(doc.viewed_at)}</span>}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons for mobile */}
                        <div className="flex gap-2 mt-3">
                          {!doc.is_viewed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={(e) => { e.stopPropagation(); handleMarkViewed(doc.id); }}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {tc('markViewed')}
                            </Button>
                          )}
                          {!doc.isFolder && doc.type !== 'LINK' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={(e) => { e.stopPropagation(); handleMarkViewed(doc.id); handleClickFile(doc.url || '', doc.name); }}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                {tc('view')}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={(e) => { e.stopPropagation(); downloadFile(doc.url || '', doc.name); }}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                {tc('download')}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {!isLoading && filteredFiles.length === 0 && (
              <div className="text-center py-12 text-gray-500">{t('noFilesFound')}</div>
            )}
          </div>
        </div>

        {/* Document Viewer Modal */}
        <Modal
          className="!h-[90vh] !max-w-[1200px] !py-7 outline-none bg-white rounded-lg shadow-xl mx-auto mt-10 p-4 relative"
          isOpen={viewerOpen}
          onRequestClose={() => setViewerOpen(false)}
          contentLabel={t('documentViewer')}
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
              <PDFViewer url={(slide as any).src} fileName={(slide as any).alt || t('fileTypes.document')} />
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
                <Download className="h-6 w-6" />
              </button>,
              'close',
            ],
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default DocumentFolder;
