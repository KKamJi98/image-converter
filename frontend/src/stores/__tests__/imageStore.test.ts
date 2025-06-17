import { renderHook, act } from '@testing-library/react';
import { useImageStore } from '../imageStore';

describe('imageStore', () => {
  test('initial state', () => {
    const { result } = renderHook(() => useImageStore());

    expect(result.current.selectedFile).toBeNull();
    expect(result.current.convertedImageUrl).toBeNull();
    expect(result.current.conversionOptions.targetFormat).toBe('webp');
    expect(result.current.conversionOptions.quality).toBe(100);
    expect(result.current.progress.isConverting).toBe(false);
    expect(result.current.progress.progress).toBe(0);
    expect(result.current.progress.message).toBe('');
    expect(result.current.error).toBeNull();
  });

  test('setSelectedFile', () => {
    const { result } = renderHook(() => useImageStore());
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    act(() => {
      result.current.setSelectedFile(file);
    });

    expect(result.current.selectedFile).toBe(file);
  });

  test('setConvertedImageUrl', () => {
    const { result } = renderHook(() => useImageStore());
    const url = 'data:image/webp;base64,test';

    act(() => {
      result.current.setConvertedImageUrl(url);
    });

    expect(result.current.convertedImageUrl).toBe(url);
  });

  test('setConversionOptions', () => {
    const { result } = renderHook(() => useImageStore());

    act(() => {
      result.current.setConversionOptions({ targetFormat: 'jpeg' });
    });

    expect(result.current.conversionOptions.targetFormat).toBe('jpeg');
    expect(result.current.conversionOptions.quality).toBe(100); // Should preserve other options
  });

  test('setConversionOptions with multiple options', () => {
    const { result } = renderHook(() => useImageStore());

    act(() => {
      result.current.setConversionOptions({
        targetFormat: 'png',
        maxWidth: 1280,
        maxHeight: 720,
        quality: 90,
      });
    });

    expect(result.current.conversionOptions.targetFormat).toBe('png');
    expect(result.current.conversionOptions.maxWidth).toBe(1280);
    expect(result.current.conversionOptions.maxHeight).toBe(720);
    expect(result.current.conversionOptions.quality).toBe(90);
  });

  test('setProgress', () => {
    const { result } = renderHook(() => useImageStore());

    act(() => {
      result.current.setProgress({ isConverting: true, progress: 50 });
    });

    expect(result.current.progress.isConverting).toBe(true);
    expect(result.current.progress.progress).toBe(50);
    expect(result.current.progress.message).toBe(''); // Should preserve other progress fields
  });

  test('setProgress with message', () => {
    const { result } = renderHook(() => useImageStore());

    act(() => {
      result.current.setProgress({
        isConverting: true,
        progress: 75,
        message: '변환 중...',
      });
    });

    expect(result.current.progress.isConverting).toBe(true);
    expect(result.current.progress.progress).toBe(75);
    expect(result.current.progress.message).toBe('변환 중...');
  });

  test('setError', () => {
    const { result } = renderHook(() => useImageStore());
    const error = 'Test error';

    act(() => {
      result.current.setError(error);
    });

    expect(result.current.error).toBe(error);
  });

  test('reset state', () => {
    const { result } = renderHook(() => useImageStore());
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    // Set some values
    act(() => {
      result.current.setSelectedFile(file);
      result.current.setConvertedImageUrl('test-url');
      result.current.setConversionOptions({
        targetFormat: 'jpeg',
        quality: 90,
      });
      result.current.setProgress({ isConverting: true, progress: 50 });
      result.current.setError('test error');
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.selectedFile).toBeNull();
    expect(result.current.convertedImageUrl).toBeNull();
    expect(result.current.conversionOptions.targetFormat).toBe('webp');
    expect(result.current.conversionOptions.quality).toBe(100);
    expect(result.current.progress.isConverting).toBe(false);
    expect(result.current.progress.progress).toBe(0);
    expect(result.current.progress.message).toBe('');
    expect(result.current.error).toBeNull();
  });
});
