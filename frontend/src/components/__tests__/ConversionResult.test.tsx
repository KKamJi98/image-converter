import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import { ConversionResult } from '../ConversionResult';

// Mock zustand store
jest.mock('../../stores/imageStore', () => ({
  useImageStore: () => ({
    convertedImageUrl: 'data:image/webp;base64,test-image-data',
    selectedFile: new File(['test'], 'test.png', { type: 'image/png' }),
    conversionOptions: {
      targetFormat: 'webp',
      quality: 85,
    },
    reset: jest.fn(),
  }),
}));

describe('ConversionResult', () => {
  test('renders conversion result title', () => {
    act(() => {
      render(<ConversionResult />);
    });

    const title = screen.getByText(/변환 완료/i);
    expect(title).toBeInTheDocument();
  });

  test('renders converted image', () => {
    act(() => {
      render(<ConversionResult />);
    });

    const image = screen.getByAltText(/converted/i);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'data:image/webp;base64,test-image-data');
  });

  test('renders download and reset buttons', () => {
    act(() => {
      render(<ConversionResult />);
    });

    const downloadButton = screen.getByText(/다운로드/i);
    const resetButton = screen.getByText(/다시 변환/i);
    
    expect(downloadButton).toBeInTheDocument();
    expect(resetButton).toBeInTheDocument();
  });
});
