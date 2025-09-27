import { convertImage, getSupportedFormats } from '../imageService';
import { uploadImage } from '../../utils/upload';

jest.mock('../../utils/upload');

const mockedUploadImage = uploadImage as jest.MockedFunction<
  typeof uploadImage
>;

describe('imageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('convertImage', () => {
    test('returns converted metadata and respects callbacks', async () => {
      const mockBlob = new Blob(['converted'], { type: 'image/webp' });
      const headers = new Headers({
        'x-original-size': '40',
        'x-converted-size': '20',
        'x-original-width': '200',
        'x-original-height': '100',
        'x-converted-width': '150',
        'x-converted-height': '80',
        'x-compression-ratio': '0.5',
        'x-process-time': '1.2',
        'x-target-format': 'webp',
      });

      mockedUploadImage.mockImplementation(async (_file, opts) => {
        opts?.onUploadComplete?.(500);
        opts?.onDownloadStart?.();
        opts?.onDownloadProgress?.(1, mockBlob.size, mockBlob.size);

        return {
          blob: mockBlob,
          headers,
          timings: {
            totalMs: 1500,
            uploadMs: 500,
            downloadMs: 1000,
          },
        };
      });

      const file = new File(['source'], 'sample.png', { type: 'image/png' });
      const options = {
        targetFormat: 'webp',
        quality: 90,
        maxWidth: 1920,
        maxHeight: 1080,
        maxSizeMb: 1,
      };

      const stageSpy = jest.fn();
      const uploadProgressSpy = jest.fn();
      const downloadProgressSpy = jest.fn();

      const result = await convertImage(file, options, {
        onStageChange: stageSpy,
        onUploadProgress: uploadProgressSpy,
        onDownloadProgress: downloadProgressSpy,
      });

      expect(mockedUploadImage).toHaveBeenCalledTimes(1);
      const callArgs = mockedUploadImage.mock.calls[0];
      expect(callArgs[0]).toBe(file);
      expect(callArgs[1]).toMatchObject({
        formData: expect.any(FormData),
        endpoint: expect.stringMatching(/\/v1\/convert$/),
      });

      expect(stageSpy).toHaveBeenCalledWith('upload');
      expect(stageSpy).toHaveBeenCalledWith('processing');
      expect(stageSpy).toHaveBeenCalledWith('download');
      expect(stageSpy).toHaveBeenCalledWith('finalizing');
      expect(stageSpy).toHaveBeenCalledWith('done');

      expect(uploadProgressSpy).toHaveBeenCalledWith(1);
      expect(downloadProgressSpy).toHaveBeenCalledWith(1);

      expect(result).toEqual({
        blob: mockBlob,
        size: 20,
        width: 150,
        height: 80,
        originalWidth: 200,
        originalHeight: 100,
        originalSize: 40,
        compressionRatio: 0.5,
        processTimeSeconds: 1.2,
        targetFormat: 'webp',
      });
    });

    test('falls back to timing when headers are missing', async () => {
      const mockBlob = new Blob(['converted'], { type: 'image/jpeg' });
      mockedUploadImage.mockImplementation(async (_file, opts) => {
        opts?.onUploadComplete?.(1000);
        opts?.onDownloadStart?.();
        opts?.onDownloadProgress?.(1, mockBlob.size, mockBlob.size);

        return {
          blob: mockBlob,
          headers: new Headers(),
          timings: {
            totalMs: 2000,
            uploadMs: 1000,
            downloadMs: 1000,
          },
        };
      });

      const file = new File(['source'], 'sample.png', { type: 'image/png' });
      const options = { targetFormat: 'jpeg' };

      const result = await convertImage(file, options);

      expect(result.processTimeSeconds).toBeCloseTo(2, 2);
      expect(result.targetFormat).toBe('jpeg');
      expect(result.size).toBe(mockBlob.size);
    });
  });

  describe('getSupportedFormats', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('returns formats from API', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          supported_formats: ['webp', 'jpeg'],
          input_formats: ['webp', 'jpeg', 'png'],
        }),
      } as unknown as Response;

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await getSupportedFormats();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/v1\/formats$/)
      );
      expect(result.supported_formats).toContain('webp');
    });

    test('falls back to defaults on failure', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValue(
          new Error('network error')
        ) as unknown as typeof fetch;

      const result = await getSupportedFormats();
      expect(result.supported_formats).toEqual(
        expect.arrayContaining(['webp', 'jpeg', 'jpg', 'png'])
      );
    });
  });
});
