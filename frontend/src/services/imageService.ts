import axios, { AxiosProgressEvent } from 'axios';

import { ConversionOptions } from '../stores/imageStore';
import type { ConversionStage, ConvertedImage } from '../types/conversion';

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_ENDPOINT ||
  process.env.REACT_APP_API_URL ||
  '/api';
// `REACT_APP_BACKEND_ENDPOINT` can point directly to the backend service
// (e.g. "http://image-converter-backend:8000"). Otherwise `REACT_APP_API_URL`
// should contain the proxy prefix ("/api"). Endpoints below omit this prefix to
// avoid `/api/api` duplication.

// 테스트 환경에서 사용할 수 있도록 export
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000, // 90초 타임아웃
});

export interface ConvertImageCallbacks {
  onStageChange?: (stage: ConversionStage) => void;
  onUploadProgress?: (ratio: number) => void;
  onDownloadProgress?: (ratio: number) => void;
}

const toNumber = (value: string | string[] | undefined): number | undefined => {
  if (Array.isArray(value)) {
    return toNumber(value[0]);
  }
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toFloat = (value: string | string[] | undefined): number | undefined => {
  if (Array.isArray(value)) {
    return toFloat(value[0]);
  }
  if (!value) {
    return undefined;
  }
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const progressRatio = (
  event: AxiosProgressEvent,
  fallbackTotal?: number
): number => {
  const total = event.total ?? fallbackTotal;
  if (!total || total <= 0) {
    return event.loaded > 0 ? 1 : 0;
  }
  return Math.min(1, event.loaded / total);
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

  try {
    callbacks?.onStageChange?.('upload');

    let processingNotified = false;
    let downloadNotified = false;

    const markProcessing = () => {
      if (!processingNotified) {
        callbacks?.onStageChange?.('processing');
        processingNotified = true;
      }
    };

    const markDownload = () => {
      if (!downloadNotified) {
        callbacks?.onStageChange?.('download');
        downloadNotified = true;
      }
    };

    const response = await apiClient.post('/v1/convert', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
      onUploadProgress: (event) => {
        const ratio = progressRatio(event, file.size);
        callbacks?.onUploadProgress?.(ratio);
        if (ratio >= 1) {
          markProcessing();
        }
      },
      onDownloadProgress: (event) => {
        markDownload();
        const ratio = progressRatio(event);
        callbacks?.onDownloadProgress?.(ratio);
      },
    });

    markProcessing();
    callbacks?.onUploadProgress?.(1);
    markDownload();
    callbacks?.onDownloadProgress?.(1);
    callbacks?.onStageChange?.('finalizing');

    const blob: Blob = response.data;
    const headers = response.headers as Record<string, string | undefined>;

    const originalSize = toNumber(headers['x-original-size']) ?? file.size;
    const convertedSize = toNumber(headers['x-converted-size']) ?? blob.size;
    const compressionRatio =
      toFloat(headers['x-compression-ratio']) ??
      (originalSize > 0 ? convertedSize / originalSize : 1);

    const width = toNumber(headers['x-converted-width']) ?? 0;
    const height = toNumber(headers['x-converted-height']) ?? 0;
    const originalWidth = toNumber(headers['x-original-width']) ?? width;
    const originalHeight = toNumber(headers['x-original-height']) ?? height;
    const processTimeSeconds = toFloat(headers['x-process-time']) ?? 0;
    const targetFormat =
      headers['x-target-format']?.toLowerCase() || options.targetFormat;

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
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Image conversion failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      const detail = error.response?.data?.detail;
      if (detail) {
        throw new Error(detail);
      }

      if (error.response?.status === 400) {
        throw new Error('잘못된 이미지 파일입니다.');
      }
      if (error.response?.status === 500) {
        throw new Error('서버에서 이미지 변환 중 오류가 발생했습니다.');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error(
          '요청 시간이 초과되었습니다. 파일 크기를 확인해주세요.'
        );
      }
    } else {
      console.error('Unexpected error:', error);
    }

    throw new Error('이미지 변환 중 오류가 발생했습니다.');
  }
};

export const getSupportedFormats = async () => {
  try {
    const response = await apiClient.get('/v1/formats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch supported formats:', error);
    return {
      supported_formats: ['webp', 'jpeg', 'jpg', 'png'],
      input_formats: ['webp', 'jpeg', 'jpg', 'png', 'bmp', 'tiff'],
    };
  }
};
