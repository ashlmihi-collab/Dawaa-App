/**
 * Medication and Alarm data types
 */

export type TimeSlotType =
  | 'before_breakfast'
  | 'during_breakfast'
  | 'after_breakfast'
  | 'before_lunch'
  | 'during_lunch'
  | 'after_lunch'
  | 'before_dinner'
  | 'during_dinner'
  | 'after_dinner'
  | 'custom'
  | 'morning' // legacy
  | 'night';  // legacy

export interface TimeSlotConfig {
  id: TimeSlotType;
  labelAr: string;
  labelEn: string;
  defaultTime: string; // HH:mm
  descriptionAr: string;
  iconName: string;
  colorClass: string;
  badgeBg: string;
}

export const TIME_SLOTS: Record<TimeSlotType, TimeSlotConfig> = {
  before_breakfast: {
    id: 'before_breakfast',
    labelAr: 'قبل الإفطار',
    labelEn: 'Before Breakfast',
    defaultTime: '07:30',
    descriptionAr: 'قبل وجبة الإفطار بنصف ساعة',
    iconName: 'Sun',
    colorClass: 'text-amber-600',
    badgeBg: 'bg-amber-100/80 border-amber-300 text-amber-900',
  },
  during_breakfast: {
    id: 'during_breakfast',
    labelAr: 'أثناء الإفطار',
    labelEn: 'During Breakfast',
    defaultTime: '08:00',
    descriptionAr: 'مع وجبة الإفطار أو مع اللقمة الأولى',
    iconName: 'Coffee',
    colorClass: 'text-orange-600',
    badgeBg: 'bg-orange-100/80 border-orange-300 text-orange-900',
  },
  after_breakfast: {
    id: 'after_breakfast',
    labelAr: 'بعد الإفطار',
    labelEn: 'After Breakfast',
    defaultTime: '08:30',
    descriptionAr: 'بعد انتهاء وجبة الإفطار مباشرة',
    iconName: 'Sunrise',
    colorClass: 'text-yellow-600',
    badgeBg: 'bg-yellow-100/80 border-yellow-300 text-yellow-900',
  },
  before_lunch: {
    id: 'before_lunch',
    labelAr: 'قبل الغداء',
    labelEn: 'Before Lunch',
    defaultTime: '13:30',
    descriptionAr: 'قبل وجبة الغداء بنصف ساعة',
    iconName: 'Salad',
    colorClass: 'text-emerald-600',
    badgeBg: 'bg-emerald-100/80 border-emerald-300 text-emerald-900',
  },
  during_lunch: {
    id: 'during_lunch',
    labelAr: 'أثناء الغداء',
    labelEn: 'During Lunch',
    defaultTime: '14:15',
    descriptionAr: 'وسط وجبة الغداء',
    iconName: 'Utensils',
    colorClass: 'text-teal-600',
    badgeBg: 'bg-teal-100/80 border-teal-300 text-teal-900',
  },
  after_lunch: {
    id: 'after_lunch',
    labelAr: 'بعد الغداء',
    labelEn: 'After Lunch',
    defaultTime: '14:45',
    descriptionAr: 'بعد انتهاء وجبة الغداء',
    iconName: 'Soup',
    colorClass: 'text-cyan-600',
    badgeBg: 'bg-cyan-100/80 border-cyan-300 text-cyan-900',
  },
  before_dinner: {
    id: 'before_dinner',
    labelAr: 'قبل العشاء',
    labelEn: 'Before Dinner',
    defaultTime: '19:30',
    descriptionAr: 'قبل وجبة العشاء بنصف ساعة',
    iconName: 'Sunset',
    colorClass: 'text-blue-600',
    badgeBg: 'bg-blue-100/80 border-blue-300 text-blue-900',
  },
  during_dinner: {
    id: 'during_dinner',
    labelAr: 'أثناء العشاء',
    labelEn: 'During Dinner',
    defaultTime: '20:15',
    descriptionAr: 'وسط وجبة العشاء',
    iconName: 'UtensilsCrossed',
    colorClass: 'text-purple-600',
    badgeBg: 'bg-purple-100/80 border-purple-300 text-purple-900',
  },
  after_dinner: {
    id: 'after_dinner',
    labelAr: 'بعد العشاء / قبل النوم',
    labelEn: 'After Dinner / Bedtime',
    defaultTime: '21:00',
    descriptionAr: 'بعد وجبة العشاء أو قبل النوم مباشرة',
    iconName: 'Moon',
    colorClass: 'text-indigo-600',
    badgeBg: 'bg-indigo-100/80 border-indigo-300 text-indigo-900',
  },
  custom: {
    id: 'custom',
    labelAr: 'وقت مخصص',
    labelEn: 'Custom Time',
    defaultTime: '18:00',
    descriptionAr: 'توقيت خاص محدد حسب إرشادات الطبيب',
    iconName: 'Clock',
    colorClass: 'text-slate-600',
    badgeBg: 'bg-slate-100/80 border-slate-300 text-slate-900',
  },
  morning: {
    id: 'during_breakfast',
    labelAr: 'أثناء الإفطار',
    labelEn: 'During Breakfast',
    defaultTime: '08:00',
    descriptionAr: 'مع وجبة الإفطار',
    iconName: 'Coffee',
    colorClass: 'text-orange-600',
    badgeBg: 'bg-orange-100/80 border-orange-300 text-orange-900',
  },
  night: {
    id: 'after_dinner',
    labelAr: 'بعد العشاء / قبل النوم',
    labelEn: 'After Dinner / Bedtime',
    defaultTime: '21:00',
    descriptionAr: 'بعد وجبة العشاء أو قبل النوم مباشرة',
    iconName: 'Moon',
    colorClass: 'text-indigo-600',
    badgeBg: 'bg-indigo-100/80 border-indigo-300 text-indigo-900',
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
