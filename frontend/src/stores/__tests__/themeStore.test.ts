import { renderHook, act } from '@testing-library/react';
import { useThemeStore } from '../themeStore';

describe('themeStore', () => {
  test('initial state is light theme', () => {
    const { result } = renderHook(() => useThemeStore());

    expect(result.current.theme).toBe('light');
  });

  test('can toggle theme', () => {
    const { result } = renderHook(() => useThemeStore());

    // Initially light
    expect(result.current.theme).toBe('light');

    // Toggle to dark
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');

    // Toggle back to light
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');
  });
});
