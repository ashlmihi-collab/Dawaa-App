import React, { useState } from 'react';
import { Medication, DAYS_OF_WEEK, TIME_SLOTS, TimeSlotType, DoseLog } from '../types/medication';
import { RINGTONES } from '../utils/soundEngine';
import { useLanguage } from '../utils/translations';
import { WeeklyAdherenceChart } from './WeeklyAdherenceChart';
import {
  Calendar,
  Sun,
  Salad,
  Utensils,
  Moon,
  Clock,
  Printer,
  FileText,
  TrendingUp,
  Trash2,
} from 'lucide-react';

interface WeeklyScheduleViewProps {
  medications: Medication[];
  doseLogs: DoseLog[];
  currentArabicDayIndex: number;
  onDeleteMedication?: (medId: string) => void;
  onEditMedication?: (med: Medication) => void;
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  medications,
  doseLogs,
  currentArabicDayIndex,
  onDeleteMedication,
  onEditMedication,
}) => {
  const { t, language } = useLanguage();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(currentArabicDayIndex);
  const [viewMode, setViewMode] = useState<'day_detail' | 'full_matrix' | 'adherence_chart'>('day_detail');

  const slotKeys: TimeSlotType[] = ['morning', 'before_lunch', 'during_lunch', 'night'];

  const slotIcons: Record<TimeSlotType, React.ReactNode> = {
    morning: <Sun className="w-5 h-5 text-amber-500" />,
    before_lunch: <Salad className="w-5 h-5 text-emerald-500" />,
    during_lunch: <Utensils className="w-5 h-5 text-teal-500" />,
    night: <Moon className="w-5 h-5 text-indigo-500" />,
    custom: <Clock className="w-5 h-5 text-slate-500" />,
  };

  const handlePrint = () => {
    window.print();
  };

  const getSlotLabel = (slotKey: keyof typeof TIME_SLOTS) => {
    if (slotKey === 'morning') return t.slotMorning;
    if (slotKey === 'before_lunch') return t.slotBeforeLunch;
    if (slotKey === 'during_lunch') return t.slotDuringLunch;
    if (slotKey === 'night') return t.slotNight;
    return t.slotCustom;
  };

  const getSlotDesc = (slotKey: keyof typeof TIME_SLOTS) => {
    if (slotKey === 'morning') return t.slotMorningDesc;
    if (slotKey === 'before_lunch') return t.slotBeforeLunchDesc;
    if (slotKey === 'during_lunch') return t.slotDuringLunchDesc;
    if (slotKey === 'night') return t.slotNightDesc;
    return t.slotCustomDesc;
  };

  const getDayLabel = (dayIdx: number) => {
    switch (dayIdx) {
      case 0: return t.daySat;
      case 1: return t.daySun;
      case 2: return t.dayMon;
      case 3: return t.dayTue;
      case 4: return t.dayWed;
      case 5: return t.dayThu;
      case 6: return t.dayFri;
      default: return '';
    }
  };

  const activeMedsForSelectedDay = medications.filter(
    (m) => m.enabled && m.days.includes(selectedDayIndex)
  );

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              {t.weeklyScheduleTitle}
            </h2>
            <p className="text-xs text-slate-500">
              {t.weeklyScheduleDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setViewMode('day_detail')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                viewMode === 'day_detail'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'استعراض حسب اليوم' : 'Daily View'}
            </button>
            <button
              onClick={() => setViewMode('full_matrix')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                viewMode === 'full_matrix'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'جدول الأسبوع الشامل' : 'Full Week Matrix'}
            </button>
            <button
              onClick={() => setViewMode('adherence_chart')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap flex items-center gap-1 transition-colors ${
                viewMode === 'adherence_chart'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-teal-700 hover:text-teal-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t.tabAdherenceMobile}</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Print Schedule"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Selector Tabs */}
      {viewMode === 'day_detail' && (
        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDayIndex === day.index;
            const isToday = day.index === currentArabicDayIndex;
            const medCount = medications.filter(
              (m) => m.enabled && m.days.includes(day.index)
            ).length;

            return (
              <button
                key={day.index}
                onClick={() => setSelectedDayIndex(day.index)}
                className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-between min-h-[72px] ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-700 shadow-md shadow-purple-600/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-purple-200 hover:bg-purple-50/40'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs md:text-sm font-bold">{getDayLabel(day.index)}</span>
                  {isToday && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-amber-300' : 'bg-purple-600'
                      }`}
                      title={t.todayBadge}
                    />
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold tabular-nums ${
                    isSelected ? 'text-purple-100' : 'text-slate-400'
                  }`}
                >
                  {medCount} {t.dosesUnit}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mode 1: Day Detail categorized by 4 slots */}
      {viewMode === 'day_detail' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              {t.weeklyScheduleTitle}: <strong className="text-slate-800">{getDayLabel(selectedDayIndex)}</strong>
            </span>
            <span>{activeMedsForSelectedDay.length} {t.dosesUnit}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slotKeys.map((slotKey) => {
              const slot = TIME_SLOTS[slotKey];
              const medsInSlot = activeMedsForSelectedDay.filter(
                (m) => m.timeSlot === slotKey
              );

              const slotBorderColors: Record<TimeSlotType, string> = {
                morning: 'border-amber-200 hover:border-amber-300',
                before_lunch: 'border-emerald-200 hover:border-emerald-300',
                during_lunch: 'border-teal-200 hover:border-teal-300',
                night: 'border-indigo-200 hover:border-indigo-300',
                custom: 'border-purple-200 hover:border-purple-300',
              };

              const slotStripColors: Record<TimeSlotType, string> = {
                morning: 'bg-amber-500',
                before_lunch: 'bg-emerald-500',
                during_lunch: 'bg-teal-500',
                night: 'bg-indigo-500',
                custom: 'bg-purple-500',
              };

              return (
                <div
                  key={slotKey}
                  className={`bg-white rounded-3xl border-2 ${slotBorderColors[slotKey]} shadow-sm overflow-hidden space-y-3 transition-shadow hover:shadow-md`}
                >
                  <div className={`h-1.5 w-full ${slotStripColors[slotKey]}`} />
                  {/* Slot Title */}
                  <div className="px-5 pt-1 pb-3 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        {slotIcons[slotKey]}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">
                          {getSlotLabel(slotKey)}
                        </h3>
                        <p className="text-xs text-slate-400">{getSlotDesc(slotKey)}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${slot.badgeBg}`}
                      dir="ltr"
                    >
                      {slot.defaultTime}
                    </span>
                  </div>

                  {/* Medicines list in slot */}
                  {medsInSlot.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      {t.noMedsOnThisDay}
                    </div>
                  ) : (
                    <div className="space-y-2 p-3">
                      {medsInSlot.map((med) => {
                        const ringtone = RINGTONES.find((r) => r.id === med.ringtoneId);
                        return (
                          <div
                            key={med.id}
                            className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-start justify-between gap-3"
                          >
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {med.name}
                              </div>
                              <div className="text-xs text-slate-600 mt-0.5">
                                {t.dosageLabel} <span className="font-semibold">{med.dosage}</span>
                                {med.instructions && (
                                  <span className="text-slate-500"> · {med.instructions}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-left">
                                <span
                                  className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 block"
                                  dir="ltr"
                                >
                                  {med.time}
                                </span>
                                {ringtone && (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {language === 'en' ? (ringtone.nameEn || ringtone.name) : ringtone.name}
                                  </div>
                                )}
                              </div>

                              {(onEditMedication || onDeleteMedication) && (
                                <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5 mr-1">
                                  {onEditMedication && (
                                    <button
                                      onClick={() => onEditMedication(med)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                      title={t.edit}
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {onDeleteMedication && (
                                    <button
                                      onClick={() => onDeleteMedication(med.id)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                      title={t.delete}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Full Matrix */}
      {viewMode === 'full_matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-3 font-bold text-slate-700">{language === 'ar' ? 'الفترة اليومية' : 'Time Slot'}</th>
                  {DAYS_OF_WEEK.map((d) => (
                    <th
                      key={d.index}
                      className={`p-3 font-bold text-center ${
                        d.index === currentArabicDayIndex
                          ? 'bg-teal-50 text-teal-900'
                          : 'text-slate-700'
                      }`}
                    >
                      {getDayLabel(d.index)}
                      {d.index === currentArabicDayIndex && (
                        <span className="block text-[10px] text-teal-600 font-normal">
                          {t.todayBadge}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slotKeys.map((slotKey) => {
                  const slot = TIME_SLOTS[slotKey];
                  return (
                    <tr key={slotKey} className="hover:bg-slate-50/50">
                      <td className="p-3.5 bg-slate-50/30 font-bold text-slate-800 border-l border-slate-100">
                        <div className="flex items-center gap-2">
                          {slotIcons[slotKey]}
                          <div>
                            <div>{getSlotLabel(slotKey)}</div>
                            <div className="text-[11px] font-normal text-slate-400" dir="ltr">
                              {slot.defaultTime}
                            </div>
                          </div>
                        </div>
                      </td>

                      {DAYS_OF_WEEK.map((d) => {
                        const meds = medications.filter(
                          (m) =>
                            m.enabled &&
                            m.timeSlot === slotKey &&
                            m.days.includes(d.index)
                        );

                        return (
                          <td
                            key={d.index}
                            className={`p-2 text-center align-top ${
                              d.index === currentArabicDayIndex ? 'bg-teal-50/30' : ''
                            }`}
                          >
                            {meds.length === 0 ? (
                              <span className="text-slate-300">-</span>
                            ) : (
                              <div className="space-y-1">
                                {meds.map((m) => (
                                  <div
                                    key={m.id}
                                    className="p-1.5 rounded-lg bg-teal-50 text-teal-900 border border-teal-100 text-[11px] font-medium leading-tight"
                                  >
                                    <div className="font-bold truncate max-w-[110px] mx-auto">
                                      {m.name}
                                    </div>
                                    <div className="text-[10px] text-teal-700 font-mono" dir="ltr">
                                      {m.time}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mode 3: Adherence Chart */}
      {viewMode === 'adherence_chart' && (
        <WeeklyAdherenceChart medications={medications} doseLogs={doseLogs} />
      )}
    </div>
  );
};
