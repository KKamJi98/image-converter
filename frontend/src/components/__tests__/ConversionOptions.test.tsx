import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversionOptions } from '../ConversionOptions';

// Mock zustand store
const mockSetConversionOptions = jest.fn();

jest.mock('../../stores/imageStore', () => ({
  useImageStore: () => ({
    conversionOptions: {
      targetFormat: 'webp',
      quality: 85,
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
    act(() => {
      render(<ConversionOptions />);
    });

    const title = screen.getByText(/변환 옵션/i);
    expect(title).toBeInTheDocument();
  });

  test('renders format selection', () => {
    act(() => {
      render(<ConversionOptions />);
    });

    const formatLabel = screen.getByText(/출력 형식/i);
    expect(formatLabel).toBeInTheDocument();

    const webpButton = screen.getByText('WEBP');
    expect(webpButton).toBeInTheDocument();
    expect(webpButton).toHaveClass('active');
  });

  test('handles format change', () => {
    act(() => {
      render(<ConversionOptions />);
    });

    const jpegButton = screen.getByText('JPEG');
    
    act(() => {
      fireEvent.click(jpegButton);
    });

    expect(mockSetConversionOptions).toHaveBeenCalledWith({ targetFormat: 'jpeg' });
  });

  test('renders quality slider for lossy formats', () => {
    act(() => {
      render(<ConversionOptions />);
    });

    const qualityLabel = screen.getByText(/품질: 85%/i);
    expect(qualityLabel).toBeInTheDocument();

    const qualitySlider = screen.getByRole('slider');
    expect(qualitySlider).toBeInTheDocument();
    expect(qualitySlider).toHaveValue('85');
  });

  test('handles quality change', () => {
    act(() => {
      render(<ConversionOptions />);
    });

    const qualitySlider = screen.getByRole('slider');
    
    act(() => {
      fireEvent.change(qualitySlider, { target: { value: '90' } });
    });

    expect(mockSetConversionOptions).toHaveBeenCalledWith({ quality: 90 });
  });

  test('renders size inputs', () => {
    act(() => {
      render(<ConversionOptions />);
    });

    const maxWidthInput = screen.getByLabelText(/최대 너비/i);
    const maxHeightInput = screen.getByLabelText(/최대 높이/i);
    
    expect(maxWidthInput).toBeInTheDocument();
    expect(maxHeightInput).toBeInTheDocument();
    expect(maxWidthInput).toHaveValue(1920);
    expect(maxHeightInput).toHaveValue(1080);
  });

  test('handles width change', () => {
    act(() => {
      render(<ConversionOptions />);
    });

    const widthInput = screen.getByLabelText(/최대 너비/i);
    
    act(() => {
      fireEvent.change(widthInput, { target: { value: '1280' } });
    });

    expect(mockSetConversionOptions).toHaveBeenCalledWith({ maxWidth: 1280 });
  });

  test('handles height change', () => {
    act(() => {
      render(<ConversionOptions />);
    });

    const heightInput = screen.getByLabelText(/최대 높이/i);
    
    act(() => {
      fireEvent.change(heightInput, { target: { value: '720' } });
    });

    expect(mockSetConversionOptions).toHaveBeenCalledWith({ maxHeight: 720 });
  });

  test('renders file size limit input', () => {
    act(() => {
      render(<ConversionOptions />);
    });

    const fileSizeInput = screen.getByLabelText(/최대 크기/i);
    expect(fileSizeInput).toBeInTheDocument();
    expect(fileSizeInput).toHaveValue(1);
  });

  test('handles file size change', () => {
    act(() => {
      render(<ConversionOptions />);
    });

    const fileSizeInput = screen.getByLabelText(/최대 크기/i);
    
    act(() => {
      fireEvent.change(fileSizeInput, { target: { value: '2.5' } });
    });

    expect(mockSetConversionOptions).toHaveBeenCalledWith({ maxSizeMb: 2.5 });
  });
});
