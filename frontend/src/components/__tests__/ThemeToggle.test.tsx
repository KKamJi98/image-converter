import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';

// Mock zustand store for light theme
const mockToggleTheme = jest.fn();

jest.mock('../../stores/themeStore', () => ({
  useThemeStore: () => ({
    theme: 'light',
    toggleTheme: mockToggleTheme,
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders theme toggle button', () => {
    act(() => {
      render(<ThemeToggle />);
    });

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('shows moon icon for light theme', () => {
    act(() => {
      render(<ThemeToggle />);
    });

    const moonIcon = screen.getByTestId('moon-icon');
    expect(moonIcon).toBeInTheDocument();
  });

  test('handles theme toggle click', () => {
    act(() => {
      render(<ThemeToggle />);
    });

    const button = screen.getByRole('button');
    
    act(() => {
      fireEvent.click(button);
    });

    expect(mockToggleTheme).toHaveBeenCalled();
  });
});
