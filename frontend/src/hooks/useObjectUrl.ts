import { useEffect, useState } from 'react';

/**
 * Blob이나 File에서 Object URL을 생성하고 수명 종료 시 정리합니다.
 */
export const useObjectUrl = (
  source: Blob | MediaSource | null
): string | null => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!source) {
      setUrl(null);
      return undefined;
    }

    const nextUrl = URL.createObjectURL(source);
    setUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [source]);

  return url;
};
