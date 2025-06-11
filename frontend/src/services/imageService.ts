import axios from 'axios';
import { ConversionOptions } from '../stores/imageStore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초 타임아웃
});

export const convertImage = async (
  file: File,
  options: ConversionOptions
): Promise<Blob> => {
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
    const response = await apiClient.post('/api/v1/convert', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error('잘못된 이미지 파일입니다.');
      } else if (error.response?.status === 500) {
        throw new Error('서버에서 이미지 변환 중 오류가 발생했습니다.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('요청 시간이 초과되었습니다. 파일 크기를 확인해주세요.');
      }
    }
    
    throw new Error('이미지 변환 중 오류가 발생했습니다.');
  }
};

export const getSupportedFormats = async () => {
  try {
    const response = await apiClient.get('/api/v1/formats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch supported formats:', error);
    return {
      supported_formats: ['webp', 'jpeg', 'jpg', 'png'],
      input_formats: ['webp', 'jpeg', 'jpg', 'png', 'bmp', 'tiff'],
    };
  }
};
