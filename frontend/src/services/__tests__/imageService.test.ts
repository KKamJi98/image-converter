import axios from 'axios';
import { convertImage, getSupportedFormats } from '../imageService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock axios.create
const mockPost = jest.fn();
const mockGet = jest.fn();
mockedAxios.create.mockReturnValue({
  post: mockPost,
  get: mockGet,
} as any);

describe('imageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('convertImage', () => {
    test('successful conversion', async () => {
      const mockBlob = new Blob(['converted-image'], { type: 'image/webp' });
      mockPost.mockResolvedValue({ data: mockBlob });

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const options = {
        targetFormat: 'webp',
        quality: 85,
      };

      const result = await convertImage(file, options);

      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/convert',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'blob',
        })
      );

      expect(result).toBe(mockBlob);
    });

    test('handles axios error', async () => {
      const error = {
        response: { status: 400 },
        isAxiosError: true,
      };
      mockPost.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(true);

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const options = { targetFormat: 'webp' };

      await expect(convertImage(file, options)).rejects.toThrow(
        '잘못된 이미지 파일입니다.'
      );
    });
  });

  describe('getSupportedFormats', () => {
    test('successful fetch', async () => {
      const mockData = {
        supported_formats: ['webp', 'jpeg', 'png'],
        input_formats: ['webp', 'jpeg', 'png', 'bmp'],
      };
      mockGet.mockResolvedValue({ data: mockData });

      const result = await getSupportedFormats();

      expect(mockGet).toHaveBeenCalledWith('/api/v1/formats');
      expect(result).toEqual(mockData);
    });

    test('handles error with fallback', async () => {
      const error = new Error('Network error');
      mockGet.mockRejectedValue(error);

      const result = await getSupportedFormats();

      expect(result).toEqual({
        supported_formats: ['webp', 'jpeg', 'jpg', 'png'],
        input_formats: ['webp', 'jpeg', 'jpg', 'png', 'bmp', 'tiff'],
      });
    });
  });
});
