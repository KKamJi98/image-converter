import { renderHook, act } from '@testing-library/react';
import { useThemeStore } from '../themeStore';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock zustand persist
jest.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
}));

describe('themeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initial state - default light theme', () => {
    const { result } = renderHook(() => useThemeStore());

    expect(result.current.theme).toBe('light');
  });

  test('toggleTheme from light to dark', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
  });

  test('toggleTheme from dark to light', () => {
    const { result } = renderHook(() => useThemeStore());

    // First toggle to dark
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');

    // Then toggle back to light
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
  });

  test('multiple toggles work correctly', () => {
    const { result } = renderHook(() => useThemeStore());

    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');
  });
});
