import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConversionResult } from '../ConversionResult';

const mockReset = jest.fn();
const mockUseImageStore = jest.fn();

jest.mock('../../stores/imageStore', () => ({
  useImageStore: () => mockUseImageStore(),
}));

describe('ConversionResult', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseImageStore.mockReturnValue({
      convertedImageUrl: 'mock-url',
      convertedMetadata: {
        width: 100,
        height: 50,
        size: 2048,
        originalWidth: 200,
        originalHeight: 100,
        originalSize: 4096,
        compressionRatio: 0.5,
        processTimeSeconds: 5.25,
        targetFormat: 'webp',
      },
      selectedFile: new File(['test'], 'test.png', { type: 'image/png' }),
      conversionOptions: {
        targetFormat: 'webp',
        quality: 80,
        maxWidth: 1920,
        maxHeight: 1080,
      },
      reset: mockReset,
    });
  });

  test('renders conversion summary and actions', () => {
    render(<ConversionResult />);

    expect(screen.getByText(/변환 완료/i)).toBeInTheDocument();
    expect(screen.getByText(/다운로드/i)).toBeInTheDocument();
    expect(screen.getByText(/다시 변환/i)).toBeInTheDocument();
    expect(screen.getByText(/4 KB → 2 KB/i)).toBeInTheDocument();
  });

  test('renders preview image by default when result is small', () => {
    render(<ConversionResult />);

    expect(screen.getByAltText(/변환된 이미지 미리보기/i)).toBeInTheDocument();
  });

  test('shows deferred preview placeholder for very large files', () => {
    mockUseImageStore.mockReturnValue({
      convertedImageUrl: 'mock-url',
      convertedMetadata: {
        width: 9000,
        height: 6000,
        size: 25 * 1024 * 1024,
        originalWidth: 9000,
        originalHeight: 6000,
        originalSize: 30 * 1024 * 1024,
        compressionRatio: 0.8,
        processTimeSeconds: 6.5,
        targetFormat: 'png',
      },
      selectedFile: new File(['test'], 'large.tiff', { type: 'image/tiff' }),
      conversionOptions: {
        targetFormat: 'png',
        quality: 90,
      },
      reset: mockReset,
    });

    render(<ConversionResult />);

    expect(screen.getByText(/대용량 이미지 미리보기/i)).toBeInTheDocument();
    expect(
      screen.queryByAltText(/변환된 이미지 미리보기/i)
    ).not.toBeInTheDocument();
  });
});
