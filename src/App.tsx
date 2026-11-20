/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Medication,
  DoseLog,
  AppSettings,
  TIME_SLOTS,
  TimeSlotType,
  DAYS_OF_WEEK,
} from './types/medication';
import {
  loadMedications,
  saveMedications,
  loadDoseLogs,
  saveDoseLogs,
  loadSettings,
  saveSettings,
  getTodayDateString,
  getArabicDayIndex,
} from './utils/storage';
import { soundEngine, RINGTONES } from './utils/soundEngine';
import { scheduleAndroidMedicationNotifications } from './utils/androidNotifications';
import { useLanguage } from './utils/translations';
import { Header } from './components/Header';
import { TodayStatsBar } from './components/TodayStatsBar';
import { MedicationCard } from './components/MedicationCard';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { WeeklyAdherenceChart } from './components/WeeklyAdherenceChart';
import { AlarmRingingModal } from './components/AlarmRingingModal';
import { RingtoneSelectorModal } from './components/RingtoneSelectorModal';
import { MedicationFormModal } from './components/MedicationFormModal';
import { LowStockAlertBanner } from './components/LowStockAlertBanner';
import { DeleteMedicationModal } from './components/DeleteMedicationModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { VoiceCommandResult, speakArabic } from './utils/voiceAssistant';

import {
  Sun,
  Sunrise,
  Coffee,
  Salad,
  Utensils,
  Soup,
  Sunset,
  UtensilsCrossed,
  Moon,
  Clock,
  Plus,
  Volume2,
  CheckCircle2,
  Bell,
  Search,
  SlidersHorizontal,
  Check,
  Mic,
} from 'lucide-react';

