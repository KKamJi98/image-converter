import axios from 'axios';
import { ConversionOptions } from '../stores/imageStore';

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

export interface ConvertedImage {
  blob: Blob;
  size: number;
  width: number;
  height: number;
}

export const convertImage = async (
  file: File,
  options: ConversionOptions
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
    const response = await apiClient.post('/v1/convert', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });

    const blob = response.data;
    const size = blob.size;

    const img = await new Promise<HTMLImageElement>((resolve) => {
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = () => {
        resolve(image);
        URL.revokeObjectURL(url);
      };
      image.src = url;
    });

    return { blob, size, width: img.width, height: img.height };
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
