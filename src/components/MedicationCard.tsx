import React, { useState } from 'react';
import { Medication, TIME_SLOTS, DAYS_OF_WEEK } from '../types/medication';
import { RINGTONES, soundEngine } from '../utils/soundEngine';
import { useLanguage } from '../utils/translations';
import {
  Pill,
  Check,
  CheckCircle2,
  Play,
  Square,
  Edit3,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface MedicationCardProps {
  medication: Medication;
  isTakenToday: boolean;
  takenTimeToday?: string;
  onToggleTaken: (medId: string) => void;
  onEdit: (med: Medication) => void;
  onDelete: (medId: string) => void;
  onToggleEnabled: (medId: string) => void;
  currentArabicDayIndex: number;
}

const COLOR_CLASSES: Record<string, { bg: string; text: string; lightBg: string; border: string; accentBadge: string }> = {
  teal: { bg: 'bg-teal-500', text: 'text-teal-700', lightBg: 'bg-teal-50', border: 'border-teal-200', accentBadge: 'bg-teal-100 text-teal-800' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-700', lightBg: 'bg-emerald-50', border: 'border-emerald-200', accentBadge: 'bg-emerald-100 text-emerald-800' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-700', lightBg: 'bg-blue-50', border: 'border-blue-200', accentBadge: 'bg-blue-100 text-blue-800' },
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-700', lightBg: 'bg-indigo-50', border: 'border-indigo-200', accentBadge: 'bg-indigo-100 text-indigo-800' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-700', lightBg: 'bg-purple-50', border: 'border-purple-200', accentBadge: 'bg-purple-100 text-purple-800' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-700', lightBg: 'bg-amber-50', border: 'border-amber-200', accentBadge: 'bg-amber-100 text-amber-800' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-700', lightBg: 'bg-orange-50', border: 'border-orange-200', accentBadge: 'bg-orange-100 text-orange-800' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-700', lightBg: 'bg-rose-50', border: 'border-rose-200', accentBadge: 'bg-rose-100 text-rose-800' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-700', lightBg: 'bg-cyan-50', border: 'border-cyan-200', accentBadge: 'bg-cyan-100 text-cyan-800' },
  sky: { bg: 'bg-sky-500', text: 'text-sky-700', lightBg: 'bg-sky-50', border: 'border-sky-200', accentBadge: 'bg-sky-100 text-sky-800' },
};

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  isTakenToday,
  takenTimeToday,
  onToggleTaken,
  onEdit,
  onDelete,
  onToggleEnabled,
  currentArabicDayIndex,
}) => {
  const { t, language } = useLanguage();
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const slot = TIME_SLOTS[medication.timeSlot] || TIME_SLOTS.custom;
  const ringtone = RINGTONES.find((r) => r.id === medication.ringtoneId) || RINGTONES[0];
  const colorStyle = COLOR_CLASSES[medication.color] || COLOR_CLASSES.teal;
  const isScheduledForToday = medication.days.includes(currentArabicDayIndex);

  const getSlotLabel = (slotKey: keyof typeof TIME_SLOTS) => {
    if (slotKey === 'morning') return t.slotMorning;
    if (slotKey === 'before_lunch') return t.slotBeforeLunch;
    if (slotKey === 'during_lunch') return t.slotDuringLunch;
    if (slotKey === 'night') return t.slotNight;
    return t.slotCustom;
  };

  const handlePlayPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingSound) {
      soundEngine.stopAlarm();
      setIsPlayingSound(false);
    } else {
      setIsPlayingSound(true);
      soundEngine.previewTone(medication.ringtoneId || 'morning_gentle', 0.85);
      setTimeout(() => setIsPlayingSound(false), 3000);
    }
  };

  const formatDisplayTime = (timeStr: string) => {
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr;
    const period = h >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${h}:${m} ${period}`;
  };

  const isLowStock =
    medication.stockCount !== undefined &&
    medication.stockAlertThreshold !== undefined &&
    medication.stockCount <= medication.stockAlertThreshold;

  const getDayShortLabel = (dayIdx: number) => {
    switch (dayIdx) {
      case 0: return t.daySatShort;
      case 1: return t.daySunShort;
      case 2: return t.dayMonShort;
      case 3: return t.dayTueShort;
      case 4: return t.dayWedShort;
      case 5: return t.dayThuShort;
      case 6: return t.dayFriShort;
      default: return '';
    }
  };

  return (
    <div
      className={`relative rounded-3xl border-2 transition-all duration-200 overflow-hidden bg-white shadow-sm hover:shadow-md ${
        !medication.enabled
          ? 'opacity-60 border-slate-200 bg-slate-50/50'
          : isTakenToday
          ? 'border-emerald-300 ring-2 ring-emerald-100 bg-gradient-to-b from-emerald-50/30 to-white'
          : `${colorStyle.border} hover:border-slate-300`
      }`}
    >
      {/* Top Color Strip */}
      <div className={`h-1.5 w-full ${colorStyle.bg}`} />

      {/* Top Slot & Timing Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-xl text-xs font-bold border shadow-xs ${slot.badgeBg}`}>
            {getSlotLabel(medication.timeSlot)}
          </span>
          <span className="text-xs text-slate-600 font-bold font-mono bg-white px-2 py-0.5 rounded-lg border border-slate-200/80" dir="ltr">
            {formatDisplayTime(medication.time)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Preview Button */}
          <button
            onClick={handlePlayPreview}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isPlayingSound
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30 animate-pulse'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title={`${t.playPreview}: ${ringtone.name}`}
          >
            {isPlayingSound ? (
              <Square className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span className="hidden sm:inline text-[11px]">
              {language === 'en' ? (ringtone.nameEn || ringtone.name) : ringtone.name}
            </span>
          </button>

          {/* Enable / Disable toggle */}
          <button
            onClick={() => onToggleEnabled(medication.id)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
              medication.enabled ? colorStyle.bg : 'bg-slate-300'
            }`}
            title={medication.enabled ? 'Disable' : 'Enable'}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                medication.enabled ? (language === 'ar' ? 'translate-x-0' : 'translate-x-5') : (language === 'ar' ? '-translate-x-5' : 'translate-x-0')
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colorStyle.lightBg} ${colorStyle.text} border-2 ${colorStyle.border} shadow-xs`}
            >
              <Pill className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-base md:text-lg text-slate-900 tracking-tight">
                  {medication.name}
                </h3>
                {isTakenToday && (
                  <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    {t.taken}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-1 flex items-center gap-1.5">
                <span className="text-slate-400 font-normal">{t.dosageLabel}</span>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${colorStyle.accentBadge}`}>
                  {medication.dosage}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {medication.instructions && (
          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 flex items-start gap-2">
            <span className="text-slate-400 font-bold shrink-0">{t.instructionsLabel}</span>
            <span>{medication.instructions}</span>
          </div>
        )}

        {/* Weekdays pills indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3 pt-1 border-t border-slate-100/80">
          <span className="text-[11px] font-medium text-slate-400">{t.repeatDaysLabel}:</span>
          <div className="flex items-center gap-1">
            {DAYS_OF_WEEK.map((d) => {
              const isIncluded = medication.days.includes(d.index);
              const isToday = d.index === currentArabicDayIndex;
              return (
                <span
                  key={d.index}
                  className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center ${
                    isIncluded
                      ? isToday
                        ? 'bg-teal-600 text-white ring-2 ring-teal-200'
                        : 'bg-slate-100 text-slate-700'
                      : 'text-slate-300'
                  }`}
                >
                  {getDayShortLabel(d.index)[0]}
                </span>
              );
            })}
          </div>
        </div>

        {/* Stock Alert */}
        {medication.stockCount !== undefined && (
          <div
            className={`p-2.5 rounded-xl border mb-3 flex items-center justify-between text-xs transition-colors ${
              isLowStock
                ? 'bg-rose-50/90 border-rose-200 text-rose-950 ring-1 ring-rose-200'
                : 'bg-slate-50 border-slate-100 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {isLowStock ? (
                <span className="flex items-center gap-1 font-extrabold text-rose-600 animate-pulse text-xs">
                  <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                  <span>{t.stockLowAlert}</span>
                </span>
              ) : (
                <span className="text-slate-500 text-xs">{t.stockLabel}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`font-mono font-black tabular-nums text-sm ${
                  isLowStock ? 'text-rose-700' : 'text-slate-800'
                }`}
              >
                {medication.stockCount} {t.stockRemaining}
              </span>
            </div>
          </div>
        )}

        {/* Bottom Actions Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          {isScheduledForToday ? (
            <button
              onClick={() => onToggleTaken(medication.id)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isTakenToday
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
                  : `${colorStyle.bg} hover:opacity-90 text-white shadow-md shadow-slate-900/10 active:scale-95`
              }`}
            >
              {isTakenToday ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />
                  <span>{t.taken} {takenTimeToday ? `(${takenTimeToday})` : ''}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{t.takeDoseNow}</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 text-xs text-slate-400 py-2 text-center bg-slate-50 rounded-xl">
              {t.noMedsOnThisDay}
            </div>
          )}

          {/* Edit / Delete */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(medication)}
              className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title={t.edit}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(medication.id)}
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all active:scale-90"
              title={t.delete}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
