// src/types/speech-api.d.ts
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }
  
  interface SpeechRecognitionError extends Event {
    error: string;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionError) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
  }
  
  interface SpeechRecognitionConstructor {
    new(): SpeechRecognition;
  }
  
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }