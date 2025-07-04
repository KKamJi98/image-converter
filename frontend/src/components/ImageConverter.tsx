import React from 'react';
import { FileUpload } from './FileUpload';
import { ConversionOptions } from './ConversionOptions';
import { ConversionProgress } from './ConversionProgress';
import { ConversionResult } from './ConversionResult';
import { useImageStore } from '../stores/imageStore';
import { convertImage } from '../services/imageService';
import './ImageConverter.css';

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

    setError(null);
    setProgress({
      isConverting: true,
      progress: 0,
      message: '변환 준비 중...',
    });

    let progressInterval: NodeJS.Timeout | null = null;

    const startProgressAnimation = (
      start: number,
      end: number,
      duration = 2000
    ) => {
      const step = (end - start) / (duration / 100);
      let current = start;
      progressInterval = setInterval(() => {
        current += step;
        setProgress({ progress: Math.min(end, Math.round(current)) });
        if (current >= end) {
          if (progressInterval) clearInterval(progressInterval);
        }
      }, 100);
    };

    try {
      setProgress({ progress: 25, message: '이미지 업로드 중...' });
      startProgressAnimation(25, 90, 3000);

      const result = await convertImage(selectedFile, conversionOptions);

      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setProgress({ progress: 90, message: '변환 완료 처리 중...' });

      // Blob URL 생성
      const url = URL.createObjectURL(result.blob);
      setConvertedImageUrl(url);
      setConvertedMetadata({
        width: result.width,
        height: result.height,
        size: result.size,
      });

      setProgress({
        isConverting: false,
        progress: 100,
        message: '변환이 완료되었습니다!',
      });
    } catch (err) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setError(
        err instanceof Error ? err.message : '변환 중 오류가 발생했습니다.'
      );
      setProgress({ isConverting: false, progress: 0, message: '' });
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
