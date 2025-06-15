import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConversionResult } from '../ConversionResult';

// Mock zustand stores
jest.mock('../../stores/imageStore', () => ({
  useImageStore: () => ({
    convertedImageUrl: 'mock-url',
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
});
