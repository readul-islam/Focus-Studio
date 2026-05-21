import { api } from '@/lib/Api';

/** Fetch GLB via authenticated API proxy (avoids S3 CORS). */
export async function fetchDesignModelBlob(assetId: number): Promise<Blob> {
  const response = await api.get(`/design/assets/${assetId}/model/`, {
    responseType: 'arraybuffer',
  });
  return new Blob([response.data], { type: 'model/gltf-binary' });
}

export async function fetchDesignModelObjectUrl(assetId: number): Promise<string> {
  const blob = await fetchDesignModelBlob(assetId);
  return URL.createObjectURL(blob);
}
