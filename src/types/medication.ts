/**
 * Medication and Alarm data types
 */

export type TimeSlotType = 'morning' | 'before_lunch' | 'during_lunch' | 'night' | 'custom';

export interface TimeSlotConfig {
  id: TimeSlotType;
  labelAr: string;
  defaultTime: string; // HH:mm
  descriptionAr: string;
  iconName: string;
  colorClass: string;
  badgeBg: string;
}

export const TIME_SLOTS: Record<TimeSlotType, TimeSlotConfig> = {
  morning: {
    id: 'morning',
    labelAr: 'الصباح',
    defaultTime: '08:00',
    descriptionAr: 'مع وجبة الإفطار أو عند الاستيقاظ',
    iconName: 'Sun',
    colorClass: 'text-amber-700',
    badgeBg: 'bg-amber-100/80 border-amber-300 text-amber-900',
  },
  before_lunch: {
    id: 'before_lunch',
    labelAr: 'قبل الغداء',
    defaultTime: '13:30',
    descriptionAr: 'قبل وجبة الغداء بنصف ساعة إلى 45 دقيقة',
    iconName: 'Salad',
    colorClass: 'text-emerald-700',
    badgeBg: 'bg-emerald-100/80 border-emerald-300 text-emerald-900',
  },
  during_lunch: {
    id: 'during_lunch',
    labelAr: 'أثناء الغداء',
    defaultTime: '14:15',
    descriptionAr: 'وسط وجبة الغداء أو مع اللقمة الأولى',
    iconName: 'Utensils',
    colorClass: 'text-teal-700',
    badgeBg: 'bg-teal-100/80 border-teal-300 text-teal-900',
  },
  night: {
    id: 'night',
    labelAr: 'بالليل',
    defaultTime: '22:00',
    descriptionAr: 'في المساء أو قبل النوم مباشرة',
    iconName: 'Moon',
    colorClass: 'text-indigo-700',
    badgeBg: 'bg-indigo-100/80 border-indigo-300 text-indigo-900',
  },
  custom: {
    id: 'custom',
    labelAr: 'وقت مخصص',
    defaultTime: '18:00',
    descriptionAr: 'توقيت خاص محدد حسب إرشادات الطبيب',
    iconName: 'Clock',
    colorClass: 'text-purple-700',
    badgeBg: 'bg-purple-100/80 border-purple-300 text-purple-900',
  },
};

export interface DayOfWeek {
  index: number; // 0 = Saturday, 1 = Sunday, ..., 6 = Friday
  labelAr: string;
  shortAr: string;
  dayNameEn: string;
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  { index: 0, labelAr: 'السبت', shortAr: 'سبت', dayNameEn: 'Saturday' },
  { index: 1, labelAr: 'الأحد', shortAr: 'أحد', dayNameEn: 'Sunday' },
  { index: 2, labelAr: 'الإثنين', shortAr: 'إثنين', dayNameEn: 'Monday' },
  { index: 3, labelAr: 'الثلاثاء', shortAr: 'ثلاثاء', dayNameEn: 'Tuesday' },
  { index: 4, labelAr: 'الأربعاء', shortAr: 'أربعاء', dayNameEn: 'Wednesday' },
  { index: 5, labelAr: 'الخميس', shortAr: 'خميس', dayNameEn: 'Thursday' },
  { index: 6, labelAr: 'الجمعة', shortAr: 'جمعة', dayNameEn: 'Friday' },
];

export type MedicineForm = 'tablet' | 'capsule' | 'syrup' | 'drops' | 'injection' | 'inhaler';

export interface MedicineFormConfig {
  id: MedicineForm;
  labelAr: string;
  defaultUnitAr: string;
  iconName: string;
}

export const MEDICINE_FORMS: MedicineFormConfig[] = [
  { id: 'tablet', labelAr: 'أقراص حبوب', defaultUnitAr: 'قرص واحد', iconName: 'Circle' },
  { id: 'capsule', labelAr: 'كبسولة', defaultUnitAr: 'كبسولة واحدة', iconName: 'Pill' },
  { id: 'syrup', labelAr: 'شراب سائل', defaultUnitAr: '5 مل (ملعقة)', iconName: 'FlaskConical' },
  { id: 'drops', labelAr: 'قطرة', defaultUnitAr: 'قطرتان', iconName: 'Droplet' },
  { id: 'injection', labelAr: 'حقنة', defaultUnitAr: 'جرعة واحدة', iconName: 'Syringe' },
  { id: 'inhaler', labelAr: 'بخاخ استنشاق', defaultUnitAr: 'بختان', iconName: 'Wind' },
];

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timeSlot: TimeSlotType;
  time: string; // 'HH:mm'
  days: number[]; // Array of day indices [0..6]
  instructions: string;
  form: MedicineForm;
  color: string; // Tailwind color name like 'teal', 'emerald', 'sky', 'rose', 'amber', 'indigo'
  ringtoneId: string; // 'default' or specific ringtone id from soundEngine
  enabled: boolean;
  stockCount?: number;
  stockAlertThreshold?: number;
  doctorNotes?: string;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm recorded
  status: 'taken' | 'snoozed' | 'skipped';
  timestamp: number;
}

export interface AppSettings {
  defaultRingtoneId: string;
  volume: number; // 0.1 to 1.0
  snoozeMinutes: number; // 5, 10, 15
  vibrationEnabled: boolean;
  enableNotifications: boolean;
  showInstructionsReminder: boolean;
}
