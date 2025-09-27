import { createSemaphore } from './semaphore';

const uploadSemaphore = createSemaphore(3);

interface UploadOptions {
  endpoint: string;
  formData?: FormData;
  fileName?: string;
  signal?: AbortSignal;
  onUploadComplete?: (elapsedMs: number) => void;
  onDownloadStart?: () => void;
  onDownloadProgress?: (
    ratio: number,
    receivedBytes: number,
    totalBytes?: number
  ) => void;
  logLabel?: string;
}

interface UploadResult {
  blob: Blob;
  headers: Headers;
  timings: {
    totalMs: number;
    uploadMs: number;
    downloadMs: number;
  };
}

const mergeSignals = (
  primary?: AbortSignal,
  secondary?: AbortSignal
): AbortSignal | undefined => {
  if (!primary) {
    return secondary;
  }
  if (!secondary) {
    return primary;
  }

  if ((primary as AbortSignal).aborted) {
    return primary;
  }
  if ((secondary as AbortSignal).aborted) {
    return secondary;
  }

  const controller = new AbortController();

  const abort = () => {
    controller.abort();
    cleanup();
  };

  const cleanup = () => {
    primary.removeEventListener('abort', abort);
    secondary.removeEventListener('abort', abort);
  };

  primary.addEventListener('abort', abort, { once: true });
  secondary.addEventListener('abort', abort, { once: true });

  return controller.signal;
};

export const uploadImage = async (
  blob: Blob,
  {
    endpoint,
    formData,
    fileName = 'upload.bin',
    signal,
    onUploadComplete,
    onDownloadStart,
    onDownloadProgress,
    logLabel = 'image-upload',
  }: UploadOptions
): Promise<UploadResult> => {
  const release = await uploadSemaphore.acquire(signal);
  const controller = new AbortController();
  const combinedSignal = mergeSignals(signal, controller.signal);

  try {
    const body = formData ?? new FormData();
    if (!formData) {
      body.append('file', blob, fileName);
    }

    const start = performance.now();
    const response = await fetch(endpoint, {
      method: 'POST',
      body,
      signal: combinedSignal,
    });
    const uploadCompleted = performance.now();
    onUploadComplete?.(uploadCompleted - start);

    if (!response.ok) {
      const errorPayload = await response.text().catch(() => '');
      throw new Error(
        `HTTP ${response.status} ${response.statusText}` +
          (errorPayload ? ` - ${errorPayload}` : '')
      );
    }

    const headers = response.headers;
    const totalBytesHeader = headers.get('content-length');
    const totalBytes = totalBytesHeader ? Number(totalBytesHeader) : undefined;

    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    let downloadStarted = false;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        if (value) {
          chunks.push(value);
          received += value.length;
          if (!downloadStarted) {
            downloadStarted = true;
            onDownloadStart?.();
          }
          if (totalBytes && totalBytes > 0) {
            onDownloadProgress?.(
              Math.min(1, received / totalBytes),
              received,
              totalBytes
            );
          } else if (received > 0) {
            onDownloadProgress?.(0.05, received);
          }
        }
      }
    }

    let blobResult: Blob;
    if (reader) {
      blobResult = new Blob(chunks, {
        type: headers.get('content-type') ?? 'application/octet-stream',
      });
    } else {
      if (!downloadStarted) {
        onDownloadStart?.();
      }
      blobResult = await response.blob();
      received = blobResult.size;
    }

    if (totalBytes && totalBytes > 0) {
      onDownloadProgress?.(1, received, totalBytes);
    } else if (received > 0) {
      onDownloadProgress?.(1, received);
    }

    const downloadCompleted = performance.now();
    const timings = {
      totalMs: downloadCompleted - start,
      uploadMs: uploadCompleted - start,
      downloadMs: downloadCompleted - uploadCompleted,
    };

    console.info(
      `[timing] ${logLabel} total=${timings.totalMs.toFixed(1)}ms upload=${timings.uploadMs.toFixed(1)}ms download=${timings.downloadMs.toFixed(1)}ms`
    );

    return { blob: blobResult, headers, timings };
  } catch (error) {
    console.warn(`[timing] ${logLabel} failed`, error);
    controller.abort();
    throw error;
  } finally {
    release();
  }
};
