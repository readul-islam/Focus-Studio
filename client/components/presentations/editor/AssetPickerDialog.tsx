'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/useFetch';
import { Search, Loader2, FolderOpen, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getProductImageUrl, type LibraryProduct } from './presentationAssets';

type ProductItem = LibraryProduct;

type DesignAssetItem = {
  id: number;
  image_url?: string | null;
  asset_type: string;
  prompt?: string;
};

type DocumentItem = {
  id: number;
  name: string;
  type: string;
  file?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  mode: 'image' | 'product' | 'scene' | 'pin-product' | 'pin-scene';
  projectId: number;
  onSelectProduct: (product: ProductItem) => void;
  onSelectScene: (asset: DesignAssetItem) => void;
  onSelectDocument: (doc: DocumentItem, fileUrl: string) => void;
  onUploadFromComputer?: () => void;
};

export function AssetPickerDialog({
  open,
  onClose,
  mode,
  projectId,
  onSelectProduct,
  onSelectScene,
  onSelectDocument,
  onUploadFromComputer,
}: Props) {
  const t = useTranslations('presentationEditor');
  const [search, setSearch] = useState('');
  const defaultTab =
    mode === 'scene' || mode === 'pin-scene'
      ? 'scenes'
      : mode === 'product' || mode === 'pin-product'
        ? 'products'
        : 'files';

  const { data: productsRaw, isLoading: productsLoading } = useFetch(
    open ? `library/studio-products/?q=${encodeURIComponent(search)}&page=1` : null
  );
  const { data: scenesRaw, isLoading: scenesLoading } = useFetch(
    open ? '/design/studio-assets/' : null
  );
  const { data: docsRaw, isLoading: docsLoading } = useFetch(
    open ? `documents/documents/root_documents/?project_id=${projectId}` : null
  );

  const products: ProductItem[] = Array.isArray(productsRaw)
    ? productsRaw
    : (productsRaw as { results?: ProductItem[] })?.results || [];

  const scenes: DesignAssetItem[] = Array.isArray(scenesRaw) ? scenesRaw : [];

  const docs: DocumentItem[] = Array.isArray(docsRaw) ? docsRaw : [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('assetPicker.title')}</DialogTitle>
        </DialogHeader>

        {onUploadFromComputer && mode === 'image' && (
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              onUploadFromComputer();
              onClose();
            }}
          >
            <Upload className="h-4 w-4" />
            {t('assetPicker.uploadFromComputer')}
          </Button>
        )}

        <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col min-h-0">
          <TabsList>
            <TabsTrigger value="products">{t('assetPicker.products')}</TabsTrigger>
            <TabsTrigger value="scenes">{t('assetPicker.scenes')}</TabsTrigger>
            <TabsTrigger value="files">{t('assetPicker.files')}</TabsTrigger>
          </TabsList>

          <div className="relative my-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('assetPicker.search')}
              className="pl-9"
            />
          </div>

          <TabsContent value="products" className="flex-1 overflow-y-auto mt-0">
            {productsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {products.map((p) => {
                  const img = getProductImageUrl(p);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className="border rounded-lg overflow-hidden hover:ring-2 ring-primary text-left"
                      onClick={() => { onSelectProduct(p); onClose(); }}
                    >
                      <div className="aspect-square bg-muted">
                        {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <p className="p-2 text-xs truncate">{p.name}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scenes" className="flex-1 overflow-y-auto mt-0">
            {scenesLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : scenes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('assetPicker.noScenes')}</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {scenes.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    className="border rounded-lg overflow-hidden hover:ring-2 ring-primary text-left"
                    onClick={() => { onSelectScene(asset); onClose(); }}
                  >
                    <div className="aspect-square bg-muted">
                      {asset.image_url && (
                        <img src={asset.image_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <p className="p-2 text-xs truncate">{asset.prompt || t('assetPicker.scene')}</p>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="files" className="flex-1 overflow-y-auto mt-0">
            {docsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="space-y-1">
                {docs.filter((d) => d.type === 'FILE').map((doc) => (
                  <Button
                    key={doc.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      if (doc.file) {
                        onSelectDocument(doc, doc.file);
                        onClose();
                      }
                    }}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    {doc.name}
                  </Button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
