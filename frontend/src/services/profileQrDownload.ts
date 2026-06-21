import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import {
  PROFILE_QR_BACKGROUND,
  PROFILE_QR_MARGIN,
  PROFILE_QR_SIZE,
} from '../utils/qrConstants';
import { createProfileQrPngBase64 } from '../utils/qrPngEncode';

export type SaveProfileQrResult = 'shared' | 'unavailable' | 'no_link' | 'failed';

type SaveOptions = {
  color?: string;
  backgroundColor?: string;
};

export async function shareProfileQrImage(
  profileLink: string,
  options: SaveOptions = {},
): Promise<SaveProfileQrResult> {
  const link = profileLink.trim();
  if (!link) return 'no_link';

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) return 'unavailable';

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) return 'failed';

  try {
    const base64 = createProfileQrPngBase64(link, {
      size: PROFILE_QR_SIZE,
      margin: PROFILE_QR_MARGIN,
      color: options.color ?? '#000000',
      backgroundColor: options.backgroundColor ?? PROFILE_QR_BACKGROUND,
    });
    const fileUri = `${cacheDir}justagg-profile-qr.png`;

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Sharing.shareAsync(fileUri, {
      mimeType: 'image/png',
      dialogTitle: 'Save your profile QR code',
      UTI: 'public.png',
    });

    return 'shared';
  } catch {
    return 'failed';
  }
}
