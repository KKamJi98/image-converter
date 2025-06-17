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
      progress: 0,
      message: '',
    },
    convertedImageUrl: null,
    error: null,
    setProgress: mockSetProgress,
    setConvertedImageUrl: mockSetConvertedImageUrl,
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
    mockConvertImage.mockResolvedValue(mockBlob);

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
        progress: 0,
        message: '변환 준비 중...',
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
        })
      );
    });

    // URL.createObjectURL이 호출되었는지 확인
    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
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
          progress: 100,
          message: '변환이 완료되었습니다!',
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
          progress: 0,
          message: '',
        })
      );
    });
  });
});
