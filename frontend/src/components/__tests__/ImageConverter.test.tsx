import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageConverter } from '../ImageConverter';

// Mock the image service
jest.mock('../../services/imageService', () => ({
  convertImage: jest.fn(),
}));

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
      quality: 85,
    },
    progress: {
      isConverting: false,
      progress: 0,
      message: '',
    },
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
    act(() => {
      render(<ImageConverter />);
    });

    const convertButton = screen.getByText(/변환하기/i);
    expect(convertButton).toBeInTheDocument();
  });

  test('handles successful conversion', async () => {
    const mockBlob = new Blob(['converted-image'], { type: 'image/webp' });
    mockConvertImage.mockResolvedValue(mockBlob);
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'mocked-converted-url');

    act(() => {
      render(<ImageConverter />);
    });

    const convertButton = screen.getByText(/변환하기/i);
    
    act(() => {
      fireEvent.click(convertButton);
    });

    expect(mockSetProgress).toHaveBeenCalledWith({ isConverting: true });
    expect(mockSetError).toHaveBeenCalledWith(null);

    await waitFor(() => {
      expect(mockConvertImage).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({
          targetFormat: 'webp',
          maxWidth: 1920,
          maxHeight: 1080,
          maxSizeMb: 1,
          quality: 85,
        })
      );
    });

    await waitFor(() => {
      expect(mockSetConvertedImageUrl).toHaveBeenCalledWith('mocked-converted-url');
      expect(mockSetProgress).toHaveBeenCalledWith({ isConverting: false });
    });
  });

  test('handles conversion error', async () => {
    const errorMessage = 'Conversion failed';
    mockConvertImage.mockRejectedValue(new Error(errorMessage));

    act(() => {
      render(<ImageConverter />);
    });

    const convertButton = screen.getByText(/변환하기/i);
    
    act(() => {
      fireEvent.click(convertButton);
    });

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(errorMessage);
      expect(mockSetProgress).toHaveBeenCalledWith({ isConverting: false });
    });
  });
});
