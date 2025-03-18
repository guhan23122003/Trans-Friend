// src/types.ts
export interface Translation {
  id: string;
  sourceText: string;
  sourceLanguage: string;
  targetText: string;
  targetLanguage: string;
  timestamp: number;
  isFavorite: boolean;
}