import React from 'react';
import { Translation } from '../types';
import { Star, StarOff, History, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TranslationHistoryProps {
  translations: Translation[];
  onToggleFavorite: (id: string) => void;
  onPlayTranslation: (text: string, lang: string) => void;
}

export function TranslationHistory({ 
  translations, 
  onToggleFavorite,
  onPlayTranslation 
}: TranslationHistoryProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <History className="w-5 h-5" />
        Translation History
      </h2>
      <div className="space-y-4">
        {translations.map((translation) => (
          <motion.div
            key={translation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  From {translation.sourceLanguage} to {translation.targetLanguage}
                </p>
                <p className="mt-1 text-gray-900">{translation.sourceText}</p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-indigo-600">{translation.targetText}</p>
                  <button
                    onClick={() => onPlayTranslation(translation.targetText, translation.targetLanguage)}
                    className="p-1 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                    title="Play translation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => onToggleFavorite(translation.id)}
                className="text-yellow-500 hover:text-yellow-600"
              >
                {translation.isFavorite ? (
                  <Star className="w-5 h-5 fill-current" />
                ) : (
                  <StarOff className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}