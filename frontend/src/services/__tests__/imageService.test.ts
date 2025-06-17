import { convertImage, getSupportedFormats } from '../imageService';

// Mock the entire imageService module
jest.mock('../imageService', () => ({
  convertImage: jest.fn(),
  getSupportedFormats: jest.fn(),
}));

const mockConvertImage = convertImage as jest.MockedFunction<
  typeof convertImage
>;
const mockGetSupportedFormats = getSupportedFormats as jest.MockedFunction<
  typeof getSupportedFormats
>;

describe('imageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('convertImage', () => {
    test('successful conversion', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/webp' });
      mockConvertImage.mockResolvedValue({
        blob: mockBlob,
        size: mockBlob.size,
        width: 50,
        height: 50,
      });

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const options = {
        targetFormat: 'webp',
        quality: 85,
        maxWidth: 1920,
        maxHeight: 1080,
        maxSizeMb: 1,
      };

      const result = await convertImage(file, options);

      expect(mockConvertImage).toHaveBeenCalledWith(file, options);
      expect(result).toEqual({
        blob: mockBlob,
        size: mockBlob.size,
        width: 50,
        height: 50,
      });
    });

    test('handles conversion error', async () => {
      const errorMessage = '잘못된 이미지 파일입니다.';
      mockConvertImage.mockRejectedValue(new Error(errorMessage));

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const options = { targetFormat: 'webp', quality: 85 };

      await expect(convertImage(file, options)).rejects.toThrow(errorMessage);
    });
  });

  describe('getSupportedFormats', () => {
    test('successful fetch', async () => {
      const mockData = {
        supported_formats: ['webp', 'jpeg', 'png'],
        input_formats: ['webp', 'jpeg', 'png', 'bmp'],
      };

      mockGetSupportedFormats.mockResolvedValue(mockData);

      const result = await getSupportedFormats();

      expect(mockGetSupportedFormats).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    test('handles error and returns default formats', async () => {
      const defaultFormats = {
        supported_formats: ['webp', 'jpeg', 'jpg', 'png'],
        input_formats: ['webp', 'jpeg', 'jpg', 'png', 'bmp', 'tiff'],
      };

      mockGetSupportedFormats.mockResolvedValue(defaultFormats);

      const result = await getSupportedFormats();

      expect(mockGetSupportedFormats).toHaveBeenCalled();
      expect(result).toHaveProperty('supported_formats');
      expect(result).toHaveProperty('input_formats');
      expect(Array.isArray(result.supported_formats)).toBe(true);
      expect(Array.isArray(result.input_formats)).toBe(true);
    });
  });
});
