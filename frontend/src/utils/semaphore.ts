export type ReleaseFn = () => void;

interface QueueEntry {
  attempt: () => void;
  signal?: AbortSignal;
}

export const createSemaphore = (limit: number) => {
  if (limit < 1) {
    throw new Error('Semaphore limit must be at least 1');
  }

  let active = 0;
  const queue: QueueEntry[] = [];

  const dispatch = () => {
    if (active >= limit) {
      return;
    }
    const next = queue.shift();
    if (next) {
      next.attempt();
    }
  };

  const acquire = (signal?: AbortSignal): Promise<ReleaseFn> => {
    if (signal?.aborted) {
      return Promise.reject(new DOMException('Aborted', 'AbortError'));
    }

    return new Promise<ReleaseFn>((resolve, reject) => {
      const cleanup = () => {
        signal?.removeEventListener('abort', onAbort);
      };

      const onAbort = () => {
        cleanup();
        const index = queue.findIndex((entry) => entry.attempt === tryAcquire);
        if (index >= 0) {
          queue.splice(index, 1);
        }
        reject(new DOMException('Aborted', 'AbortError'));
      };

      const tryAcquire = () => {
        if (signal?.aborted) {
          cleanup();
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }

        if (active < limit) {
          active += 1;
          cleanup();
          resolve(() => {
            active = Math.max(0, active - 1);
            dispatch();
          });
        } else {
          queue.push({ attempt: tryAcquire, signal });
        }
      };

      if (signal) {
        signal.addEventListener('abort', onAbort, { once: true });
      }

      tryAcquire();
    });
  };

  return { acquire };
};
