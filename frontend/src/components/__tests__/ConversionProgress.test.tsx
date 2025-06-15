import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConversionProgress } from '../ConversionProgress';

// Mock zustand store
jest.mock('../../stores/imageStore', () => ({
  useImageStore: () => ({
    progress: {
      isConverting: true,
      progress: 50,
      message: '변환 중...',
    },
  }),
}));

describe('ConversionProgress', () => {
  test('renders progress title', () => {
    render(<ConversionProgress />);

    const title = screen.getByText(/변환 진행 상황/i);
    expect(title).toBeInTheDocument();
  });

  test('renders progress message', () => {
    render(<ConversionProgress />);

    const message = screen.getByText(/변환 중.../i);
    expect(message).toBeInTheDocument();
  });

  test('renders progress bar', () => {
    render(<ConversionProgress />);

    const progressBar = screen.getByText('50%');
    expect(progressBar).toBeInTheDocument();
  });

  test('progress bar has correct width', () => {
    render(<ConversionProgress />);

    const progressFill = screen.getByTestId('progress-fill');
    expect(progressFill).toHaveStyle('width: 50%');
  });
});
