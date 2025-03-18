import React from 'react';
import { Language } from '../types';
import { languages } from '../data/languages';
import { Globe2 } from 'lucide-react';

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
}

export function LanguageSelector({ value, onChange, label }: LanguageSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Globe2 className="w-4 h-4" />
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-lg border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        {languages.map((lang: Language) => (
          <option key={lang.code} value={lang.code}>
            {lang.name} ({lang.nativeName})
          </option>
        ))}
      </select>
    </div>
  );
}