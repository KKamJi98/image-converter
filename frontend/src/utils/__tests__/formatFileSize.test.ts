import { formatFileSize } from '../formatFileSize';

describe('formatFileSize', () => {
  test('formats KB correctly', () => {
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  test('formats MB correctly', () => {
    expect(formatFileSize(2_500_000)).toBe('2.38 MB');
  });
});
