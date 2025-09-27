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

  React.useEffect(() => {
    const cancelExisting = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const target = progress.elapsedMs;

    if (!progress.isConverting || target <= displayRef.current) {
      cancelExisting();
      displayRef.current = target;
      setDisplayElapsedMs(target);
      return;
    }

    if (Math.abs(target - displayRef.current) < 16) {
      cancelExisting();
      displayRef.current = target;
      setDisplayElapsedMs(target);
      return;
    }

    const startValue = displayRef.current;
    const diff = target - startValue;
    const duration = Math.min(900, Math.max(320, diff * 1.75));
    let startTime: number | null = null;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progressRatio = Math.min(1, (timestamp - startTime) / duration);
      const eased = easeOutCubic(progressRatio);
      const nextValue = startValue + diff * eased;
      displayRef.current = nextValue;
      setDisplayElapsedMs(nextValue);

      if (progressRatio < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
        displayRef.current = target;
        setDisplayElapsedMs(target);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return cancelExisting;
  }, [progress.elapsedMs, progress.isConverting]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    },
    []
  );

  const stageIndex = TIMELINE.indexOf(progress.stage);
  const elapsedSeconds = displayElapsedMs / 1000;
  const elapsedSecondsLabel = React.useMemo(() => {
    return elapsedSeconds.toLocaleString('ko-KR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
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
