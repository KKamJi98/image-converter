import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';

// Mock zustand store
const mockToggleTheme = jest.fn();
jest.mock('../../stores/themeStore', () => ({
  useThemeStore: () => ({
    theme: 'light',
    toggleTheme: mockToggleTheme,
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Moon: ({ size, 'data-testid': testId }: any) => (
    <div
      data-testid={testId || 'moon-icon'}
      style={{ width: size, height: size }}
    >
      Moon
    </div>
  ),
  Sun: ({ size, 'data-testid': testId }: any) => (
    <div
      data-testid={testId || 'sun-icon'}
      style={{ width: size, height: size }}
    >
      Sun
    </div>
  ),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders theme toggle button', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('calls toggleTheme when clicked', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  test('has correct aria-label', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
  });

  test('renders moon icon in light theme', () => {
    render(<ThemeToggle />);

    const moonIcon = screen.getByTestId('moon-icon');
    expect(moonIcon).toBeInTheDocument();
  });
});
