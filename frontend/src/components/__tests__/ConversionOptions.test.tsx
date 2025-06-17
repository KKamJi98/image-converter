import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversionOptions } from '../ConversionOptions';

// Mock zustand store
const mockSetConversionOptions = jest.fn();
jest.mock('../../stores/imageStore', () => ({
  useImageStore: () => ({
    conversionOptions: {
      targetFormat: 'webp',
      quality: 100,
      maxWidth: 1920,
      maxHeight: 1080,
      maxSizeMb: 1,
    },
    setConversionOptions: mockSetConversionOptions,
  }),
}));

describe('ConversionOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders conversion options title', () => {
    render(<ConversionOptions />);

    const title = screen.getByText(/변환 옵션/i);
    expect(title).toBeInTheDocument();
  });

  test('renders format buttons', () => {
    render(<ConversionOptions />);

    expect(screen.getByText('WEBP')).toBeInTheDocument();
    expect(screen.getByText('JPEG')).toBeInTheDocument();
    expect(screen.getByText('PNG')).toBeInTheDocument();
    expect(screen.getByText('JPG')).toBeInTheDocument();
  });

  test('renders quality slider', () => {
    render(<ConversionOptions />);

    const qualitySlider = screen.getByDisplayValue('100');
    expect(qualitySlider).toBeInTheDocument();
  });

  test('renders size inputs', () => {
    render(<ConversionOptions />);

    const maxWidthInput = screen.getByDisplayValue('1920');
    const maxHeightInput = screen.getByDisplayValue('1080');

    expect(maxWidthInput).toBeInTheDocument();
    expect(maxHeightInput).toBeInTheDocument();
  });

  test('renders max size input', () => {
    render(<ConversionOptions />);

    const maxSizeInput = screen.getByDisplayValue('1');
    expect(maxSizeInput).toBeInTheDocument();
  });

  test('format button click updates options', () => {
    render(<ConversionOptions />);

    const jpegButton = screen.getByText('JPEG');
    fireEvent.click(jpegButton);

    expect(mockSetConversionOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        targetFormat: 'jpeg',
      })
    );
  });

  test('quality slider change updates options', () => {
    render(<ConversionOptions />);

    const qualitySlider = screen.getByDisplayValue('100');
    fireEvent.change(qualitySlider, { target: { value: '90' } });

    expect(mockSetConversionOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        quality: 90,
      })
    );
  });

  test('max width input change updates options', () => {
    render(<ConversionOptions />);

    const maxWidthInput = screen.getByDisplayValue('1920');
    fireEvent.change(maxWidthInput, { target: { value: '1280' } });

    expect(mockSetConversionOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        maxWidth: 1280,
      })
    );
  });

  test('max height input change updates options', () => {
    render(<ConversionOptions />);

    const maxHeightInput = screen.getByDisplayValue('1080');
    fireEvent.change(maxHeightInput, { target: { value: '720' } });

    expect(mockSetConversionOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        maxHeight: 720,
      })
    );
  });

  test('max size input change updates options', () => {
    render(<ConversionOptions />);

    const maxSizeInput = screen.getByDisplayValue('1');
    fireEvent.change(maxSizeInput, { target: { value: '2' } });

    expect(mockSetConversionOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        maxSizeMb: 2,
      })
    );
  });
});
