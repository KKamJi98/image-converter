import React from 'react';
import { useImageStore } from '../stores/imageStore';
import './ConversionOptions.css';

export const ConversionOptions: React.FC = () => {
  const { conversionOptions, setConversionOptions } = useImageStore();

  const handleFormatChange = (format: string) => {
    setConversionOptions({ targetFormat: format });
  };

  const handleQualityChange = (quality: number) => {
    setConversionOptions({ quality });
  };

  const handleSizeChange = (field: string, value: string) => {
    const numValue = value ? parseInt(value, 10) : undefined;
    setConversionOptions({ [field]: numValue });
  };

  const handleMaxSizeChange = (value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    setConversionOptions({ maxSizeMb: numValue });
  };

  return (
    <div className="conversion-options card">
      <h3 className="section-title">변환 옵션</h3>
      
      <div className="option-group">
        <label className="option-label">출력 형식</label>
        <div className="format-buttons">
          {['webp', 'jpeg', 'png', 'jpg'].map((format) => (
            <button
              key={format}
              className={`format-btn ${
                conversionOptions.targetFormat === format ? 'active' : ''
              }`}
              onClick={() => handleFormatChange(format)}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {['jpeg', 'jpg', 'webp'].includes(conversionOptions.targetFormat) && (
        <div className="option-group">
          <label className="option-label">
            품질: {conversionOptions.quality}%
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={conversionOptions.quality || 85}
            onChange={(e) => handleQualityChange(parseInt(e.target.value, 10))}
            className="quality-slider"
          />
          <div className="slider-labels">
            <span>낮음</span>
            <span>높음</span>
          </div>
        </div>
      )}

      <div className="option-group">
        <label className="option-label">크기 조정 (선택사항)</label>
        <div className="size-inputs">
          <div className="input-group">
            <label htmlFor="maxWidth">최대 너비 (px)</label>
            <input
              id="maxWidth"
              type="number"
              placeholder="예: 1920"
              value={conversionOptions.maxWidth || ''}
              onChange={(e) => handleSizeChange('maxWidth', e.target.value)}
              className="size-input"
            />
          </div>
          <div className="input-group">
            <label htmlFor="maxHeight">최대 높이 (px)</label>
            <input
              id="maxHeight"
              type="number"
              placeholder="예: 1080"
              value={conversionOptions.maxHeight || ''}
              onChange={(e) => handleSizeChange('maxHeight', e.target.value)}
              className="size-input"
            />
          </div>
        </div>
      </div>

      <div className="option-group">
        <label className="option-label">파일 크기 제한 (선택사항)</label>
        <div className="input-group">
          <label htmlFor="maxSize">최대 크기 (MB)</label>
          <input
            id="maxSize"
            type="number"
            step="0.1"
            placeholder="예: 2.5"
            value={conversionOptions.maxSizeMb || ''}
            onChange={(e) => handleMaxSizeChange(e.target.value)}
            className="size-input"
          />
        </div>
      </div>
    </div>
  );
};
