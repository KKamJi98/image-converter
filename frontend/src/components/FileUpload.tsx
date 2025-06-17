import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { useImageStore } from '../stores/imageStore';
import { formatFileSize } from '../utils/formatFileSize';
import './FileUpload.css';

export const FileUpload: React.FC = () => {
  const { selectedFile, setSelectedFile, setConvertedImageUrl, setError } =
    useImageStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        setConvertedImageUrl(null);
        setError(null);
      }
    },
    [setSelectedFile, setConvertedImageUrl, setError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = () => {
    setSelectedFile(null);
    setConvertedImageUrl(null);
    setError(null);
  };

  return (
    <div className="file-upload card">
      <h3 className="section-title">이미지 업로드</h3>

      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="dropzone-content">
            <Upload size={48} className="dropzone-icon" />
            <p className="dropzone-text">
              {isDragActive
                ? '이미지를 여기에 놓으세요'
                : '이미지를 드래그하거나 클릭하여 선택하세요'}
            </p>
            <p className="dropzone-subtext">
              PNG, JPG, JPEG, WebP, BMP, TIFF 지원 (최대 50MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="selected-file">
          <div className="file-info">
            <ImageIcon size={24} className="file-icon" />
            <div className="file-details">
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              className="remove-file-btn"
              onClick={removeFile}
              aria-label="파일 제거"
            >
              <X size={20} />
            </button>
          </div>

          {selectedFile.type.startsWith('image/') && (
            <div className="file-preview">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="preview-image"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
