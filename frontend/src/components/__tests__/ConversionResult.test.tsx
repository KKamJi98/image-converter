import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConversionResult } from '../ConversionResult';

// Mock zustand stores
jest.mock('../../stores/imageStore', () => ({
  useImageStore: () => ({
    convertedImageUrl: 'mock-url',
    convertedMetadata: { width: 100, height: 50, size: 2048 },
    selectedFile: new File(['test'], 'test.png', { type: 'image/png' }),
    conversionOptions: {
      targetFormat: 'webp',
      quality: 80,
      maxWidth: 1920,
      maxHeight: 1080,
    },
    resetConversion: jest.fn(),
  }),
}));

describe('ConversionResult', () => {
  test('renders conversion result title', () => {
    render(<ConversionResult />);

    const title = screen.getByText(/변환 완료/i);
    expect(title).toBeInTheDocument();
  });

  test('renders download button', () => {
    render(<ConversionResult />);

    const downloadButton = screen.getByText(/다운로드/i);
    expect(downloadButton).toBeInTheDocument();
  });

  test('renders new conversion button', () => {
    render(<ConversionResult />);

    const newButton = screen.getByText(/다시 변환/i);
    expect(newButton).toBeInTheDocument();
  });

  test('shows converted image size', () => {
    render(<ConversionResult />);

    const info = screen.getByText('100 × 50 / 2 KB');
    expect(info).toBeInTheDocument();
  });
});
