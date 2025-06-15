import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders image converter title', () => {
  render(<App />);

  const titleElement = screen.getByRole('heading', {
    name: /Image Converter/i,
  });
  expect(titleElement).toBeInTheDocument();
});

test('renders file upload section', () => {
  render(<App />);

  const uploadText = screen.getByText(
    /이미지를 드래그하거나 클릭하여 선택하세요/i
  );
  expect(uploadText).toBeInTheDocument();
});

test('renders conversion options section', () => {
  render(<App />);

  const optionsTitle = screen.getByText(/변환 옵션/i);
  expect(optionsTitle).toBeInTheDocument();
});
