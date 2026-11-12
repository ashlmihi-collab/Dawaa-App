import React from 'react';
import { Medication, TIME_SLOTS } from '../types/medication';
import { Clock, BellRing, Sparkles, TrendingUp } from 'lucide-react';
import { useLanguage } from '../utils/translations';

interface TodayStatsBarProps {
  todayMeds: Medication[];
  takenMedIds: string[];
  currentArabicDateStr: string;
  nextMedication: Medication | null;
  onTestAlarm: () => void;
  onOpenSoundSettings: () => void;
  currentRingtoneName: string;
  onOpenAdherenceReport?: () => void;
}

export const TodayStatsBar: React.FC<TodayStatsBarProps> = ({
  todayMeds,
  takenMedIds,
  currentArabicDateStr,
  nextMedication,
  onTestAlarm,
  onOpenSoundSettings,
  currentRingtoneName,
  onOpenAdherenceReport,
}) => {
  const { t, language } = useLanguage();
  const totalToday = todayMeds.length;
  const takenCount = todayMeds.filter((m) => takenMedIds.includes(m.id)).length;
  const percentage = totalToday > 0 ? Math.round((takenCount / totalToday) * 100) : 0;

  const getSlotLabel = (slot: keyof typeof TIME_SLOTS) => {
    if (slot === 'morning') return t.slotMorning;
    if (slot === 'before_lunch') return t.slotBeforeLunch;
    if (slot === 'during_lunch') return t.slotDuringLunch;
    if (slot === 'night') return t.slotNight;
    return t.slotCustom;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Today Progress */}
      <div className="bg-white rounded-3xl border-2 border-blue-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold text-slate-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              {currentArabicDateStr}
            </span>
            <span className="font-extrabold text-blue-700 tabular-nums text-sm font-mono">
              {percentage}% {t.todayAdherence}
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {takenCount} <span className="text-sm font-normal text-slate-500">{t.dosesOf}</span> {totalToday} {t.dosesUnit}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {percentage === 100
              ? t.allDosesCompleted
              : `${totalToday - takenCount} ${t.dosesRemaining}`}
          </p>
        </div>

        {/* Progress Bar & Quick Link */}
        <div className="mt-4 space-y-2">
          <div className="w-full h-3 bg-blue-50 rounded-full overflow-hidden border border-blue-100 p-0.5">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {onOpenAdherenceReport && (
            <button
              onClick={onOpenAdherenceReport}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 transition-colors pt-1"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t.viewAdherenceChart}</span>
            </button>
          )}
        </div>
      </div>

      {/* Card 2: Next Upcoming Dose */}
      <div className="bg-white rounded-3xl border-2 border-purple-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          <div className="text-xs font-bold text-purple-700 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>{t.nextDose}</span>
          </div>

          {nextMedication ? (
            <div>
              <h4 className="text-lg font-black text-slate-900 truncate">
                {nextMedication.name}
              </h4>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-900 border border-purple-200">
                  {getSlotLabel(nextMedication.timeSlot)}
                </span>
                <span className="text-xs text-slate-600">
                  {t.timeLabel} <strong className="font-mono text-purple-900 font-bold" dir="ltr">{nextMedication.time}</strong>
                </span>
              </div>
              {nextMedication.instructions && (
                <p className="text-xs text-slate-600 mt-2 bg-purple-50/60 p-2 rounded-xl border border-purple-100 truncate">
                  💡 {nextMedication.instructions}
                </p>
              )}
            </div>
          ) : (
            <div className="py-2">
              <div className="text-base font-bold text-slate-700">{t.noDosesRemaining}</div>
              <p className="text-xs text-slate-400 mt-0.5">{t.allDosesDoneDesc}</p>
            </div>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between font-semibold">
          <span>{t.alarmAutoEnabled}</span>
          <span className="font-mono text-purple-700 font-bold">{t.monitoring247}</span>
        </div>
      </div>

      {/* Card 3: Sound System & Alarm Test */}
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white rounded-3xl p-5 shadow-md shadow-amber-500/15 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-amber-100 mb-1.5">
            <span className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{t.soundSystemTitle}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-black">
              {t.tonesCount}
            </span>
          </div>

          <h4 className="text-lg font-black text-white">
            {t.currentTone} {currentRingtoneName}
          </h4>
          <p className="text-xs text-amber-100/95 mt-1 leading-relaxed">
            {t.soundBoostDesc}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/20 flex items-center gap-2">
          <button
            onClick={onTestAlarm}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white text-amber-950 font-black text-xs sm:text-sm hover:bg-amber-50 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
          >
            <BellRing className="w-4 h-4 text-amber-600" />
            <span>{t.testAlarmNow}</span>
          </button>

          <button
            onClick={onOpenSoundSettings}
            className="py-2.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors whitespace-nowrap"
          >
            {t.changeRingtone}
          </button>
        </div>
      </div>
    </div>
  );
};
