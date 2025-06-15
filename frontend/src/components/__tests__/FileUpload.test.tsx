import React from 'react';
import { render, screen } from '@testing-library/react';
import { FileUpload } from '../FileUpload';

// Mock zustand store
jest.mock('../../stores/imageStore', () => ({
  useImageStore: () => ({
    selectedFile: null,
    setSelectedFile: jest.fn(),
    setError: jest.fn(),
  }),
}));

describe('FileUpload', () => {
  test('renders file upload dropzone', () => {
    render(<FileUpload />);

    const uploadText = screen.getByText(
      /이미지를 드래그하거나 클릭하여 선택하세요/i
    );
    expect(uploadText).toBeInTheDocument();
  });

  test('shows supported formats', () => {
    render(<FileUpload />);

    const supportedText = screen.getByText(
      /PNG, JPG, JPEG, WebP, BMP, TIFF 지원/i
    );
    expect(supportedText).toBeInTheDocument();
  });
});
