import { createWithEqualityFn } from 'zustand/traditional';

import type { ConversionStage, ConvertedMetadata } from '../types/conversion';

export interface ConversionOptions {
  targetFormat: string;
  maxWidth?: number;
  maxHeight?: number;
  maxSizeMb?: number;
  quality?: number;
}

export interface ConversionProgress {
  isConverting: boolean;
  stage: ConversionStage;
  percent: number;
  message: string;
  startedAt: number | null;
  elapsedMs: number;
}

interface ImageState {
  selectedFile: File | null;
  conversionOptions: ConversionOptions;
  progress: ConversionProgress;
  convertedImageUrl: string | null;
  convertedMetadata: ConvertedMetadata | null;
  error: string | null;

  setSelectedFile: (file: File | null) => void;
  setConversionOptions: (options: Partial<ConversionOptions>) => void;
  setProgress: (progress: Partial<ConversionProgress>) => void;
  setConvertedImageUrl: (url: string | null) => void;
  setConvertedMetadata: (metadata: ConvertedMetadata | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: Omit<
  ImageState,
  keyof Pick<
    ImageState,
    | 'setSelectedFile'
    | 'setConversionOptions'
    | 'setProgress'
    | 'setConvertedImageUrl'
    | 'setConvertedMetadata'
    | 'setError'
    | 'reset'
  >
> = {
  selectedFile: null,
  conversionOptions: {
    targetFormat: 'webp',
    quality: 100,
  },
  progress: {
    isConverting: false,
    stage: 'idle',
    percent: 0,
    message: '',
    startedAt: null,
    elapsedMs: 0,
  },
  convertedImageUrl: null,
  convertedMetadata: null,
  error: null,
};

export const useImageStore = createWithEqualityFn<ImageState>()((set) => ({
  ...initialState,

  setSelectedFile: (file) => set({ selectedFile: file }),

  setConversionOptions: (options) =>
    set((state) => ({
      conversionOptions: { ...state.conversionOptions, ...options },
    })),

  setProgress: (progress) =>
    set((state) => ({
      progress: { ...state.progress, ...progress },
    })),

  setConvertedImageUrl: (url) => set({ convertedImageUrl: url }),
  setConvertedMetadata: (metadata) => set({ convertedMetadata: metadata }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
