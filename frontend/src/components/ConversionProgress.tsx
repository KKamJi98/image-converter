import React from 'react';
import { Loader2 } from 'lucide-react';

import { useImageStore } from '../stores/imageStore';
import type { ConversionStage } from '../types/conversion';
import './ConversionProgress.css';

const TIMELINE: ConversionStage[] = [
  'upload',
  'processing',
  'download',
  'finalizing',
];

const STAGE_LABELS: Record<ConversionStage, string> = {
  idle: '대기',
  upload: '업로드',
  processing: '변환',
  download: '다운로드',
  finalizing: '정리',
  done: '완료',
};

export const ConversionProgress: React.FC = () => {
  const { progress } = useImageStore();
  const [displayElapsedMs, setDisplayElapsedMs] = React.useState(
    progress.elapsedMs
  );
  const displayRef = React.useRef(progress.elapsedMs);
  const rafRef = React.useRef<number | null>(null);

  const commitElapsed = React.useCallback((value: number) => {
    const next = Math.max(0, Math.floor(value / 100) * 100);
    if (next <= displayRef.current) {
      return;
    }
    displayRef.current = next;
    setDisplayElapsedMs(next);
  }, []);

  React.useEffect(() => {
    const cancelExisting = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    if (!progress.isConverting || !progress.startedAt) {
      cancelExisting();
      displayRef.current = progress.elapsedMs;
      setDisplayElapsedMs(progress.elapsedMs);
      return;
    }

    const tick = () => {
      const runtime = performance.now() - progress.startedAt!;
      const baseline = Math.max(progress.elapsedMs, runtime);
      commitElapsed(baseline);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return cancelExisting;
  }, [
    commitElapsed,
    progress.elapsedMs,
    progress.isConverting,
    progress.startedAt,
  ]);

  React.useEffect(() => {
    if (!progress.isConverting) {
      displayRef.current = progress.elapsedMs;
      setDisplayElapsedMs(progress.elapsedMs);
    }
  }, [progress.elapsedMs, progress.isConverting]);

  const stageIndex = TIMELINE.indexOf(progress.stage);
  const elapsedSeconds = displayElapsedMs / 1000;
  const elapsedSecondsLabel = React.useMemo(() => {
    const integerSeconds = Math.max(0, Math.floor(elapsedSeconds));
    return integerSeconds.toLocaleString('ko-KR');
  }, [elapsedSeconds]);

  return (
    <div className="conversion-progress card" role="status" aria-live="polite">
      <div className="progress-header">
        <div>
          <h3 className="progress-title">변환 진행 상황</h3>
          <p className="progress-subtitle">
            현재 단계: {STAGE_LABELS[progress.stage] ?? '대기'}
          </p>
        </div>
        <span className="progress-percentage">{progress.percent}%</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          data-testid="progress-fill"
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      <div className="progress-timeline">
        {TIMELINE.map((stage, index) => {
          const status =
            index < stageIndex
              ? 'completed'
              : index === stageIndex
                ? 'active'
                : 'upcoming';
          return (
            <div
              key={stage}
              className={`timeline-item timeline-item--${status}`}
            >
              <div className="timeline-indicator" aria-hidden="true">
                {status === 'active' ? (
                  <Loader2 className="timeline-spinner" size={16} />
                ) : null}
              </div>
              <span className="timeline-label">{STAGE_LABELS[stage]}</span>
            </div>
          );
        })}
      </div>

      <div className="progress-footer">
        {progress.message && (
          <p className="progress-message">{progress.message}</p>
        )}
        <span className="progress-meta">
          경과 시간: {elapsedSecondsLabel}초
        </span>
      </div>
    </div>
  );
};
