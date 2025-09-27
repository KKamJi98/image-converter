export type ConversionStage =
  | 'idle'
  | 'upload'
  | 'processing'
  | 'download'
  | 'finalizing'
  | 'done';

export interface ConvertedMetadata {
  width: number;
  height: number;
  size: number;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  compressionRatio: number;
  processTimeSeconds: number;
  targetFormat: string;
}

export interface ConvertedImage extends ConvertedMetadata {
  blob: Blob;
}

export interface ProgressSnapshot {
  stage: ConversionStage;
  percent: number;
  message: string;
}
