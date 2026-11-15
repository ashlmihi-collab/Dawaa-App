import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Send, Sparkles, Check, Info } from 'lucide-react';
import {
  VoiceContext,
  VoiceCommandResult,
  parseVoiceCommand,
  speakArabic,
  stopSpeaking,
} from '../utils/voiceAssistant';
import { useLanguage } from '../utils/translations';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceContext: VoiceContext;
  onExecuteCommand: (result: VoiceCommandResult) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  voiceContext,
  onExecuteCommand,
}) => {
  const { t, language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isSpeakingResponse, setIsSpeakingResponse] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [enableVoiceSpeech, setEnableVoiceSpeech] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const initialGreeting =
    language === 'ar'
      ? 'أهلاً بك! أنا مساعدك الصوتي الصحي. تحدث إليّ أو اختر أمراً، وسأقوم بتنفيذه فوراً.'
      : 'Welcome! I am your health voice assistant. Speak or type your query below.';

  useEffect(() => {
    if (isOpen) {
      setAssistantResponse(initialGreeting);
      setTranscript('');
      setErrorMessage(null);
    } else {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
    }
  }, [isOpen, initialGreeting]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const processCommand = useCallback(
    (text: string) => {
      const result = parseVoiceCommand(text, voiceContext, language);
      setAssistantResponse(result.spokenResponse);

      if (enableVoiceSpeech) {
        setIsSpeakingResponse(true);
        speakArabic(result.spokenResponse, () => setIsSpeakingResponse(false));
      }

      onExecuteCommand(result);
    },
    [voiceContext, language, enableVoiceSpeech, onExecuteCommand]
  );

  const startListening = useCallback(() => {
    stopSpeaking();
    setIsSpeakingResponse(false);
    setErrorMessage(null);
    setTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        language === 'ar'
          ? 'الخاصية غير مدعومة في متصفحك'
          : 'Voice recognition not supported'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[event.results.length - 1][0].transcript;
        setTranscript(text);

        if (event.results[event.results.length - 1].isFinal) {
          stopListening();
          processCommand(text);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setErrorMessage(
          language === 'ar'
            ? 'لم أتمكن من التقاط الصوت بدقة'
            : 'Could not detect voice input accurately'
        );
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setErrorMessage(
        language === 'ar'
          ? 'تعذر تشغيل ميكروفون الجهاز'
          : 'Could not access device microphone'
      );
    }
  }, [language, processCommand, stopListening]);

  const handleManualTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    stopSpeaking();
    processCommand(textInput.trim());
    setTextInput('');
  };

  const handleSuggestionClick = (commandText: string) => {
    stopSpeaking();
    setTranscript(commandText);
    processCommand(commandText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-teal-50 px-6 py-4 border-b border-teal-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {t.voiceAssistantTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Central Microphone Visualizer & Trigger Button */}
          <div className="flex flex-col items-center justify-center bg-slate-50/80 border border-slate-200/80 rounded-3xl p-8 relative overflow-hidden">
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-40 rounded-full bg-teal-500/10 animate-ping" />
                <div className="w-32 h-32 rounded-full bg-teal-500/20 animate-pulse" />
              </div>
            )}

            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
                isListening
                  ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30'
              }`}
            >
              {isListening ? (
                <MicOff className="w-10 h-10 animate-bounce" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>

            <span className="mt-4 font-bold text-sm text-slate-700">
              {isListening ? t.voiceListening : t.voiceTapToSpeak}
            </span>

            {transcript && (
              <div className="mt-3 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-teal-800 shadow-xs text-center">
                "{transcript}"
              </div>
            )}

            {errorMessage && (
              <div className="mt-3 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Assistant Response Box */}
          {assistantResponse && (
            <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>{t.voiceResponseTitle}</span>
                </div>
                <button
                  onClick={() => {
                    if (isSpeakingResponse) {
                      stopSpeaking();
                      setIsSpeakingResponse(false);
                    } else {
                      setIsSpeakingResponse(true);
                      speakArabic(assistantResponse, () => setIsSpeakingResponse(false));
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-teal-100 text-teal-700 transition-colors"
                  title="تكرار / إيقاف الصوت"
                >
                  {isSpeakingResponse ? (
                    <VolumeX className="w-4 h-4 text-rose-600" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {assistantResponse}
              </p>
            </div>
          )}

          {/* Quick Voice Command Suggestions */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.voiceQuickSuggestions}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => handleSuggestionClick(language === 'ar' ? 'أخذت الدواء' : 'I took the dose')}
                className="p-3 rounded-2xl bg-white hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-teal-900 text-start transition-all shadow-xs flex items-center justify-between"
              >
                <span>{language === 'ar' ? 'أخذت الدواء' : 'I took the dose'}</span>
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
              </button>

              <button
                onClick={() => handleSuggestionClick(language === 'ar' ? 'ما هو دوائي القادم؟' : 'What is my next dose?')}
                className="p-3 rounded-2xl bg-white hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-teal-900 text-start transition-all shadow-xs flex items-center justify-between"
              >
                <span>{language === 'ar' ? 'ما هو دوائي القادم؟' : 'What is my next dose?'}</span>
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
              </button>

              <button
                onClick={() => handleSuggestionClick(language === 'ar' ? 'اقرأ جدول أدوية اليوم' : 'Read today schedule')}
                className="p-3 rounded-2xl bg-white hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-teal-900 text-start transition-all shadow-xs flex items-center justify-between sm:col-span-2"
              >
                <span>{language === 'ar' ? 'اقرأ جدول أدوية اليوم' : 'Read today schedule'}</span>
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer (Type command manually) */}
        <form
          onSubmit={handleManualTextSubmit}
          className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={t.voiceTypeCommandPlaceholder}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <button
            type="submit"
            disabled={!textInput.trim()}
            className="w-10 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white flex items-center justify-center transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
