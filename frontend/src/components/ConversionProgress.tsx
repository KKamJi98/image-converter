import React from 'react';
import { useImageStore } from '../stores/imageStore';
import './ConversionProgress.css';

export const ConversionProgress: React.FC = () => {
  const { progress } = useImageStore();

  return (
    <div className="conversion-progress card">
      <div className="progress-header">
        <h3 className="progress-title">변환 진행 상황</h3>
        <span className="progress-percentage">{progress.progress}%</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {progress.message && (
        <p className="progress-message">{progress.message}</p>
      )}
    </div>
  );
};
