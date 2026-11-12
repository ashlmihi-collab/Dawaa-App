import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Pill,
  Clock,
  Calendar,
  Send,
} from 'lucide-react';
import {
  speakArabic,
  stopSpeaking,
  parseVoiceCommand,
  VoiceCommandResult,
  VoiceContext,
} from '../utils/voiceAssistant';
import { useLanguage } from '../utils/translations';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceContext: VoiceContext;
  onExecuteCommand: (result: VoiceCommandResult) => void;
  initialQuery?: string;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  voiceContext,
  onExecuteCommand,
  initialQuery,
}) => {
  const { t, language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState<string>('');
  const [isSpeakingResponse, setIsSpeakingResponse] = useState(false);
  const [enableVoiceSpeech, setEnableVoiceSpeech] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [typedCommand, setTypedCommand] = useState('');

  const recognitionRef = useRef<any>(null);

  const QUICK_COMMANDS = language === 'ar' ? [
    { label: 'أخذت الدواء', icon: <Pill className="w-3.5 h-3.5 text-emerald-600" />, desc: 'تأكيد تناول الجرعة' },
    { label: 'ما هو دوائي القادم؟', icon: <Clock className="w-3.5 h-3.5 text-teal-600" />, desc: 'معرفة الجرعة التالية' },
    { label: 'اقرأ جدول أدوية اليوم', icon: <Calendar className="w-3.5 h-3.5 text-indigo-600" />, desc: 'استعراض مواعيد اليوم' },
  ] : [
    { label: 'I took the dose', icon: <Pill className="w-3.5 h-3.5 text-emerald-600" />, desc: 'Confirm dose taken' },
    { label: 'What is my next dose?', icon: <Clock className="w-3.5 h-3.5 text-teal-600" />, desc: 'Find next upcoming dose' },
    { label: 'Read today schedule', icon: <Calendar className="w-3.5 h-3.5 text-indigo-600" />, desc: 'View today schedule' },
  ];

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      stopSpeaking();
      return;
    }

    if (!assistantResponse) {
      const greeting = language === 'ar'
        ? 'أهلاً بك! أنا مساعدك الصوتي الصحي. تحدث إليّ أو اختر أمراً، وسأقوم بتنفيذه فوراً.'
        : 'Welcome! I am your health voice assistant. Speak or type your query below.';
      setAssistantResponse(greeting);
      if (enableVoiceSpeech && language === 'ar') {
        setIsSpeakingResponse(true);
        speakArabic(greeting, () => setIsSpeakingResponse(false));
      }
    }

    if (initialQuery) {
      processCommand(initialQuery);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const startListening = () => {
    stopSpeaking();
    setIsSpeakingResponse(false);
    setErrorMessage(null);
    setTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(language === 'ar' ? 'الخاصية غير مدعومة في متصفحك' : 'Voice recognition not supported');
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

      recognition.onerror = (e: any) => {
        setIsListening(false);
        setErrorMessage(language === 'ar' ? 'لم أتمكن من التقاط الصوت بدقة' : 'Could not detect voice input accurately');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setErrorMessage(language === 'ar' ? 'تعذر تشغيل الميكروفون' : 'Failed to access microphone');
    }
  };

  const processCommand = (text: string) => {
    const result = parseVoiceCommand(text, voiceContext);
    setAssistantResponse(result.spokenReply);

    if (enableVoiceSpeech && language === 'ar') {
      setIsSpeakingResponse(true);
      speakArabic(result.spokenReply, () => setIsSpeakingResponse(false));
    }

    onExecuteCommand(result);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedCommand.trim()) return;
    processCommand(typedCommand);
    setTypedCommand('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t.voiceAssistantTitle}</h2>
            </div>
          </div>
          <button
            onClick={() => {
              stopListening();
              stopSpeaking();
              onClose();
            }}
            className="w-9 h-9 rounded-xl hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 space-y-5">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl mb-3 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-300 scale-105'
                  : 'bg-teal-600 hover:bg-teal-700 text-white active:scale-95'
              }`}
            >
              {isListening ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
            </button>
            <p className="text-xs font-bold text-slate-700">
              {isListening ? t.listening : t.startListening}
            </p>
          </div>

          {/* Assistant Reply Card */}
          {assistantResponse && (
            <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80 space-y-1.5">
              <div className="text-[11px] font-bold text-teal-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>{language === 'ar' ? 'رد المساعد الصوتي:' : 'Assistant Response:'}</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {assistantResponse}
              </p>
            </div>
          )}

          {/* Quick Preset Prompts */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">{t.quickSuggestions}</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {QUICK_COMMANDS.map((cmd) => (
                <button
                  key={cmd.label}
                  onClick={() => processCommand(cmd.label)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-teal-300 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  {cmd.icon}
                  <span className="truncate">{cmd.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="pt-2">
            <div className="relative">
              <input
                type="text"
                value={typedCommand}
                onChange={(e) => setTypedCommand(e.target.value)}
                placeholder={t.typeCommandPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
              />
              <button
                type="submit"
                disabled={!typedCommand.trim()}
                className="absolute left-2 top-2 p-1.5 rounded-lg bg-teal-600 text-white disabled:opacity-40 hover:bg-teal-700 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
