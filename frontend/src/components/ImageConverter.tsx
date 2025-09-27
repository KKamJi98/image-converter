import React from 'react';
import { FileUpload } from './FileUpload';
import { ConversionOptions } from './ConversionOptions';
import { ConversionProgress } from './ConversionProgress';
import { ConversionResult } from './ConversionResult';
import { useImageStore } from '../stores/imageStore';
import { convertImage } from '../services/imageService';
import type { ConversionStage } from '../types/conversion';
import './ImageConverter.css';

const STAGE_SEGMENTS: Record<ConversionStage, { base: number; span: number }> =
  {
    idle: { base: 0, span: 0 },
    upload: { base: 0, span: 30 },
    processing: { base: 30, span: 30 },
    download: { base: 60, span: 30 },
    finalizing: { base: 90, span: 9 },
    done: { base: 99, span: 1 },
  };

const STAGE_MESSAGES: Record<ConversionStage, string> = {
  idle: '',
  upload: '이미지를 업로드하는 중입니다... (브라우저 → 서버)',
  processing: '서버에서 이미지를 변환하는 중입니다...',
  download: '변환된 이미지를 내려받는 중입니다... (서버 → 브라우저)',
  finalizing: '결과를 정리하고 있습니다...',
  done: '변환이 완료되었습니다! 🎉',
};

const stagePercent = (stage: ConversionStage, ratio = 1): number => {
  const segment = STAGE_SEGMENTS[stage];
  if (!segment) {
    return 0;
  }
  const value = segment.base + segment.span * ratio;
  return Math.min(100, Math.max(0, Math.round(value)));
};

export const ImageConverter: React.FC = () => {
  const {
    selectedFile,
    conversionOptions,
    progress,
    convertedImageUrl,
    error,
    setProgress,
    setConvertedImageUrl,
    setConvertedMetadata,
    setError,
  } = useImageStore();

  const handleConvert = async () => {
    if (!selectedFile) return;

    if (convertedImageUrl) {
      URL.revokeObjectURL(convertedImageUrl);
      setConvertedImageUrl(null);
    }
    setConvertedMetadata(null);
    setError(null);
    const startedAt = performance.now();

    const updateStage = (
      stage: ConversionStage,
      ratio = stage === 'processing' ? 0.4 : 1,
      overrideMessage?: string
    ) => {
      const elapsedMs = performance.now() - startedAt;
      setProgress({
        stage,
        percent: stagePercent(stage, ratio),
        message: overrideMessage ?? STAGE_MESSAGES[stage],
        elapsedMs,
      });
    };

    setProgress({
      isConverting: true,
      stage: 'upload',
      percent: 0,
      message: STAGE_MESSAGES.upload,
      startedAt,
      elapsedMs: 0,
    });

    try {
      const result = await convertImage(selectedFile, conversionOptions, {
        onStageChange: (stage) => {
          if (stage === 'processing') {
            updateStage(stage, 0.25);
          } else if (stage === 'download') {
            updateStage(stage, 0.05);
          } else {
            updateStage(stage);
          }
        },
        onUploadProgress: (ratio) => {
          updateStage('upload', ratio);
        },
        onDownloadProgress: (ratio) => {
          updateStage('download', ratio > 0 ? ratio : 0.05);
        },
      });

      updateStage('finalizing');

      // Blob URL 생성
      const url = URL.createObjectURL(result.blob);
      const totalDurationSeconds = (performance.now() - startedAt) / 1000;
      setConvertedImageUrl(url);
      setConvertedMetadata({
        width: result.width,
        height: result.height,
        size: result.size,
        originalWidth: result.originalWidth,
        originalHeight: result.originalHeight,
        originalSize: result.originalSize,
        compressionRatio: result.compressionRatio,
        processTimeSeconds: totalDurationSeconds,
        targetFormat: result.targetFormat,
      });

      setProgress({
        isConverting: false,
        stage: 'done',
        percent: 100,
        message: STAGE_MESSAGES.done,
        elapsedMs: performance.now() - startedAt,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '변환 중 오류가 발생했습니다.'
      );
      setProgress({
        isConverting: false,
        stage: 'idle',
        percent: 0,
        message: '',
        startedAt: null,
        elapsedMs: 0,
      });
    }
  };

  const canConvert = selectedFile && !progress.isConverting;

  return (
    <div className="image-converter">
      <div className="converter-grid">
        <div className="upload-section">
          <FileUpload />
        </div>

        <div className="options-section">
          <ConversionOptions />
        </div>
      </div>

      {selectedFile && (
        <div className="convert-section">
          <button
            className="btn btn-primary convert-btn"
            onClick={handleConvert}
            disabled={!canConvert}
          >
            {progress.isConverting ? '변환 중...' : '이미지 변환'}
          </button>
        </div>
      )}

      {progress.isConverting && <ConversionProgress />}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {convertedImageUrl && <ConversionResult />}
    </div>
  );
};
