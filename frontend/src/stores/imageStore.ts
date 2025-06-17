import { create } from 'zustand';

export interface ConversionOptions {
  targetFormat: string;
  maxWidth?: number;
  maxHeight?: number;
  maxSizeMb?: number;
  quality?: number;
}

export interface ConversionProgress {
  isConverting: boolean;
  progress: number;
  message: string;
}

interface ImageState {
  selectedFile: File | null;
  conversionOptions: ConversionOptions;
  progress: ConversionProgress;
  convertedImageUrl: string | null;
  convertedMetadata: { width: number; height: number; size: number } | null;
  error: string | null;

  setSelectedFile: (file: File | null) => void;
  setConversionOptions: (options: Partial<ConversionOptions>) => void;
  setProgress: (progress: Partial<ConversionProgress>) => void;
  setConvertedImageUrl: (url: string | null) => void;
  setConvertedMetadata: (
    metadata: { width: number; height: number; size: number } | null
  ) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  selectedFile: null,
  conversionOptions: {
    targetFormat: 'webp',
    quality: 100,
  },
  progress: {
    isConverting: false,
    progress: 0,
    message: '',
  },
  convertedImageUrl: null,
  convertedMetadata: null,
  error: null,
};

export const useImageStore = create<ImageState>((set) => ({
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
