import React, { useState, useEffect } from 'react';
import { RINGTONES, Ringtone, soundEngine } from '../utils/soundEngine';
import { AppSettings } from '../types/medication';
import { useLanguage } from '../utils/translations';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Check,
  X,
  Clock,
  Smartphone,
  Music,
  BellRing
} from 'lucide-react';

interface RingtoneSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRingtoneId: string;
  onSelectRingtone: (ringtoneId: string) => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onTriggerTestAlarm?: () => void;
  title?: string;
  subtitle?: string;
}

export const RingtoneSelectorModal: React.FC<RingtoneSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedRingtoneId,
  onSelectRingtone,
  settings,
  onUpdateSettings,
  onTriggerTestAlarm,
}) => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [playingToneId, setPlayingToneId] = useState<string | null>(null);
  const [localVolume, setLocalVolume] = useState<number>(settings.volume);
  const [localSnooze, setLocalSnooze] = useState<number>(settings.snoozeMinutes);
  const [localVibrate, setLocalVibrate] = useState<boolean>(settings.vibrationEnabled);

  useEffect(() => {
    setLocalVolume(settings.volume);
    setLocalSnooze(settings.snoozeMinutes);
    setLocalVibrate(settings.vibrationEnabled);
  }, [settings]);

  useEffect(() => {
    return () => {
      soundEngine.stopAlarm();
    };
  }, []);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: language === 'ar' ? 'جميع النغمات' : 'All Tones' },
    { id: 'calm', label: language === 'ar' ? 'هادئ ومريح' : 'Calm' },
    { id: 'classic', label: language === 'ar' ? 'كلاسيكي' : 'Classic' },
    { id: 'cheerful', label: language === 'ar' ? 'مبهج' : 'Cheerful' },
    { id: 'nature', label: language === 'ar' ? 'طبيعي' : 'Nature' },
    { id: 'energetic', label: language === 'ar' ? 'عالي التنبيه' : 'Energetic' },
  ];

  const filteredTones = activeCategory === 'all'
    ? RINGTONES
    : RINGTONES.filter((r) => r.category === activeCategory);

  const handlePlayTone = (tone: Ringtone) => {
    if (playingToneId === tone.id) {
      soundEngine.stopAlarm();
      setPlayingToneId(null);
    } else {
      setPlayingToneId(tone.id);
      soundEngine.previewTone(tone.id, localVolume);
      setTimeout(() => {
        setPlayingToneId((prev) => (prev === tone.id ? null : prev));
      }, 3500);
    }
  };

  const handleSelectTone = (toneId: string) => {
    onSelectRingtone(toneId);
    soundEngine.previewTone(toneId, localVolume);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLocalVolume(val);
    onUpdateSettings({ volume: val });
  };

  const handleVolumeCommit = () => {
    soundEngine.previewTone(selectedRingtoneId || 'morning_gentle', localVolume);
  };

  const handleSnoozeChange = (minutes: number) => {
    setLocalSnooze(minutes);
    onUpdateSettings({ snoozeMinutes: minutes });
  };

  const handleVibrateToggle = () => {
    const nextVal = !localVibrate;
    setLocalVibrate(nextVal);
    onUpdateSettings({ vibrationEnabled: nextVal });
    if (nextVal && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{t.ringtoneModalTitle}</h2>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.stopAlarm();
              onClose();
            }}
            className="w-10 h-10 rounded-xl hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Controls Bar */}
        <div className="px-5 py-4 bg-white border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Volume control */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                {localVolume === 0 ? (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-600" />
                )}
                <span>{t.soundVolume}</span>
              </span>
              <span className="tabular-nums font-mono text-amber-700 font-bold">
                {Math.round(localVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={localVolume}
              onChange={handleVolumeChange}
              onMouseUp={handleVolumeCommit}
              onTouchEnd={handleVolumeCommit}
              className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Snooze duration */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{t.snoozeDuration}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
              {[3, 5, 10, 15].map((m) => (
                <button
                  key={m}
                  onClick={() => handleSnoozeChange(m)}
                  className={`py-1 text-xs font-medium rounded-md transition-colors ${
                    localSnooze === m
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m} {t.minutes}
                </button>
              ))}
            </div>
          </div>

          {/* Vibration and Live Test */}
          <div className="flex items-center justify-between md:justify-end gap-3 pt-1 md:pt-0">
            <button
              onClick={handleVibrateToggle}
              className={`px-3 py-2 text-xs font-medium rounded-xl border flex items-center gap-2 transition-colors ${
                localVibrate
                  ? 'bg-teal-50 border-teal-200 text-teal-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{t.vibration}</span>
            </button>

            {onTriggerTestAlarm && (
              <button
                onClick={() => {
                  soundEngine.stopAlarm();
                  onTriggerTestAlarm();
                }}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <BellRing className="w-4 h-4" />
                <span>{t.testAlarmNow}</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-5 pt-3 border-b border-slate-100 overflow-x-auto flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 text-xs md:text-sm font-semibold whitespace-nowrap rounded-lg transition-colors ${
                activeCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Ringtones Grid */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredTones.map((tone) => {
            const isSelected = selectedRingtoneId === tone.id;
            const isPlaying = playingToneId === tone.id;

            return (
              <div
                key={tone.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handlePlayTone(tone)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isPlaying
                            ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                            : 'bg-teal-100 hover:bg-teal-200 text-teal-700'
                        }`}
                      >
                        {isPlaying ? (
                          <Square className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-sm md:text-base">
                            {tone.name}
                          </h4>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-600 text-white">
                              {t.isDefaultRingtone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between">
                  <button
                    onClick={() => handleSelectTone(tone.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'bg-teal-600 text-white'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.isDefaultRingtone}</span>
                      </>
                    ) : (
                      <span>{t.setAsDefault}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={() => {
              soundEngine.stopAlarm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs md:text-sm font-semibold transition-colors"
          >
            {t.saveChanges}
          </button>
        </div>
      </div>
    </div>
  );
};
