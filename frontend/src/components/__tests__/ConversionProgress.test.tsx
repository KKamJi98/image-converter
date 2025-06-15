import React, { act } from 'react';
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
    act(() => {
      render(<ConversionProgress />);
    });

    const title = screen.getByText(/변환 진행 상황/i);
    expect(title).toBeInTheDocument();
  });

  test('renders progress percentage', () => {
    act(() => {
      render(<ConversionProgress />);
    });

    const progressText = screen.getByText('50%');
    expect(progressText).toBeInTheDocument();
  });

  test('renders progress message', () => {
    act(() => {
      render(<ConversionProgress />);
    });

    const message = screen.getByText(/변환 중.../i);
    expect(message).toBeInTheDocument();
  });

  test('renders progress bar with correct width', () => {
    act(() => {
      render(<ConversionProgress />);
    });

    const progressFill = document.querySelector('.progress-fill');
    expect(progressFill).toHaveStyle('width: 50%');
  });
});
