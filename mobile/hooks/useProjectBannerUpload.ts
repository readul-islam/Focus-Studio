import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/lib/api-errors';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
import { uploadProjectBanner, type UploadFile } from '@/lib/upload';

const MAX_BANNER_BYTES = 20 * 1024 * 1024;

function fileFromAsset(asset: ImagePicker.ImagePickerAsset): UploadFile {
  const name = asset.fileName ?? `banner-${Date.now()}.jpg`;
  return {
    uri: asset.uri,
    name,
    type: asset.mimeType ?? 'image/jpeg',
  };
}

export function useProjectBannerUpload(projectId: string, onUpdated?: () => void) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const uploadAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    if (asset.fileSize && asset.fileSize > MAX_BANNER_BYTES) {
      Alert.alert('Image too large', 'Project banners must be under 20MB.');
      return;
    }

    const file = fileFromAsset(asset);
    setPreviewUri(asset.uri);
    setUploading(true);

    try {
      await uploadProjectBanner(Number(projectId), file);
      await queryClient.invalidateQueries({ queryKey: ['projects/projects', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['projects/user-projects/'] });
      await queryClient.invalidateQueries({ queryKey: ['projects/project-overview', projectId] });
      hapticSuccess();
      onUpdated?.();
    } catch (error) {
      setPreviewUri(null);
      Alert.alert('Upload failed', getApiErrorMessage(error, 'Only image files up to 20MB are supported.'));
    } finally {
      setUploading(false);
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to set a project banner.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: true,
      aspect: [16, 9],
    });

    if (result.canceled || !result.assets[0]) return;
    await uploadAsset(result.assets[0]);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a project banner photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.9,
      allowsEditing: true,
      aspect: [16, 9],
    });

    if (result.canceled || !result.assets[0]) return;
    await uploadAsset(result.assets[0]);
  };

  const promptBannerChange = () => {
    hapticLight();
    Alert.alert('Project banner', 'Choose a photo for this project', [
      { text: 'Photo library', onPress: () => void pickFromLibrary() },
      { text: 'Take photo', onPress: () => void takePhoto() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return {
    uploading,
    previewUri,
    promptBannerChange,
  };
}
