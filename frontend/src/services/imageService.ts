import { ConversionOptions } from '../stores/imageStore';
import type { ConversionStage, ConvertedImage } from '../types/conversion';
import { uploadImage } from '../utils/upload';

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_ENDPOINT ||
  process.env.REACT_APP_API_URL ||
  '/api';

const buildEndpoint = (path: string) => {
  if (API_BASE_URL.endsWith('/')) {
    return `${API_BASE_URL.slice(0, -1)}${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

export interface ConvertImageCallbacks {
  onStageChange?: (stage: ConversionStage) => void;
  onUploadProgress?: (ratio: number) => void;
  onDownloadProgress?: (ratio: number) => void;
}

const toNumber = (value: string | null | undefined): number | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toFloat = (value: string | null | undefined): number | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const convertImage = async (
  file: File,
  options: ConversionOptions,
  callbacks?: ConvertImageCallbacks
): Promise<ConvertedImage> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_format', options.targetFormat);

  if (options.maxWidth) {
    formData.append('max_width', options.maxWidth.toString());
  }

  if (options.maxHeight) {
    formData.append('max_height', options.maxHeight.toString());
  }

  if (options.maxSizeMb) {
    formData.append('max_size_mb', options.maxSizeMb.toString());
  }

  if (options.quality) {
    formData.append('quality', options.quality.toString());
  }

  callbacks?.onStageChange?.('upload');

  let downloadNotified = false;
  const endpoint = buildEndpoint('/v1/convert');

  const { blob, headers, timings } = await uploadImage(file, {
    endpoint,
    formData,
    fileName: file.name,
    onUploadComplete: () => {
      callbacks?.onStageChange?.('processing');
      callbacks?.onUploadProgress?.(1);
    },
    onDownloadStart: () => {
      if (!downloadNotified) {
        downloadNotified = true;
        callbacks?.onStageChange?.('download');
      }
    },
    onDownloadProgress: (ratio) => {
      callbacks?.onDownloadProgress?.(ratio > 0 ? ratio : 0.05);
    },
    logLabel: 'convert-image',
  });

  callbacks?.onDownloadProgress?.(1);
  callbacks?.onStageChange?.('finalizing');

  const originalSize = toNumber(headers.get('x-original-size')) ?? file.size;
  const convertedSize = toNumber(headers.get('x-converted-size')) ?? blob.size;
  const compressionRatio =
    toFloat(headers.get('x-compression-ratio')) ??
    (originalSize > 0 ? convertedSize / originalSize : 1);

  const width = toNumber(headers.get('x-converted-width')) ?? 0;
  const height = toNumber(headers.get('x-converted-height')) ?? 0;
  const originalWidth = toNumber(headers.get('x-original-width')) ?? width;
  const originalHeight = toNumber(headers.get('x-original-height')) ?? height;
  const serverProcessTime = toFloat(headers.get('x-process-time'));
  const targetFormat =
    headers.get('x-target-format')?.toLowerCase() || options.targetFormat;

  const processTimeSeconds = serverProcessTime ?? timings.totalMs / 1000 ?? 0;

  callbacks?.onStageChange?.('done');

  return {
    blob,
    size: convertedSize,
    width,
    height,
    originalWidth,
    originalHeight,
    originalSize,
    compressionRatio,
    processTimeSeconds,
    targetFormat,
  };
};

export const getSupportedFormats = async () => {
  try {
    const res = await fetch(buildEndpoint('/v1/formats'));
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch supported formats:', error);
    return {
      supported_formats: ['webp', 'jpeg', 'jpg', 'png'],
      input_formats: ['webp', 'jpeg', 'jpg', 'png', 'bmp', 'tiff'],
    };
  }
};
