import React, { useState, useEffect } from 'react';
import {
  Medication,
  TIME_SLOTS,
  DAYS_OF_WEEK,
  MEDICINE_FORMS,
  TimeSlotType,
  MedicineForm,
} from '../types/medication';
import { RINGTONES, soundEngine } from '../utils/soundEngine';
import { useLanguage } from '../utils/translations';
import {
  X,
  Save,
  Volume2,
  Play,
  Square,
  AlertCircle,
  Pill,
  Sun,
  Sunrise,
  Coffee,
  Salad,
  Utensils,
  Soup,
  Sunset,
  UtensilsCrossed,
  Moon,
  Clock
} from 'lucide-react';

interface MedicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medication: Medication) => void;
  initialMedication?: Medication | null;
  defaultRingtoneId?: string;
}

const COLOR_OPTIONS = [
  { id: 'teal', label: 'Teal', bg: 'bg-teal-500' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-500' },
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-500' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
  { id: 'orange', label: 'Orange', bg: 'bg-orange-500' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-500' },
  { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500' },
];

export const MedicationFormModal: React.FC<MedicationFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMedication,
  defaultRingtoneId = 'morning_gentle',
}) => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [timeSlot, setTimeSlot] = useState<TimeSlotType>('during_breakfast');
  const [time, setTime] = useState('08:00');
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [instructions, setInstructions] = useState('');
  const [form, setForm] = useState<MedicineForm>('tablet');
  const [color, setColor] = useState('teal');
  const [ringtoneId, setRingtoneId] = useState('default');
  const [stockCount, setStockCount] = useState<number | undefined>(30);
  const [stockAlertThreshold, setStockAlertThreshold] = useState<number | undefined>(5);
  const [doctorNotes, setDoctorNotes] = useState('');

  const [previewingTone, setPreviewingTone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const getSlotLabel = (slotKey: keyof typeof TIME_SLOTS) => {
    switch (slotKey) {
      case 'before_breakfast': return t.slotBeforeBreakfast;
      case 'during_breakfast': return t.slotDuringBreakfast;
      case 'after_breakfast': return t.slotAfterBreakfast;
      case 'before_lunch': return t.slotBeforeLunch;
      case 'during_lunch': return t.slotDuringLunch;
      case 'after_lunch': return t.slotAfterLunch;
      case 'before_dinner': return t.slotBeforeDinner;
      case 'during_dinner': return t.slotDuringDinner;
      case 'after_dinner': return t.slotAfterDinner;
      case 'morning': return t.slotDuringBreakfast;
      case 'night': return t.slotAfterDinner;
      default: return t.slotCustom;
    }
  };

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

  useEffect(() => {
    if (initialMedication) {
      setName(initialMedication.name);
      setDosage(initialMedication.dosage);
      setTimeSlot(initialMedication.timeSlot);
      setTime(initialMedication.time);
      setDays(initialMedication.days);
      setInstructions(initialMedication.instructions);
      setForm(initialMedication.form);
      setColor(initialMedication.color);
      setRingtoneId(initialMedication.ringtoneId);
      setStockCount(initialMedication.stockCount);
      setStockAlertThreshold(initialMedication.stockAlertThreshold);
      setDoctorNotes(initialMedication.doctorNotes || '');
    } else {
      setName('');
      setDosage(t.formTabletUnit);
      setTimeSlot('during_breakfast');
      setTime(TIME_SLOTS.during_breakfast.defaultTime);
      setDays([0, 1, 2, 3, 4, 5, 6]);
      setInstructions('');
      setForm('tablet');
      setColor('teal');
      setRingtoneId('default');
      setStockCount(30);
      setStockAlertThreshold(5);
      setDoctorNotes('');
    }
    setErrorMsg('');
    return () => {
      soundEngine.stopAlarm();
    };
  }, [initialMedication, isOpen, language]);

  if (!isOpen) return null;

  const handleTimeSlotSelect = (slotKey: TimeSlotType) => {
    setTimeSlot(slotKey);
    const slot = TIME_SLOTS[slotKey];
    if (slot) {
      setTime(slot.defaultTime);
      switch (slotKey) {
        case 'before_breakfast': setInstructions(t.slotBeforeBreakfastDesc); break;
        case 'during_breakfast': setInstructions(t.slotDuringBreakfastDesc); break;
        case 'after_breakfast': setInstructions(t.slotAfterBreakfastDesc); break;
        case 'before_lunch': setInstructions(t.slotBeforeLunchDesc); break;
        case 'during_lunch': setInstructions(t.slotDuringLunchDesc); break;
        case 'after_lunch': setInstructions(t.slotAfterLunchDesc); break;
        case 'before_dinner': setInstructions(t.slotBeforeDinnerDesc); break;
        case 'during_dinner': setInstructions(t.slotDuringDinnerDesc); break;
        case 'after_dinner': setInstructions(t.slotAfterDinnerDesc); break;
        default: break;
      }
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    if (days.includes(dayIndex)) {
      if (days.length === 1) {
        setErrorMsg(language === 'ar' ? 'يجب اختيار يوم واحد على الأقل' : 'At least one day must be selected');
        return;
      }
      setDays(days.filter((d) => d !== dayIndex));
    } else {
      setDays([...days, dayIndex].sort((a, b) => a - b));
    }
    setErrorMsg('');
  };

  const handleSelectAllDays = () => {
    setDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handlePreviewTone = () => {
    const toneToPlay = ringtoneId === 'default' ? defaultRingtoneId : ringtoneId;
    if (previewingTone) {
      soundEngine.stopAlarm();
      setPreviewingTone(false);
    } else {
      setPreviewingTone(true);
      soundEngine.previewTone(toneToPlay, 0.85);
      setTimeout(() => setPreviewingTone(false), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى كتابة اسم الدواء' : 'Please enter medication name');
      return;
    }
    if (!time) {
      setErrorMsg(language === 'ar' ? 'يرجى تحديد وقت المنبه بدقة' : 'Please select alarm time');
      return;
    }

    const medData: Medication = {
      id: initialMedication ? initialMedication.id : `med-${Date.now()}`,
      name: name.trim(),
      dosage: dosage.trim() || '1 Unit',
      timeSlot,
      time,
      days,
      instructions: instructions.trim(),
      form,
      color,
      ringtoneId: ringtoneId === 'default' ? defaultRingtoneId : ringtoneId,
      enabled: initialMedication ? initialMedication.enabled : true,
      stockCount: stockCount !== undefined ? Number(stockCount) : undefined,
      stockAlertThreshold: stockAlertThreshold !== undefined ? Number(stockAlertThreshold) : undefined,
      doctorNotes: doctorNotes.trim() || undefined,
    };

    soundEngine.stopAlarm();
    onSave(medData);
    onClose();
  };

  const slotIcons: Record<TimeSlotType, React.ReactNode> = {
    before_breakfast: <Sun className="w-4 h-4 text-amber-500" />,
    during_breakfast: <Coffee className="w-4 h-4 text-orange-500" />,
    after_breakfast: <Sunrise className="w-4 h-4 text-yellow-500" />,
    before_lunch: <Salad className="w-4 h-4 text-emerald-500" />,
    during_lunch: <Utensils className="w-4 h-4 text-teal-500" />,
    after_lunch: <Soup className="w-4 h-4 text-cyan-500" />,
    before_dinner: <Sunset className="w-4 h-4 text-blue-500" />,
    during_dinner: <UtensilsCrossed className="w-4 h-4 text-purple-500" />,
    after_dinner: <Moon className="w-4 h-4 text-indigo-500" />,
    custom: <Clock className="w-4 h-4 text-slate-500" />,
    morning: <Coffee className="w-4 h-4 text-orange-500" />,
    night: <Moon className="w-4 h-4 text-indigo-500" />,
  };

  const mainSlotsList: TimeSlotType[] = [
    'before_breakfast',
    'during_breakfast',
    'after_breakfast',
    'before_lunch',
    'during_lunch',
    'after_lunch',
    'before_dinner',
    'during_dinner',
    'after_dinner',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initialMedication ? t.editMedTitle : t.addNewMedTitle}
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.stopAlarm();
              onClose();
            }}
            className="w-9 h-9 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Medication Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t.medNameLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.medNamePlaceholder}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
            />
          </div>

          {/* Form & Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.dosageAmountLabel}
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder={t.dosageAmountPlaceholder}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'ar' ? 'شكل الدواء' : 'Medicine Form'}
              </label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value as MedicineForm)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
              >
                {MEDICINE_FORMS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {language === 'ar' ? f.labelAr : f.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 9 Main Time Slot Presets */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              {t.timeSlotLabel} (9 {language === 'ar' ? 'مواعيد أساسية' : 'Main Times'})
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mainSlotsList.map((slotKey) => {
                const isSelected = timeSlot === slotKey;
                const slot = TIME_SLOTS[slotKey];

                return (
                  <button
                    key={slotKey}
                    type="button"
                    onClick={() => handleTimeSlotSelect(slotKey)}
                    className={`p-2.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-700 shadow-md shadow-teal-600/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={isSelected ? 'text-white' : ''}>{slotIcons[slotKey]}</span>
                      <span className="text-xs font-extrabold">{getSlotLabel(slotKey)}</span>
                    </div>
                    <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-white/90' : 'text-slate-400'}`} dir="ltr">
                      {slot.defaultTime}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Exact Time */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-1/2">
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setTimeSlot('custom');
                  }}
                  className="w-full px-4 py-2 text-xs font-bold font-mono rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <button
                type="button"
                onClick={() => handleTimeSlotSelect('custom')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  timeSlot === 'custom'
                    ? 'bg-purple-600 text-white border-purple-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.slotCustom}
              </button>
            </div>
          </div>

          {/* Repeat Days */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700">
                {t.repeatDaysLabel}
              </label>
              <button
                type="button"
                onClick={handleSelectAllDays}
                className="text-[11px] font-bold text-teal-600 hover:underline"
              >
                {t.selectAllDays}
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = days.includes(day.index);
                return (
                  <button
                    key={day.index}
                    type="button"
                    onClick={() => handleDayToggle(day.index)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                    }`}
                  >
                    {getDayShortLabel(day.index)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t.instructionsLabelForm}
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={t.instructionsPlaceholder}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
            />
          </div>

          {/* Ringtone Selection */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {t.ringtoneLabel}
            </label>
            <div className="flex items-center gap-2">
              <select
                value={ringtoneId}
                onChange={(e) => setRingtoneId(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
              >
                <option value="default">
                  {language === 'ar' ? 'النغمة الافتراضية للتطبيق' : 'App Default Ringtone'}
                </option>
                {RINGTONES.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {language === 'en' ? (rt.nameEn || rt.name) : rt.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handlePreviewTone}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  previewingTone
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                {previewingTone ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5" />}
                <span>{previewingTone ? t.stopPreview : t.playPreview}</span>
              </button>
            </div>
          </div>

          {/* Stock Tracking */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              {t.stockTrackingTitle}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {t.currentStockCount}
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockCount ?? ''}
                  onChange={(e) => setStockCount(e.target.value === '' ? undefined : Number(e.target.value))}
                  placeholder="30"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {t.stockThreshold}
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockAlertThreshold ?? ''}
                  onChange={(e) => setStockAlertThreshold(e.target.value === '' ? undefined : Number(e.target.value))}
                  placeholder="5"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.stopAlarm();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{initialMedication ? t.saveChanges : t.saveMedication}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
