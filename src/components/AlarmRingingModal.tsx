import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Medication, TIME_SLOTS } from '../types/medication';
import { soundEngine, RINGTONES } from '../utils/soundEngine';
import { useLanguage } from '../utils/translations';
import { Bell, Check, Clock, X, Volume2, Pill, AlertCircle, Mic, MicOff } from 'lucide-react';
import { parseVoiceCommand, speakArabic, stopSpeaking } from '../utils/voiceAssistant';

interface AlarmRingingModalProps {
  medication: Medication;
  onTake: () => void;
  onSnooze: (minutes: number) => void;
  onSkip: () => void;
  snoozeMinutes?: number;
  volume?: number;
  vibrationEnabled?: boolean;
}

export const AlarmRingingModal: React.FC<AlarmRingingModalProps> = ({
  medication,
  onTake,
  onSnooze,
  onSkip,
  snoozeMinutes = 5,
  volume = 0.85,
  vibrationEnabled = true,
}) => {
  const { t, language } = useLanguage();
  const slotInfo = TIME_SLOTS[medication.timeSlot] || TIME_SLOTS.custom;
  const ringtone = RINGTONES.find((r) => r.id === medication.ringtoneId) || RINGTONES[0];

  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceHeardText, setVoiceHeardText] = useState('');
  const recognitionRef = useRef<any>(null);

  const stopVoice = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsVoiceListening(false);
  }, []);

  useEffect(() => {
    soundEngine.startAlarm(medication.ringtoneId || 'morning_gentle', volume, vibrationEnabled);

    return () => {
      soundEngine.stopAlarm();
      stopVoice();
    };
  }, [medication.ringtoneId, volume, vibrationEnabled, stopVoice]);

  const handleTake = () => {
    stopVoice();
    soundEngine.stopAlarm();
    if (language === 'ar') {
      speakArabic(`بالشفاء والعافية. تم تسجيل تناول ${medication.name}.`);
    }
    onTake();
  };

  const handleSnooze = () => {
    stopVoice();
    soundEngine.stopAlarm();
    if (language === 'ar') {
      speakArabic(`تم تأجيل التنبيه لمدة ${snoozeMinutes} دقائق.`);
    }
    onSnooze(snoozeMinutes);
  };

  const handleSkip = () => {
    stopVoice();
    soundEngine.stopAlarm();
    onSkip();
  };

  const toggleVoiceListening = () => {
    if (isVoiceListening) {
      stopVoice();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceHeardText(language === 'ar' ? 'التعرف الصوتي غير مدعوم في هذا المتصفح' : 'Voice recognition not supported');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsVoiceListening(true);
        setVoiceHeardText(language === 'ar' ? 'أستمع لصوتك الآن...' : 'Listening now...');
      };

      recognition.onresult = (event: any) => {
        const text = event.results[event.results.length - 1][0].transcript;
        setVoiceHeardText(text);

        if (event.results[event.results.length - 1].isFinal) {
          stopVoice();
          const result = parseVoiceCommand(text, {
            ringingMedication: medication,
            todayMeds: [medication],
            takenMedIds: [],
            allMeds: [medication],
            nextMedication: null,
          });

          if (result.type === 'TAKE_DOSE') {
            handleTake();
          } else if (result.type === 'SNOOZE') {
            handleSnooze();
          } else if (result.type === 'STOP_ALARM' || result.type === 'SKIP_DOSE') {
            handleSkip();
          }
        }
      };

      recognition.onerror = () => {
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsVoiceListening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-teal-100 flex flex-col">
        {/* Top visual alarm banner */}
        <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white p-7 text-center flex flex-col items-center">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-teal-500/30 animate-pulse-ring absolute" />
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg animate-bell-shake">
              <Bell className="w-8 h-8" />
            </div>
          </div>

          <div className="text-xs uppercase tracking-wider font-semibold text-teal-200 mb-1">
            {t.timeForDose}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-white">
            {medication.name}
          </h2>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-teal-50 text-sm font-medium backdrop-blur-sm">
            <span>{slotInfo.labelAr}</span>
            <span aria-hidden="true">·</span>
            <span dir="ltr" className="font-bold tabular-nums">{medication.time}</span>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-teal-100/90">
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            <span>{t.currentTone} {language === 'en' ? (ringtone.nameEn || ringtone.name) : ringtone.name}</span>
          </div>
        </div>

        {/* Medication Details Card */}
        <div className="p-5 space-y-3.5">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-500 font-medium">{t.dosageLabel}</div>
              <div className="text-base font-bold text-slate-900">{medication.dosage}</div>

              {medication.instructions && (
                <div className="mt-2 text-sm text-slate-600 flex items-start gap-1.5 bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{medication.instructions}</span>
                </div>
              )}
            </div>
          </div>

          {/* Spoken Command Feature */}
          <div className="p-3 bg-teal-50 border border-teal-200/80 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                onClick={toggleVoiceListening}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                  isVoiceListening
                    ? 'bg-rose-500 text-white animate-pulse ring-2 ring-rose-300'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
                title="Voice Command"
              >
                {isVoiceListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <div>
                <div className="text-xs font-bold text-teal-900 flex items-center gap-1">
                  <span>{t.voiceAssistantTitle}</span>
                  {isVoiceListening && <span className="text-rose-600 animate-pulse text-[11px]">({t.listening})</span>}
                </div>
                <div className="text-[11px] text-teal-700">
                  {voiceHeardText || t.startListening}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleTake}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold text-base md:text-lg flex items-center justify-center gap-3 shadow-lg shadow-teal-600/25 transition-all"
            >
              <Check className="w-6 h-6" />
              <span>{t.takeDoseBtn}</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleSnooze}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs md:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{t.snoozeBtn}</span>
              </button>

              <button
                onClick={handleSkip}
                className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium text-xs md:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
                <span>{t.skipBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
