import React from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { useImageStore } from '../stores/imageStore';
import { formatFileSize } from '../utils/formatFileSize';
import './ConversionResult.css';

export const ConversionResult: React.FC = () => {
  const {
    convertedImageUrl,
    selectedFile,
    convertedMetadata,
    conversionOptions,
    reset,
  } = useImageStore();

  const handleDownload = () => {
    if (!convertedImageUrl || !selectedFile) return;

    const link = document.createElement('a');
    link.href = convertedImageUrl;

    const originalName = selectedFile.name.split('.').slice(0, -1).join('.');
    const extension = conversionOptions.targetFormat;
    link.download = `${originalName}_converted.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (convertedImageUrl) {
      URL.revokeObjectURL(convertedImageUrl);
    }
    reset();
  };

  if (!convertedImageUrl) return null;

  return (
    <div className="conversion-result card">
      <div className="result-header">
        <h3 className="result-title">변환 완료</h3>
        <div className="result-actions">
          <button className="btn btn-secondary" onClick={handleReset}>
            <RotateCcw size={16} />
            다시 변환
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={16} />
            다운로드
          </button>
        </div>
      </div>

      <div className="result-preview">
        <img src={convertedImageUrl} alt="Converted" className="result-image" />
      </div>

      <div className="result-info">
        <div className="info-item">
          <span className="info-label">형식:</span>
          <span className="info-value">
            {conversionOptions.targetFormat.toUpperCase()}
          </span>
        </div>
        {convertedMetadata && (
          <div className="info-item">
            <span className="info-label">결과 크기:</span>
            <span className="info-value">
              {convertedMetadata.width} × {convertedMetadata.height} /{' '}
              {formatFileSize(convertedMetadata.size)}
            </span>
          </div>
        )}
        {conversionOptions.quality && (
          <div className="info-item">
            <span className="info-label">품질:</span>
            <span className="info-value">{conversionOptions.quality}%</span>
          </div>
        )}
        {(conversionOptions.maxWidth || conversionOptions.maxHeight) && (
          <div className="info-item">
            <span className="info-label">크기 제한:</span>
            <span className="info-value">
              {conversionOptions.maxWidth && `${conversionOptions.maxWidth}px`}
              {conversionOptions.maxWidth &&
                conversionOptions.maxHeight &&
                ' × '}
              {conversionOptions.maxHeight &&
                `${conversionOptions.maxHeight}px`}
            </span>
          </div>
        )}
        {conversionOptions.maxSizeMb && (
          <div className="info-item">
            <span className="info-label">크기 제한:</span>
            <span className="info-value">
              {conversionOptions.maxSizeMb}MB 이하
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