export default function App() {
  const { t, language } = useLanguage();
  const [medications, setMedications] = useState<Medication[]>(loadMedications);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(loadDoseLogs);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const [activeTab, setActiveTab] = useState<'today' | 'weekly' | 'adherence' | 'ringtones'>('today');
  const [activeSlotFilter, setActiveSlotFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [ringingMedication, setRingingMedication] = useState<Medication | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [deletingMedication, setDeletingMedication] = useState<Medication | null>(null);
  const [deleteSuccessToast, setDeleteSuccessToast] = useState<string | null>(null);
  const [isRingtoneModalOpen, setIsRingtoneModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Time & Snooze State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [snoozedMeds, setSnoozedMeds] = useState<{ medId: string; snoozeUntil: number }[]>([]);
  const lastTriggeredRef = useRef<{ [key: string]: string }>({});

  // Audio Context Unlock Banner
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveMedications(medications);
  }, [medications]);

  useEffect(() => {
    if (!settings.enableNotifications) return;
    scheduleAndroidMedicationNotifications(medications).catch((error) => {
      console.error('Android notification scheduling error:', error);
    });
  }, [medications, settings.enableNotifications]);

  useEffect(() => {
    saveDoseLogs(doseLogs);
  }, [doseLogs]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Live Timer Check (every second)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentHHmm = `${hours}:${minutes}`;
      const currentDayIdx = getArabicDayIndex(now);
      const todayDateStr = getTodayDateString();

      // Check snoozed meds
      const nowMs = Date.now();
      const readySnoozed = snoozedMeds.filter((s) => nowMs >= s.snoozeUntil);
      if (readySnoozed.length > 0) {
        const targetSnoozed = readySnoozed[0];
        const med = medications.find((m) => m.id === targetSnoozed.medId);
        if (med && med.enabled && !ringingMedication) {
          setSnoozedMeds((prev) => prev.filter((s) => s.medId !== targetSnoozed.medId));
          triggerAlarm(med);
          return;
        }
      }

      // Check scheduled medication alarms
      medications.forEach((med) => {
        if (!med.enabled) return;
        if (!med.days.includes(currentDayIdx)) return;

        if (med.time === currentHHmm) {
          const triggerKey = `${med.id}_${todayDateStr}_${currentHHmm}`;
          if (lastTriggeredRef.current[med.id] !== triggerKey) {
            lastTriggeredRef.current[med.id] = triggerKey;

            if (!ringingMedication) {
              triggerAlarm(med);
            }
          }
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [medications, ringingMedication, snoozedMeds]);

  const triggerAlarm = (med: Medication) => {
    setRingingMedication(med);

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`${t.timeForDose}: ${med.name}`, {
          body: `${t.dosageLabel}: ${med.dosage}`,
          icon: '/favicon.ico',
        });
      } catch {
        // Ignore
      }
    }
  };

  const handleUnlockAudio = () => {
    setAudioUnlocked(true);
    soundEngine.previewTone(settings.defaultRingtoneId, settings.volume);
  };

  const handleSaveMedication = (med: Medication) => {
    const isEdit = Boolean(editingMedication);
    if (editingMedication) {
      setMedications((prev) => prev.map((m) => (m.id === med.id ? med : m)));
    } else {
      setMedications((prev) => [med, ...prev]);
    }
    setEditingMedication(null);

    const spokenMsg = isEdit
      ? (language === 'ar' ? `تم حفظ تعديلات دواء ${med.name} بنجاح` : `Updated medication ${med.name} successfully`)
      : (language === 'ar' ? `تم إضافة دواء ${med.name} وتفعيل المنبه بنجاح` : `Added medication ${med.name} and set alarm successfully`);

    speakArabic(spokenMsg);
  };

  const handleDeleteMedication = (medId: string) => {
    const med = medications.find((m) => m.id === medId);
    if (med) {
      setDeletingMedication(med);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingMedication) return;
    const medId = deletingMedication.id;
    const medName = deletingMedication.name;

    setMedications((prev) => prev.filter((m) => m.id !== medId));
    setSnoozedMeds((prev) => prev.filter((s) => s.medId !== medId));

    if (ringingMedication?.id === medId) {
      soundEngine.stopAlarm();
      setRingingMedication(null);
    }

    setDeletingMedication(null);
    const spokenMsg = language === 'ar'
      ? `تم حذف وإلغاء منبه ${medName} بنجاح`
      : `Deleted medication ${medName} successfully`;

    setDeleteSuccessToast(spokenMsg);
    speakArabic(spokenMsg);

    setTimeout(() => {
      setDeleteSuccessToast(null);
    }, 3500);
  };

  const handleToggleEnabled = (medId: string) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === medId ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleToggleTaken = (medId: string) => {
    const todayStr = getTodayDateString();
    const existingLog = doseLogs.find((l) => l.medicationId === medId && l.dateStr === todayStr);

    if (existingLog && existingLog.status === 'taken') {
      setDoseLogs((prev) => prev.filter((l) => l.id !== existingLog.id));
    } else {
      const hours = String(currentTime.getHours()).padStart(2, '0');
      const minutes = String(currentTime.getMinutes()).padStart(2, '0');

      const newLog: DoseLog = {
        id: `log-${Date.now()}`,
        medicationId: medId,
        dateStr: todayStr,
        timeStr: `${hours}:${minutes}`,
        status: 'taken',
        timestamp: Date.now(),
      };

      setDoseLogs((prev) => [newLog, ...prev]);

      const targetMed = medications.find((m) => m.id === medId);
      if (targetMed) {
        const spokenMsg = language === 'ar'
          ? `صحة وعافية، تم تسجيل تناول ${targetMed.name} بنجاح`
          : `Recorded dose ${targetMed.name} as taken successfully`;
        speakArabic(spokenMsg);
      }

      setMedications((prev) =>
        prev.map((m) => {
          if (m.id === medId && m.stockCount !== undefined && m.stockCount > 0) {
            return { ...m, stockCount: m.stockCount - 1 };
          }
          return m;
        })
      );
    }
  };

  const handleQuickRefill = (medId: string, addedCount: number) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === medId) {
          const current = m.stockCount ?? 0;
          return { ...m, stockCount: current + addedCount };
        }
        return m;
      })
    );
  };

  const handleRingingTaken = () => {
    if (!ringingMedication) return;
    handleToggleTaken(ringingMedication.id);
    setRingingMedication(null);
  };

  const handleRingingSnooze = (minutes: number) => {
    if (!ringingMedication) return;
    const snoozeUntil = Date.now() + minutes * 60 * 1000;
    setSnoozedMeds((prev) => [...prev, { medId: ringingMedication.id, snoozeUntil }]);
    setRingingMedication(null);
  };

  const handleRingingSkip = () => {
    setRingingMedication(null);
  };

  const handleTestAlarm = () => {
    if (medications.length > 0) {
      setRingingMedication(medications[0]);
    } else {
      setRingingMedication({
        id: 'test-med',
        name: language === 'ar' ? 'منبه تجريبي للاختبار' : 'Test Alarm',
        dosage: language === 'ar' ? 'قرص واحد' : '1 Tablet',
        timeSlot: 'during_breakfast',
        time: '08:00',
        days: [0, 1, 2, 3, 4, 5, 6],
        instructions: language === 'ar' ? 'تجربة المنبه الصوتي مع الاهتزاز' : 'Test sound and vibration',
        form: 'tablet',
        color: 'teal',
        ringtoneId: settings.defaultRingtoneId,
        enabled: true,
      });
    }
  };

  const handleExecuteVoiceCommand = (result: VoiceCommandResult) => {
    if (result.type === 'TAKE_DOSE' && result.matchedMedication) {
      handleToggleTaken(result.matchedMedication.id);
    } else if (result.type === 'SNOOZE' && result.matchedMedication) {
      handleRingingSnooze(result.snoozeMinutes || 5);
    } else if (result.type === 'STOP_ALARM' || result.type === 'SKIP_DOSE') {
      soundEngine.stopAlarm();
      setRingingMedication(null);
    } else if (result.type === 'NAVIGATE' && result.tabTarget) {
      setActiveTab(result.tabTarget);
    } else if (result.type === 'ADD_MED') {
      setEditingMedication(null);
      setIsFormModalOpen(true);
    }
  };

  const currentArabicDayIdx = useMemo(() => getArabicDayIndex(currentTime), [currentTime]);
  const todayStr = useMemo(() => getTodayDateString(), [currentTime]);

  const todayMeds = useMemo(() => {
    return medications.filter((m) => m.enabled && m.days.includes(currentArabicDayIdx));
  }, [medications, currentArabicDayIdx]);

  const takenMedIdsToday = useMemo(() => {
    return doseLogs
      .filter((log) => log.dateStr === todayStr && log.status === 'taken')
      .map((log) => log.medicationId);
  }, [doseLogs, todayStr]);

  const nextMedication = useMemo(() => {
    if (todayMeds.length === 0) return null;
    const untakenMeds = todayMeds.filter((m) => !takenMedIdsToday.includes(m.id));
    if (untakenMeds.length === 0) return null;

    const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();
    const sorted = [...untakenMeds].sort((a, b) => {
      const [ah, am] = a.time.split(':').map(Number);
      const [bh, bm] = b.time.split(':').map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });

    const upcoming = sorted.find((m) => {
      const [h, min] = m.time.split(':').map(Number);
      return h * 60 + min >= currentMins;
    });

    return upcoming || sorted[0];
  }, [todayMeds, takenMedIdsToday, currentTime]);

  const lowStockMeds = useMemo(() => {
    return medications.filter(
      (m) =>
        m.enabled &&
        m.stockCount !== undefined &&
        m.stockAlertThreshold !== undefined &&
        m.stockCount <= m.stockAlertThreshold
    );
  }, [medications]);

  const filteredTodayMeds = useMemo(() => {
    let list = todayMeds;
    if (activeSlotFilter !== 'all') {
      list = list.filter((m) => {
        if (activeSlotFilter === 'during_breakfast') {
          return m.timeSlot === 'during_breakfast' || m.timeSlot === 'morning';
        }
        if (activeSlotFilter === 'after_dinner') {
          return m.timeSlot === 'after_dinner' || m.timeSlot === 'night';
        }
        return m.timeSlot === activeSlotFilter;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q));
    }
    return list;
  }, [todayMeds, activeSlotFilter, searchQuery]);

  const currentTimeString = useMemo(() => {
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }, [currentTime]);

  const currentRingtoneName = useMemo(() => {
    const r = RINGTONES.find((rt) => rt.id === settings.defaultRingtoneId);
    const tone = r || RINGTONES[0];
    return language === 'en' ? (tone.nameEn || tone.name) : tone.name;
  }, [settings.defaultRingtoneId, language]);

  const filterSlotsList: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'before_breakfast', label: t.slotBeforeBreakfast, icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { id: 'during_breakfast', label: t.slotDuringBreakfast, icon: <Coffee className="w-4 h-4 text-orange-500" /> },
    { id: 'after_breakfast', label: t.slotAfterBreakfast, icon: <Sunrise className="w-4 h-4 text-yellow-500" /> },
    { id: 'before_lunch', label: t.slotBeforeLunch, icon: <Salad className="w-4 h-4 text-emerald-500" /> },
    { id: 'during_lunch', label: t.slotDuringLunch, icon: <Utensils className="w-4 h-4 text-teal-500" /> },
    { id: 'after_lunch', label: t.slotAfterLunch, icon: <Soup className="w-4 h-4 text-cyan-500" /> },
    { id: 'before_dinner', label: t.slotBeforeDinner, icon: <Sunset className="w-4 h-4 text-blue-500" /> },
    { id: 'during_dinner', label: t.slotDuringDinner, icon: <UtensilsCrossed className="w-4 h-4 text-purple-500" /> },
    { id: 'after_dinner', label: t.slotAfterDinner, icon: <Moon className="w-4 h-4 text-indigo-500" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col antialiased">
      {/* Top sticky header */}
      <Header
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingMedication(null);
          setIsFormModalOpen(true);
        }}
        currentTimeString={currentTimeString}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Audio Unlock Banner */}
        {!audioUnlocked && (
          <div
            onClick={handleUnlockAudio}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-2xl shadow-md cursor-pointer flex items-center justify-between text-xs sm:text-sm font-bold transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 animate-bounce" />
              <span>{t.audioUnlockNotice}</span>
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-xl text-xs whitespace-nowrap">
              {t.testAlarmNow}
            </span>
          </div>
        )}

        {/* Low Stock Alert Banner */}
        <LowStockAlertBanner
          lowStockMeds={lowStockMeds}
          onQuickRefill={handleQuickRefill}
          onEditMedication={(med) => {
            setEditingMedication(med);
            setIsFormModalOpen(true);
          }}
        />

        {/* TAB 1: Today Doses Dashboard */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            <TodayStatsBar
              todayMeds={todayMeds}
              takenMedIds={takenMedIdsToday}
              currentArabicDateStr={`${DAYS_OF_WEEK.find((d) => d.index === currentArabicDayIdx)?.labelAr} · ${todayStr}`}
              nextMedication={nextMedication}
              onTestAlarm={handleTestAlarm}
              onOpenSoundSettings={() => setIsRingtoneModalOpen(true)}
              currentRingtoneName={currentRingtoneName}
              onOpenAdherenceReport={() => setActiveTab('adherence')}
            />

            {/* Time slot filter buttons & search bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs max-w-full overflow-hidden">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none max-w-full">
                <button
                  onClick={() => setActiveSlotFilter('all')}
                  className={`px-3.5 py-2 text-xs font-black rounded-xl whitespace-nowrap transition-all ${
                    activeSlotFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {t.allSlotsFilter} ({todayMeds.length})
                </button>

                {filterSlotsList.map((slotItem) => (
                  <button
                    key={slotItem.id}
                    onClick={() => setActiveSlotFilter(slotItem.id)}
                    className={`px-3 py-2 text-xs font-black rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
                      activeSlotFilter === slotItem.id
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {slotItem.icon}
                    <span>{slotItem.label}</span>
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-auto sm:min-w-[180px]">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-3 pr-9 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            {/* List / Grid of Today's Medication Cards */}
            {filteredTodayMeds.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{t.noMedicationsAdded}</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {t.clickAddMedication}
                </p>
                <button
                  onClick={() => {
                    setEditingMedication(null);
                    setIsFormModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addMedication}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredTodayMeds.map((med) => (
                  <MedicationCard
                    key={med.id}
                    medication={med}
                    isTakenToday={takenMedIdsToday.includes(med.id)}
                    takenTimeToday={
                      doseLogs.find((l) => l.medicationId === med.id && l.dateStr === todayStr)
                        ?.timeStr
                    }
                    onToggleTaken={handleToggleTaken}
                    onEdit={(m) => {
                      setEditingMedication(m);
                      setIsFormModalOpen(true);
                    }}
                    onDelete={handleDeleteMedication}
                    onToggleEnabled={handleToggleEnabled}
                    currentArabicDayIndex={currentArabicDayIdx}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Weekly Schedule View */}
        {activeTab === 'weekly' && (
          <WeeklyScheduleView
            medications={medications}
            doseLogs={doseLogs}
            currentArabicDayIndex={currentArabicDayIdx}
            onDeleteMedication={handleDeleteMedication}
            onEditMedication={(med) => {
              setEditingMedication(med);
              setIsFormModalOpen(true);
            }}
          />
        )}

        {/* TAB 3: Weekly Adherence Chart & Analytics */}
        {activeTab === 'adherence' && (
          <WeeklyAdherenceChart
            medications={medications}
            doseLogs={doseLogs}
            currentTime={currentTime}
          />
        )}

        {/* TAB 4: Sound Control Center & Ringtones Library */}
        {activeTab === 'ringtones' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {t.ringtoneModalTitle}
                  </h2>
                </div>
                <button
                  onClick={handleTestAlarm}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Bell className="w-4 h-4" />
                  <span>{t.testAlarmNow}</span>
                </button>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsRingtoneModalOpen(true)}
                  className="w-full py-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 font-bold text-sm hover:bg-teal-100 transition-colors flex items-center justify-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{t.ringtoneModalTitle}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Smart Voice Command Action Button */}
      <button
        onClick={() => setIsVoiceModalOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all active:scale-95 group border-2 border-white"
        title={t.voiceAssistantTitle}
        aria-label={t.voiceAssistantTitle}
      >
        <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Footer Info & Medical Disclaimer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-50/80 py-6 px-6 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-500 border-b border-slate-200 pb-4">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-slate-700">{t.disclaimerTitle}</span>
              <p className="text-[11px] leading-relaxed">
                {t.disclaimerText}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-slate-700">{t.privacyTitle}</span>
              <p className="text-[11px] leading-relaxed">
                {t.privacyText}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-[11px]">
            <span>{t.footerRights}</span>
            <span className="font-mono">{t.footerSubtitle}</span>
          </div>
        </div>
      </footer>

      {/* Ringing Modal */}
      {ringingMedication && (
        <AlarmRingingModal
          medication={ringingMedication}
          onTake={handleRingingTaken}
          onSnooze={handleRingingSnooze}
          onSkip={handleRingingSkip}
          snoozeMinutes={settings.snoozeMinutes}
          volume={settings.volume}
          vibrationEnabled={settings.vibrationEnabled}
        />
      )}

      {/* Ringtone Selector Modal */}
      <RingtoneSelectorModal
        isOpen={isRingtoneModalOpen}
        onClose={() => setIsRingtoneModalOpen(false)}
        selectedRingtoneId={settings.defaultRingtoneId}
        onSelectRingtone={(toneId) => {
          setSettings((prev) => ({ ...prev, defaultRingtoneId: toneId }));
          const spokenMsg = language === 'ar' ? 'تم تعيين النغمة الافتراضية بنجاح' : 'Default ringtone set successfully';
          speakArabic(spokenMsg);
        }}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings((prev) => ({ ...prev, ...newSettings }));
        }}
        onTriggerTestAlarm={handleTestAlarm}
      />

      {/* Medication Add/Edit Form Modal */}
      <MedicationFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingMedication(null);
        }}
        onSave={handleSaveMedication}
        initialMedication={editingMedication}
        defaultRingtoneId={settings.defaultRingtoneId}
      />

      {/* Delete Medication Confirmation Modal */}
      <DeleteMedicationModal
        isOpen={deletingMedication !== null}
        medication={deletingMedication}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingMedication(null)}
      />

      {/* Smart Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        voiceContext={{
          ringingMedication,
          todayMeds,
          takenMedIds: takenMedIdsToday,
          allMeds: medications,
          nextMedication,
        }}
        onExecuteCommand={handleExecuteVoiceCommand}
      />

      {/* Toast feedback */}
      {deleteSuccessToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>{deleteSuccessToast}</span>
        </div>
      )}
    </div>
  );
}
