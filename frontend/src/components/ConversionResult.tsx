import React from 'react';
import { AlertTriangle, Download, Eye, Loader2, RotateCcw } from 'lucide-react';

import { useImageStore } from '../stores/imageStore';
import { formatFileSize } from '../utils/formatFileSize';
import './ConversionResult.css';

const PREVIEW_SIZE_THRESHOLD = 15 * 1024 * 1024; // 15MB 이상은 미리보기 지연 안내

export const ConversionResult: React.FC = () => {
  const {
    convertedImageUrl,
    selectedFile,
    convertedMetadata,
    conversionOptions,
    reset,
  } = useImageStore();

  const [isPreviewVisible, setPreviewVisible] = React.useState(false);
  const [isPreviewLoading, setPreviewLoading] = React.useState(false);

  React.useEffect(() => {
    if (!convertedMetadata) {
      setPreviewVisible(false);
      setPreviewLoading(false);
      return;
    }

    const shouldAutoShow =
      convertedMetadata.size <= PREVIEW_SIZE_THRESHOLD &&
      convertedMetadata.width <= 4000 &&
      convertedMetadata.height <= 4000;

    setPreviewVisible(shouldAutoShow);
  }, [convertedMetadata]);

  if (!convertedImageUrl || !convertedMetadata || !selectedFile) {
    return null;
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = convertedImageUrl;

    const originalName =
      selectedFile.name.split('.').slice(0, -1).join('.') || 'converted-image';
    const extension =
      convertedMetadata.targetFormat || conversionOptions.targetFormat;
    link.download = `${originalName}_converted.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    URL.revokeObjectURL(convertedImageUrl);
    reset();
  };

  const handlePreviewToggle = () => {
    if (!isPreviewVisible) {
      setPreviewLoading(true);
    }
    requestAnimationFrame(() => {
      setPreviewVisible(true);
      setPreviewLoading(false);
    });
  };

  const sizeDelta = convertedMetadata.size - convertedMetadata.originalSize;
  const sizeDeltaLabel = `${sizeDelta >= 0 ? '+' : '-'}${formatFileSize(Math.abs(sizeDelta))}`;
  const compressionPct = (1 - convertedMetadata.compressionRatio) * 100;
  const processTime = convertedMetadata.processTimeSeconds;
  const formatLabel = (
    convertedMetadata.targetFormat || conversionOptions.targetFormat
  ).toUpperCase();

  const shouldWarnPreview = convertedMetadata.size > PREVIEW_SIZE_THRESHOLD;

  return (
    <div className="conversion-result card">
      <div className="result-header">
        <h3 className="result-title">변환 완료</h3>
        <p className="result-subtitle">
          <span className="result-filename">{selectedFile.name}</span> 파일이
          성공적으로
          <br />
          <span className="result-format">{formatLabel}</span>으로 변환되었습니다.
        </p>
      </div>

      <div className="result-meta">
        <div className="result-summary">
          <div className="summary-item">
            <span className="summary-label">결과 형식</span>
            <strong className="summary-value">{formatLabel}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">해상도</span>
            <span className="summary-value">
              {convertedMetadata.originalWidth}×{convertedMetadata.originalHeight}{' '}
              → {convertedMetadata.width}×{convertedMetadata.height}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">용량 변화</span>
            <span className="summary-value">
              {formatFileSize(convertedMetadata.originalSize)} →{' '}
              {formatFileSize(convertedMetadata.size)} ({sizeDeltaLabel})
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">압축률</span>
            <span className="summary-value">
              {compressionPct === 0
                ? '변경 없음'
                : `${compressionPct > 0 ? '-' : '+'}${Math.abs(compressionPct).toFixed(1)}%`}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">처리 시간</span>
            <span className="summary-value">
              {processTime > 0 ? `${processTime.toFixed(2)}초` : '확인 중'}
            </span>
          </div>
          {conversionOptions.quality && (
            <div className="summary-item">
              <span className="summary-label">지정 품질</span>
              <span className="summary-value">{conversionOptions.quality}%</span>
            </div>
          )}
          {(conversionOptions.maxWidth || conversionOptions.maxHeight) && (
            <div className="summary-item">
              <span className="summary-label">크기 제한</span>
              <span className="summary-value">
                {conversionOptions.maxWidth
                  ? `${conversionOptions.maxWidth}px`
                  : '자유'}
                {' × '}
                {conversionOptions.maxHeight
                  ? `${conversionOptions.maxHeight}px`
                  : '자유'}
              </span>
            </div>
          )}
          {conversionOptions.maxSizeMb && (
            <div className="summary-item">
              <span className="summary-label">파일 크기 제한</span>
              <span className="summary-value">
                {conversionOptions.maxSizeMb}MB 이하
              </span>
            </div>
          )}
        </div>
        <div className="result-actions">
          <button className="btn btn-secondary result-reset-btn" onClick={handleReset}>
            <RotateCcw size={16} />
            다시 변환
          </button>
          <button className="btn btn-primary result-download-btn" onClick={handleDownload}>
            <Download size={16} />
            다운로드
          </button>
        </div>
      </div>

      <div className="result-preview">
        {!isPreviewVisible ? (
          <div className="preview-placeholder">
            <AlertTriangle size={18} />
            <div>
              <p className="placeholder-title">대용량 이미지 미리보기</p>
              <p className="placeholder-description">
                미리보기를 열면 브라우저에서 파일을 디코딩해야 하므로 시간이
                다소 걸릴 수 있습니다.
              </p>
            </div>
            <button className="btn btn-outline" onClick={handlePreviewToggle}>
              <Eye size={16} /> 미리보기 열기
            </button>
          </div>
        ) : (
          <div className="preview-canvas">
            {isPreviewLoading && (
              <div className="preview-loading">
                <Loader2 className="preview-spinner" size={24} />
                <span>미리보기를 준비 중입니다...</span>
              </div>
            )}
            <img
              src={convertedImageUrl}
              alt="변환된 이미지 미리보기"
              className="result-image"
              loading="lazy"
              style={{ opacity: isPreviewLoading ? 0 : 1 }}
              onLoad={() => setPreviewLoading(false)}
            />
          </div>
        )}

        {shouldWarnPreview && (
          <p className="preview-warning">
            <AlertTriangle size={14} />
            파일 크기가 매우 크기 때문에 미리보기나 추가 편집 시 브라우저 메모리
            사용량이 증가할 수 있습니다.
          </p>
        )}
      </div>
    </div>
  );
};
