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
    setError,
  } = useImageStore();

  const handleConvert = async () => {
    if (!selectedFile) return;

    setError(null);
    setProgress({ isConverting: true, progress: 0, message: '변환 준비 중...' });

    try {
      setProgress({ progress: 25, message: '이미지 업로드 중...' });
      
      const result = await convertImage(selectedFile, conversionOptions);
      
      setProgress({ progress: 75, message: '변환 완료 처리 중...' });
      
      // Blob URL 생성
      const url = URL.createObjectURL(result);
      setConvertedImageUrl(url);
      
      setProgress({ 
        isConverting: false, 
        progress: 100, 
        message: '변환이 완료되었습니다!' 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '변환 중 오류가 발생했습니다.');
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
