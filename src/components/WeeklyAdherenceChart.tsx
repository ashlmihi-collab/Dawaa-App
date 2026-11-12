import React, { useMemo, useState } from 'react';
import { Medication, DoseLog, DAYS_OF_WEEK } from '../types/medication';
import { getArabicDayIndex } from '../utils/storage';
import { useLanguage } from '../utils/translations';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Award,
  BarChart3,
  LineChart as LineChartIcon,
  Sparkles,
  Share2,
} from 'lucide-react';
import { ShareReportModal, ShareReportData } from './ShareReportModal';

interface WeeklyAdherenceChartProps {
  medications: Medication[];
  doseLogs: DoseLog[];
  currentTime?: Date;
}

interface DayAdherenceStat {
  dateStr: string;
  dayLabel: string;
  dayShort: string;
  dayIndex: number;
  scheduledCount: number;
  takenCount: number;
  skippedCount: number;
  adherenceRate: number;
  isToday: boolean;
  takenMedsList: string[];
  missedMedsList: string[];
}

export const WeeklyAdherenceChart: React.FC<WeeklyAdherenceChartProps> = ({
  medications,
  doseLogs,
  currentTime = new Date(),
}) => {
  const { t, language } = useLanguage();
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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

  const getDayShort = (dayIdx: number) => {
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

  const pastWeekStats: DayAdherenceStat[] = useMemo(() => {
    const stats: DayAdherenceStat[] = [];
    const today = new Date(currentTime);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayIndex = getArabicDayIndex(d);

      const scheduledMeds = medications.filter(
        (m) => m.enabled && m.days.includes(dayIndex)
      );
      const scheduledCount = scheduledMeds.length;

      const dayLogs = doseLogs.filter((log) => log.dateStr === dateStr);
      const takenLogs = dayLogs.filter((log) => log.status === 'taken');
      const skippedLogs = dayLogs.filter((log) => log.status === 'skipped');

      const takenMedIds = new Set(takenLogs.map((l) => l.medicationId));

      const takenMedsList = scheduledMeds
        .filter((m) => takenMedIds.has(m.id))
        .map((m) => m.name);

      const missedMedsList = scheduledMeds
        .filter((m) => !takenMedIds.has(m.id))
        .map((m) => m.name);

      const takenCount = takenMedsList.length;
      const skippedCount = skippedLogs.length;

      const adherenceRate =
        scheduledCount > 0
          ? Math.min(100, Math.round((takenCount / scheduledCount) * 100))
          : 100;

      stats.push({
        dateStr,
        dayLabel: getDayLabel(dayIndex),
        dayShort: getDayShort(dayIndex),
        dayIndex,
        scheduledCount,
        takenCount,
        skippedCount,
        adherenceRate,
        isToday: i === 0,
        takenMedsList,
        missedMedsList,
      });
    }

    return stats;
  }, [medications, doseLogs, currentTime, language]);

  const weeklySummary = useMemo(() => {
    const totalScheduled = pastWeekStats.reduce((sum, d) => sum + d.scheduledCount, 0);
    const totalTaken = pastWeekStats.reduce((sum, d) => sum + d.takenCount, 0);
    const overallRate =
      totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 100;

    const perfectDaysCount = pastWeekStats.filter((d) => d.adherenceRate === 100).length;

    let statusTone = language === 'ar' ? 'ممتاز جداً ومثالي' : 'Excellent Adherence';
    let statusAdvice = language === 'ar'
      ? 'أنت ملتزم بمواعيد أدويتك بدقة متناهية، استمر على هذا النهج الرائع!'
      : 'You are consistently taking your doses on time. Keep up the great work!';
    let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

    if (overallRate < 60) {
      statusTone = language === 'ar' ? 'بحاجة لمتابعة أكبر' : 'Needs Improvement';
      statusAdvice = language === 'ar'
        ? 'هناك جرعات تم تفويتها خلال الأسبوع، يمكنك زيادة مستوى صوت المنبه لتنبيه أفضل.'
        : 'Some doses were missed this week. Consider increasing alarm volume for better alerts.';
      badgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
    } else if (overallRate < 85) {
      statusTone = language === 'ar' ? 'جيد مع بعض السهو' : 'Good Progress';
      statusAdvice = language === 'ar'
        ? 'التزامك العام مشجع! حاول الانتباه للجرعات المسائية وقبل الغداء.'
        : 'Your overall commitment is encouraging! Pay extra attention to evening doses.';
      badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
    }

    return {
      totalScheduled,
      totalTaken,
      overallRate,
      perfectDaysCount,
      statusTone,
      statusAdvice,
      badgeColor,
    };
  }, [pastWeekStats, language]);

  const selectedDay = useMemo(() => {
    if (selectedDayKey) {
      return pastWeekStats.find((d) => d.dateStr === selectedDayKey) || pastWeekStats[pastWeekStats.length - 1];
    }
    return pastWeekStats[pastWeekStats.length - 1];
  }, [pastWeekStats, selectedDayKey]);

  const shareData: ShareReportData = useMemo(() => {
    const startDateStr = pastWeekStats[0]?.dateStr || '';
    const endDateStr = pastWeekStats[pastWeekStats.length - 1]?.dateStr || '';

    const medicationsSummary = medications
      .filter((m) => m.enabled)
      .map((m) => ({
        name: m.name,
        time: m.time,
        timeSlotAr: m.timeSlot === 'morning' ? t.slotMorning : m.timeSlot === 'before_lunch' ? t.slotBeforeLunch : m.timeSlot === 'during_lunch' ? t.slotDuringLunch : t.slotNight,
      }));

    const dailyBreakdown = pastWeekStats.map((d) => ({
      dayLabel: d.dayLabel,
      dateStr: d.dateStr,
      rate: d.adherenceRate,
      taken: d.takenCount,
      total: d.scheduledCount,
    }));

    return {
      overallRate: weeklySummary.overallRate,
      totalTaken: weeklySummary.totalTaken,
      totalScheduled: weeklySummary.totalScheduled,
      perfectDaysCount: weeklySummary.perfectDaysCount,
      statusTone: weeklySummary.statusTone,
      startDateStr,
      endDateStr,
      medicationsSummary,
      dailyBreakdown,
    };
  }, [pastWeekStats, weeklySummary, medications, t]);

  const getBarColor = (rate: number, isToday: boolean) => {
    if (rate >= 90) return '#0d9488';
    if (rate >= 70) return '#14b8a6';
    if (rate >= 50) return '#f59e0b';
    return '#f43f5e';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DayAdherenceStat = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs max-w-xs backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2 mb-2 font-bold">
            <span className="text-teal-300">
              {data.dayLabel} {data.isToday && `(${t.todayBadge})`}
            </span>
            <span className="font-mono text-slate-300" dir="ltr">
              {data.dateStr}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{t.overallAdherence}:</span>
              <span className="font-bold text-teal-400 font-mono text-sm">
                {data.adherenceRate}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{t.dosesTakenSuccess}:</span>
              <span className="font-semibold text-slate-200">
                {data.takenCount} {t.dosesOf} {data.scheduledCount}
              </span>
            </div>
          </div>

          {data.missedMedsList.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-amber-300">
              {t.dosesSkipped}: {data.missedMedsList.join(', ')}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t.overallAdherence}</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {weeklySummary.overallRate}%
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${weeklySummary.badgeColor}`}>
                {weeklySummary.statusTone}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t.dosesTakenSuccess}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {weeklySummary.totalTaken}
              <span className="text-base text-slate-400 font-normal ml-1">
                / {weeklySummary.totalScheduled}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{t.past7Days}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{language === 'ar' ? 'أيام الالتزام الكامل (100%)' : 'Perfect Days (100%)'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {weeklySummary.perfectDaysCount}
              <span className="text-base text-slate-400 font-normal ml-1">/ 7</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{language === 'ar' ? 'أخذت فيها كل الجرعات' : 'All doses taken on time'}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{language === 'ar' ? 'ملاحظة طبية لانتظام العلاج' : 'Medical Note'}</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed mt-1">
              {weeklySummary.statusAdvice}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-teal-200/60 text-[10px] text-teal-800 font-medium">
            {language === 'ar' ? 'تحديث مباشر مع كل جرعة تؤكد تناولها' : 'Live updates as doses are confirmed'}
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {t.adherenceTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t.past7Days}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                  chartType === 'bar'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'أعمدة' : 'Bar'}</span>
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                  chartType === 'line'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LineChartIcon className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'خط بياني' : 'Line'}</span>
              </button>
            </div>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.shareReportButton}</span>
            </button>
          </div>
        </div>

        {/* Recharts Render Area */}
        <div className="w-full h-72 sm:h-80" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart
                data={pastWeekStats}
                margin={{ top: 20, right: 15, left: -15, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedDayKey(e.activePayload[0].payload.dateStr);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="dayShort"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <ReferenceLine
                  y={100}
                  stroke="#0d9488"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                />
                <Bar
                  dataKey="adherenceRate"
                  radius={[8, 8, 2, 2]}
                  maxBarSize={48}
                  animationDuration={800}
                >
                  {pastWeekStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.adherenceRate, entry.isToday)}
                      className="cursor-pointer transition-opacity hover:opacity-85"
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <LineChart
                data={pastWeekStats}
                margin={{ top: 20, right: 15, left: -15, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedDayKey(e.activePayload[0].payload.dateStr);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="dayShort"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={100}
                  stroke="#0d9488"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                />
                <Line
                  type="monotone"
                  dataKey="adherenceRate"
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#047857' }}
                  animationDuration={800}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Selected Day Detail */}
        {selectedDay && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  {selectedDay.dayShort}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {selectedDay.dayLabel}{' '}
                    {selectedDay.isToday && (
                      <span className="text-teal-700 bg-teal-100 px-2 py-0.5 rounded text-xs">
                        {t.todayBadge}
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono" dir="ltr">
                    {selectedDay.dateStr}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <div className="text-xs text-slate-400">{t.overallAdherence}</div>
                  <div className="text-xl font-bold font-mono text-teal-700 tabular-nums">
                    {selectedDay.adherenceRate}%
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <div className="text-xs text-slate-400">{t.dosesTakenSuccess}</div>
                  <div className="text-sm font-bold text-slate-800 tabular-nums">
                    {selectedDay.takenCount} {t.dosesOf} {selectedDay.scheduledCount}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-1">
              <div>
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.dosesTakenSuccess} ({selectedDay.takenMedsList.length}):</span>
                </span>
                {selectedDay.takenMedsList.length > 0 ? (
                  <div className="space-y-1">
                    {selectedDay.takenMedsList.map((name, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-white border border-emerald-100 rounded-lg px-2.5 py-1.5 text-slate-700 flex items-center justify-between"
                      >
                        <span className="font-medium">{name}</span>
                        <span className="text-[11px] text-emerald-600 font-bold">{t.taken}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 bg-white p-2.5 rounded-lg border border-slate-100">
                    {t.noMedicationsAdded}
                  </p>
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mb-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.dosesSkipped} ({selectedDay.missedMedsList.length}):</span>
                </span>
                {selectedDay.missedMedsList.length > 0 ? (
                  <div className="space-y-1">
                    {selectedDay.missedMedsList.map((name, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-white border border-amber-100 rounded-lg px-2.5 py-1.5 text-slate-700 flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-600">{name}</span>
                        <span className="text-[11px] text-amber-600">
                          {selectedDay.isToday ? (language === 'ar' ? 'في الانتظار' : 'Pending') : t.skipped}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 font-medium">
                    {t.allDosesCompleted}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ShareReportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        reportData={shareData}
      />
    </div>
  );
};
