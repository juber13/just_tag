import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export type PickSource = 'camera' | 'gallery';
export type PickTarget = 'banner' | 'avatar';

function isGranted(status: ImagePicker.PermissionStatus | string): boolean {
  return status === ImagePicker.PermissionStatus.GRANTED || status === 'granted';
}

async function ensureCameraPermission(): Promise<boolean> {
  const { status: existing } = await ImagePicker.getCameraPermissionsAsync();
  if (isGranted(existing)) return true;

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (!isGranted(status)) {
    Alert.alert(
      'Camera access needed',
      'Please allow camera access in Settings to take a photo.',
    );
    return false;
  }
  return true;
}

async function ensureGalleryPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  const { status: existing } = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (isGranted(existing)) return true;

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!isGranted(status)) {
    Alert.alert(
      'Photos access needed',
      'Please allow photo library access in Settings to choose an image.',
    );
    return false;
  }
  return true;
}

export function showImageSourceSheet(
  title: string,
  onSelect: (source: PickSource) => void,
): void {
  Alert.alert(title, 'Choose a source', [
    { text: 'Take Photo', onPress: () => onSelect('camera') },
    { text: 'Choose from Gallery', onPress: () => onSelect('gallery') },
    { text: 'Cancel', style: 'cancel' },
  ]);
}

export async function pickProfileImage(
  source: PickSource,
  target: PickTarget,
): Promise<string | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.9,
  };

  if (Platform.OS === 'ios') {
    options.aspect = target === 'banner' ? [16, 9] : [1, 1];
  } else {
    // Android: skip aspect ratio — avoids picker failing to open or returning nothing.
    options.allowsEditing = target === 'avatar';
  }

  try {
    if (source === 'camera') {
      const allowed = await ensureCameraPermission();
      if (!allowed) return null;

      const result = await ImagePicker.launchCameraAsync(options);
      if (result.canceled || !result.assets?.[0]?.uri) return null;
      return result.assets[0].uri;
    }

    const allowed = await ensureGalleryPermission();
    if (!allowed) return null;

    const result = await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled || !result.assets?.[0]?.uri) return null;
    return result.assets[0].uri;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'The image picker could not open.';
    Alert.alert('Image picker error', message);
    return null;
  }
}
