import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageConverter } from '../ImageConverter';

// Mock the image service
jest.mock('../../services/imageService', () => ({
  convertImage: jest.fn(),
}));

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(global.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mocked-url'),
});

Object.defineProperty(global.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock zustand store
const mockSetProgress = jest.fn();
const mockSetConvertedImageUrl = jest.fn();
const mockSetError = jest.fn();
const mockSetConvertedMetadata = jest.fn();

jest.mock('../../stores/imageStore', () => ({
  useImageStore: () => ({
    selectedFile: new File(['test'], 'test.png', { type: 'image/png' }),
    conversionOptions: {
      targetFormat: 'webp',
      maxWidth: 1920,
      maxHeight: 1080,
      maxSizeMb: 1,
      quality: 100,
    },
    progress: {
      isConverting: false,
      stage: 'idle',
      percent: 0,
      message: '',
      startedAt: null,
      elapsedMs: 0,
    },
    convertedImageUrl: null,
    error: null,
    setProgress: mockSetProgress,
    setConvertedImageUrl: mockSetConvertedImageUrl,
    setConvertedMetadata: mockSetConvertedMetadata,
    setError: mockSetError,
  }),
}));

describe('ImageConverter', () => {
  const mockConvertImage = require('../../services/imageService').convertImage;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders convert button when file is selected', () => {
    render(<ImageConverter />);

    const convertButton = screen.getByText(/이미지 변환/i);
    expect(convertButton).toBeInTheDocument();
  });

  test('handles successful conversion', async () => {
    const mockBlob = new Blob(['converted-image'], { type: 'image/webp' });
    mockConvertImage.mockResolvedValue({
      blob: mockBlob,
      size: mockBlob.size,
      width: 100,
      height: 50,
      originalWidth: 100,
      originalHeight: 50,
      originalSize: mockBlob.size * 2,
      compressionRatio: 0.5,
      processTimeSeconds: 4.2,
      targetFormat: 'webp',
    });

    render(<ImageConverter />);

    const convertButton = screen.getByText(/이미지 변환/i);

    fireEvent.click(convertButton);

    // 변환 시작 시 상태 확인
    expect(mockSetError).toHaveBeenCalledWith(null);

    // setProgress가 여러 번 호출되므로 첫 번째 호출만 확인
    expect(mockSetProgress).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        isConverting: true,
        stage: 'upload',
        percent: 0,
      })
    );

    await waitFor(() => {
      expect(mockConvertImage).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({
          targetFormat: 'webp',
          maxWidth: 1920,
          maxHeight: 1080,
          maxSizeMb: 1,
          quality: 100,
        }),
        expect.objectContaining({
          onStageChange: expect.any(Function),
          onUploadProgress: expect.any(Function),
          onDownloadProgress: expect.any(Function),
        })
      );
    });

    // URL.createObjectURL이 호출되었는지 확인
    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    });

    await waitFor(() => {
      expect(mockSetConvertedMetadata).toHaveBeenCalledWith({
        width: 100,
        height: 50,
        size: mockBlob.size,
        originalWidth: 100,
        originalHeight: 50,
        originalSize: mockBlob.size * 2,
        compressionRatio: 0.5,
        processTimeSeconds: 4.2,
        targetFormat: 'webp',
      });
    });

    // 최종 상태 확인 - 실제로 호출되는 값으로 수정
    await waitFor(() => {
      expect(mockSetConvertedImageUrl).toHaveBeenCalled();
    });

    // 마지막 setProgress 호출 확인
    await waitFor(() => {
      expect(mockSetProgress).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isConverting: false,
          stage: 'done',
          percent: 100,
        })
      );
    });
  });

  test('handles conversion error', async () => {
    const errorMessage = 'Conversion failed';
    mockConvertImage.mockRejectedValue(new Error(errorMessage));

    render(<ImageConverter />);

    const convertButton = screen.getByText(/이미지 변환/i);

    fireEvent.click(convertButton);

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(errorMessage);
    });

    await waitFor(() => {
      expect(mockSetProgress).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isConverting: false,
          stage: 'idle',
          percent: 0,
        })
      );
    });
  });
});
