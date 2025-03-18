import React, { useState, useRef, useEffect } from 'react';
import { LanguageSelector } from './components/LanguageSelector';
import { TranslationHistory } from './components/TranslationHistory';
import { Translation } from './types';
import { Mic, Languages, Send, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

function App() {
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('ta');
  const [inputText, setInputText] = useState('');
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const translationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateText = async (text: string, from: string, to: string): Promise<string> => {
    setIsTranslating(true);
    try {
      // Using MyMemory Translation API which supports Indian languages
      const response = await axios.get('https://api.mymemory.translated.net/get', {
        params: {
          q: text,
          langpair: `${from}|${to}`,
        },
      });

      if (response.data.responseStatus === 200) {
        return response.data.responseData.translatedText;
      } else {
        throw new Error(response.data.responseDetails || 'Translation failed');
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      return `Error translating text: ${error.message}`;
    } finally {
      setIsTranslating(false);
    }
  };

  const speakText = (text: string, lang: string) => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    // Create and configure utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Get available voices
    const voices = synthRef.current.getVoices();
    const voice = voices.find((v: SpeechSynthesisVoice) => v.lang.startsWith(lang)) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }

    // Handle errors
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
    };

    synthRef.current.speak(utterance);
  };

  const handleTranslate = async () => {
    if (!inputText.trim() || isTranslating) return;

    const translatedText = await translateText(inputText, sourceLanguage, targetLanguage);
    
    if (translatedText) {
      const newTranslation: Translation = {
        id: Date.now().toString(),
        sourceText: inputText,
        sourceLanguage,
        targetText: translatedText,
        targetLanguage,
        timestamp: Date.now(),
        isFavorite: false,
      };

      setTranslations((prevTranslations: Translation[]) => [newTranslation, ...prevTranslations]);
      speakText(translatedText, targetLanguage);
      
      if (!isRecording) {
        setInputText('');
      }
    }
  };
  
  useEffect(() => {
    // Auto-translate after user stops typing or speaking
    if (autoTranslate && inputText.trim()) {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
      translationTimeoutRef.current = setTimeout(() => {
        handleTranslate();
      }, 1000);
    }
    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [inputText, autoTranslate]);

  const startRecording = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Now that we've just assigned it, we know recognitionRef.current is not null
      // TypeScript still needs us to check though
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = sourceLanguage;
  
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInputText(transcript);
        };
  
        recognitionRef.current.onerror = (event: SpeechRecognitionError) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };
  
        recognitionRef.current.onend = () => {
          setIsRecording(false);
          if (inputText.trim() && autoTranslate) {
            handleTranslate();
          }
        };
  
        recognitionRef.current.start();
        setIsRecording(true);
      }
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setTranslations((prevTranslations: Translation[]) =>
      prevTranslations.map((t: Translation) =>
        t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <Languages className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Trans Friend</h1>
          </div>
          <p className="mt-2 text-indigo-100">Bridging languages, connecting cultures</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="grid grid-cols-2 gap-4 mb-6">
            <LanguageSelector
              value={sourceLanguage}
              onChange={(code: string) => {
                setSourceLanguage(code);
                if (recognitionRef.current) {
                  stopRecording();
                  recognitionRef.current.lang = code;
                }
              }}
              label="Translate from"
            />
            <LanguageSelector
              value={targetLanguage}
              onChange={setTargetLanguage}
              label="Translate to"
            />
          </div>

          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="autoTranslate"
              checked={autoTranslate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoTranslate(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="autoTranslate" className="text-sm text-gray-600">
              Auto-translate as you type or speak
            </label>
          </div>

          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
              placeholder="Enter text to translate..."
              className="w-full h-32 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <AnimatePresence>
              {isTranslating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg"
                >
                  <div className="bg-white px-4 py-2 rounded-full shadow-lg">
                    <p className="text-indigo-600">Translating...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-full transition-colors ${
                  isRecording 
                    ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                    : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'
                }`}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isRecording ? (
                  <StopCircle className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !inputText.trim()}
                className={`bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  isTranslating || !inputText.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-indigo-700'
                }`}
              >
                <Send className="w-4 h-4" />
                {isTranslating ? 'Translating...' : 'Translate'}
              </button>
            </div>
          </div>
        </motion.div>

        <TranslationHistory
          translations={translations}
          onToggleFavorite={toggleFavorite}
          onPlayTranslation={(text: string, lang: string) => speakText(text, lang)}
        />
      </main>
    </div>
  );
}

export default App;