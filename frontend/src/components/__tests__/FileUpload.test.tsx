import React from 'react';
import { render, screen } from '@testing-library/react';
import { FileUpload } from '../FileUpload';

// Mock zustand store
jest.mock('../../stores/imageStore', () => ({
  useImageStore: () => ({
    selectedFile: null,
    setSelectedFile: jest.fn(),
    setConvertedImageUrl: jest.fn(),
    setError: jest.fn(),
  }),
}));

test('renders file upload dropzone', () => {
  render(<FileUpload />);
  
  const uploadText = screen.getByText(/이미지를 드래그하거나 클릭하여 선택하세요/i);
  expect(uploadText).toBeInTheDocument();
  
  const supportText = screen.getByText(/PNG, JPG, JPEG, WebP, BMP, TIFF 지원/i);
  expect(supportText).toBeInTheDocument();
});

test('renders upload title', () => {
  render(<FileUpload />);
  
  const title = screen.getByText(/이미지 업로드/i);
  expect(title).toBeInTheDocument();
});
