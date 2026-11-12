import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

export interface TranslationDictionary {
  // Brand & Header
  appName: string;
  appSubtitle: string;
  tabToday: string;
  tabTodayMobile: string;
  tabWeekly: string;
  tabWeeklyMobile: string;
  tabAdherence: string;
  tabAdherenceMobile: string;
  tabRingtones: string;
  tabRingtonesMobile: string;
  addMedication: string;
  changeLanguage: string;

  // Time Slots
  slotMorning: string;
  slotMorningDesc: string;
  slotBeforeLunch: string;
  slotBeforeLunchDesc: string;
  slotDuringLunch: string;
  slotDuringLunchDesc: string;
  slotNight: string;
  slotNightDesc: string;
  slotCustom: string;
  slotCustomDesc: string;

  // Days of Week
  daySat: string;
  daySatShort: string;
  daySun: string;
  daySunShort: string;
  dayMon: string;
  dayMonShort: string;
  dayTue: string;
  dayTueShort: string;
  dayWed: string;
  dayWedShort: string;
  dayThu: string;
  dayThuShort: string;
  dayFri: string;
  dayFriShort: string;

  // Medicine Forms
  formTablet: string;
  formTabletUnit: string;
  formCapsule: string;
  formCapsuleUnit: string;
  formSyrup: string;
  formSyrupUnit: string;
  formDrops: string;
  formDropsUnit: string;
  formInjection: string;
  formInjectionUnit: string;
  formInhaler: string;
  formInhalerUnit: string;

  // Today Stats Bar
  todayAdherence: string;
  dosesOf: string;
  dosesUnit: string;
  allDosesCompleted: string;
  dosesRemaining: string;
  viewAdherenceChart: string;
  nextDose: string;
  timeLabel: string;
  noDosesRemaining: string;
  allDosesDoneDesc: string;
  alarmAutoEnabled: string;
  monitoring247: string;
  soundSystemTitle: string;
  tonesCount: string;
  currentTone: string;
  soundBoostDesc: string;
  testAlarmNow: string;
  changeRingtone: string;

  // Medication Card
  takeDoseNow: string;
  taken: string;
  skipped: string;
  snooze5Min: string;
  edit: string;
  delete: string;
  dosageLabel: string;
  instructionsLabel: string;
  stockLabel: string;
  stockRemaining: string;
  stockLowAlert: string;
  doctorNotesLabel: string;
  dailyAlarmTime: string;

  // Weekly Schedule
  weeklyScheduleTitle: string;
  weeklyScheduleDesc: string;
  noMedsOnThisDay: string;
  allWeekDays: string;
  todayBadge: string;

  // Adherence Chart & Share
  adherenceTitle: string;
  past7Days: string;
  overallAdherence: string;
  dosesTakenSuccess: string;
  dosesSkipped: string;
  shareReportButton: string;
  shareReportTitle: string;
  copyReport: string;
  copiedToast: string;

  // Form Modal
  addNewMedTitle: string;
  editMedTitle: string;
  medNameLabel: string;
  medNamePlaceholder: string;
  quickSuggestions: string;
  dosageAmountLabel: string;
  dosageAmountPlaceholder: string;
  timeSlotLabel: string;
  repeatDaysLabel: string;
  selectAllDays: string;
  instructionsLabelForm: string;
  instructionsPlaceholder: string;
  ringtoneLabel: string;
  colorThemeLabel: string;
  stockTrackingTitle: string;
  currentStockCount: string;
  stockThreshold: string;
  cancel: string;
  saveMedication: string;
  saveChanges: string;

  // Ringtone Selector & Settings
  ringtoneModalTitle: string;
  selectDefaultRingtone: string;
  playPreview: string;
  stopPreview: string;
  setAsDefault: string;
  isDefaultRingtone: string;
  soundVolume: string;
  snoozeDuration: string;
  minutes: string;
  vibration: string;
  enableNotifications: string;

  // Alarm Ringing Modal
  timeForDose: string;
  takeDoseBtn: string;
  snoozeBtn: string;
  skipBtn: string;

  // Delete Modal
  deleteTitle: string;
  deleteConfirmDesc: string;
  confirmDelete: string;

  // Voice Assistant
  voiceAssistantTitle: string;
  startListening: string;
  listening: string;
  typeCommandPlaceholder: string;

  // General & Search
  audioUnlockNotice: string;
  searchPlaceholder: string;
  allSlotsFilter: string;
  noMedicationsAdded: string;
  clickAddMedication: string;

  // Footer & Disclaimers
  disclaimerTitle: string;
  disclaimerText: string;
  privacyTitle: string;
  privacyText: string;
  footerRights: string;
  footerSubtitle: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  ar: {
    // Brand & Header
    appName: 'دوائي',
    appSubtitle: 'منبه الأدوية ومواقيت الجرعات',
    tabToday: 'جرعات اليوم',
    tabTodayMobile: 'اليوم',
    tabWeekly: 'الجدول الأسبوعي',
    tabWeeklyMobile: 'الأسبوع',
    tabAdherence: 'نسبة الالتزام والتقرير',
    tabAdherenceMobile: 'الالتزام',
    tabRingtones: 'أصوات ونغمات المنبه',
    tabRingtonesMobile: 'النغمات',
    addMedication: 'إضافة دواء جديد',
    changeLanguage: 'English',

    // Time Slots
    slotMorning: 'الصباح',
    slotMorningDesc: 'مع وجبة الإفطار أو عند الاستيقاظ',
    slotBeforeLunch: 'قبل الغداء',
    slotBeforeLunchDesc: 'قبل وجبة الغداء بنصف ساعة إلى 45 دقيقة',
    slotDuringLunch: 'أثناء الغداء',
    slotDuringLunchDesc: 'وسط وجبة الغداء أو مع اللقمة الأولى',
    slotNight: 'بالليل',
    slotNightDesc: 'في المساء أو قبل النوم مباشرة',
    slotCustom: 'وقت مخصص',
    slotCustomDesc: 'توقيت خاص محدد حسب إرشادات الطبيب',

    // Days of Week
    daySat: 'السبت',
    daySatShort: 'سبت',
    daySun: 'الأحد',
    daySunShort: 'أحد',
    dayMon: 'الإثنين',
    dayMonShort: 'إثنين',
    dayTue: 'الثلاثاء',
    dayTueShort: 'ثلاثاء',
    dayWed: 'الأربعاء',
    dayWedShort: 'أربعاء',
    dayThu: 'الخميس',
    dayThuShort: 'خميس',
    dayFri: 'الجمعة',
    dayFriShort: 'جمعة',

    // Medicine Forms
    formTablet: 'أقراص حبوب',
    formTabletUnit: 'قرص واحد',
    formCapsule: 'كبسولة',
    formCapsuleUnit: 'كبسولة واحدة',
    formSyrup: 'شراب سائل',
    formSyrupUnit: '5 مل (ملعقة)',
    formDrops: 'قطرة',
    formDropsUnit: 'قطرتان',
    formInjection: 'حقنة',
    formInjectionUnit: 'جرعة واحدة',
    formInhaler: 'بخاخ استنشاق',
    formInhalerUnit: 'بختان',

    // Today Stats Bar
    todayAdherence: 'التزام اليوم',
    dosesOf: 'من أصل',
    dosesUnit: 'جرعات',
    allDosesCompleted: '🎉 رائع! أكملت جميع جرعات اليوم بنجاح تام',
    dosesRemaining: 'جرعات متبقية اليوم',
    viewAdherenceChart: 'عرض الرسم البياني ونسبة التزام الأسبوع الماضي ←',
    nextDose: 'الجرعة القادمة التالية',
    timeLabel: 'الموعد:',
    noDosesRemaining: 'لا توجد جرعات متبقية اليوم',
    allDosesDoneDesc: 'انتهت مواعيد اليوم أو تم تناولها جميعاً',
    alarmAutoEnabled: 'المنبه مفعل تلقائياً',
    monitoring247: '24/7 مراقبة دقيقة',
    soundSystemTitle: 'نظام التنبيه الصوتي (+25% قوة صوت)',
    tonesCount: '14 نغمة',
    currentTone: 'النغمة الحالية:',
    soundBoostDesc: 'تم رفع درجة التنبيه الصوتي بنسبة 25% لتنبيه واضح ومسموع في كل أرجاء المنزل.',
    testAlarmNow: 'تجربة المنبه الآن',
    changeRingtone: 'تغيير النغمة',

    // Medication Card
    takeDoseNow: 'أخذت الجرعة الآن',
    taken: 'تم تناول الجرعة',
    skipped: 'تم تجاوز الجرعة',
    snooze5Min: 'تأجيل 5 دقائق',
    edit: 'تعديل',
    delete: 'حذف',
    dosageLabel: 'الجرعة:',
    instructionsLabel: 'التعليمات:',
    stockLabel: 'المخزون:',
    stockRemaining: 'جرعة متبقية',
    stockLowAlert: '⚠️ المخزون منخفض!',
    doctorNotesLabel: 'ملاحظات الطبيب:',
    dailyAlarmTime: 'موعد التنبيه اليومي:',

    // Weekly Schedule
    weeklyScheduleTitle: 'جدول مواعيد الأدوية الأسبوعي',
    weeklyScheduleDesc: 'استعراض الأدوية المقررة لكل يوم من أيام الأسبوع حسب فترات التوقيت',
    noMedsOnThisDay: 'لا توجد أدوية مجدولة في هذا اليوم',
    allWeekDays: 'أيام الأسبوع كاملة',
    todayBadge: 'اليوم',

    // Adherence Chart & Share
    adherenceTitle: 'تقرير وتتبع الالتزام بالأدوية',
    past7Days: 'خلال الـ 7 أيام الماضية',
    overallAdherence: 'معدل الالتزام العام',
    dosesTakenSuccess: 'جرعات تم تناولها بنجاح',
    dosesSkipped: 'جرعات تم تجاوزها',
    shareReportButton: 'مشاركة التقرير مع الطبيب',
    shareReportTitle: 'تقرير الالتزام بالأدوية للطبيب',
    copyReport: 'نسخ النص',
    copiedToast: 'تم نسخ التقرير بنجاح',

    // Form Modal
    addNewMedTitle: 'إضافة دواء جديد للمنبه',
    editMedTitle: 'تعديل بيانات الدواء والتنبيه',
    medNameLabel: 'اسم الدواء أو الفيتامين',
    medNamePlaceholder: 'أدخل اسم الدواء والجرعة...',
    quickSuggestions: 'اقتراحات سريعة:',
    dosageAmountLabel: 'الجرعة المقررة (مثال: قرص واحد، 5 مل)',
    dosageAmountPlaceholder: 'مثال: قرص واحد بعد الطعام',
    timeSlotLabel: 'الفترة الزمنية والتوقيت',
    repeatDaysLabel: 'أيام التكرار الأسبوعية',
    selectAllDays: 'جميع أيام الأسبوع',
    instructionsLabelForm: 'تعليمات وإرشادات الاستخدام',
    instructionsPlaceholder: 'مثال: يؤخذ مع كوب ماء كبير على معدة خاوية',
    ringtoneLabel: 'نغمة المنبه الخاصة بهذا الدواء',
    colorThemeLabel: 'لون التمييز',
    stockTrackingTitle: 'متابعة المخزون والتنبيه عند الانخفاض (اختياري)',
    currentStockCount: 'العدد الحالي للحبوب/الجرعات بالمخزون',
    stockThreshold: 'التنبيه عند المتبقي من المخزون',
    cancel: 'إلغاء',
    saveMedication: 'حفظ الدواء وتفعيل المنبه',
    saveChanges: 'حفظ التغييرات',

    // Ringtone Selector & Settings
    ringtoneModalTitle: 'مكتبة النغمات وإعدادات الصوت',
    selectDefaultRingtone: 'اختر النغمة الافتراضية',
    playPreview: 'استماع',
    stopPreview: 'إيقاف',
    setAsDefault: 'تعيين كافتراضية',
    isDefaultRingtone: 'مفعلة كافتراضية',
    soundVolume: 'مستوى صوت المنبه (+25% معزز)',
    snoozeDuration: 'مدة التأجيل (السنوز)',
    minutes: 'دقائق',
    vibration: 'الاهتزاز مع التنبيه',
    enableNotifications: 'الإشعارات الخلفية ونظام المنبه',

    // Alarm Ringing Modal
    timeForDose: 'حان الآن موعد تناول دواءك!',
    takeDoseBtn: 'أخذت الجرعة الآن',
    snoozeBtn: 'تأجيل 5 دقائق',
    skipBtn: 'تجاوز هذه الجرعة',

    // Delete Modal
    deleteTitle: 'حذف الدواء',
    deleteConfirmDesc: 'هل أنت تأكد من رغبتك في حذف هذا الدواء وإلغاء جميع تنبيهاته المستقبلية؟',
    confirmDelete: 'نعم، حذف الدواء',

    // Voice Assistant
    voiceAssistantTitle: 'المساعد الصوتي الذكي لأدويتك',
    startListening: 'اضغط للتحدث الآن...',
    listening: 'جاري الاستماع إليك...',
    typeCommandPlaceholder: 'أو اكتب أمرك هنا (مثال: أخذت الدواء، متى الجرعة القادمة؟)...',

    // General & Search
    audioUnlockNotice: 'اضغط هنا لتفعيل نظام المنبه الصوتي بجودة عالية',
    searchPlaceholder: 'البحث عن دواء...',
    allSlotsFilter: 'جميع الأوقات',
    noMedicationsAdded: 'لم تقم بإضافة أي أدوية بعد',
    clickAddMedication: "اضغط على زر 'إضافة دواء جديد' باللأعلى لإضافة أول دواء ومجدول تنبيهات",

    // Footer & Disclaimers
    disclaimerTitle: 'تنبيه إخلاء المسؤولية الطبية / Medical Disclaimer',
    disclaimerText: 'هذا التطبيق هو أداة شخصية للتذكير بمواعيد تناول الأدوية، ولا يُعتبر بديلاً عن الاستشارة الطبية أو التشخيص أو توجيهات الطبيب والصيدلي المختص.',
    privacyTitle: 'حماية الخصوصية والبيانات / Data Privacy',
    privacyText: 'بيانات الأدوية والجرعات محفوظة محلياً على جهازك 100% ولا يتم جمعها أو مشاركتها أو نقلها إلى أي خوادم خارجية.',
    footerRights: 'دوائي · منبه ومجدول الأدوية اليومي مع مكتبة أصوات مخصصة',
    footerSubtitle: 'نظام تنبيه صوتي دقيق 100% بدون إنترنت',
  },
  en: {
    // Brand & Header
    appName: 'Dawaa',
    appSubtitle: 'Medication Reminder & Dose Schedule',
    tabToday: "Today's Doses",
    tabTodayMobile: 'Today',
    tabWeekly: 'Weekly Schedule',
    tabWeeklyMobile: 'Weekly',
    tabAdherence: 'Adherence & Report',
    tabAdherenceMobile: 'Adherence',
    tabRingtones: 'Alarm Ringtones',
    tabRingtonesMobile: 'Ringtones',
    addMedication: 'Add Medication',
    changeLanguage: 'العربية',

    // Time Slots
    slotMorning: 'Morning',
    slotMorningDesc: 'With breakfast or upon waking up',
    slotBeforeLunch: 'Before Lunch',
    slotBeforeLunchDesc: '30 to 45 minutes before lunch',
    slotDuringLunch: 'During Lunch',
    slotDuringLunchDesc: 'During lunch or with the first bite',
    slotNight: 'Night',
    slotNightDesc: 'In the evening or right before sleep',
    slotCustom: 'Custom Time',
    slotCustomDesc: 'Custom time as instructed by your doctor',

    // Days of Week
    daySat: 'Saturday',
    daySatShort: 'Sat',
    daySun: 'Sunday',
    daySunShort: 'Sun',
    dayMon: 'Monday',
    dayMonShort: 'Mon',
    dayTue: 'Tuesday',
    dayTueShort: 'Tue',
    dayWed: 'Wednesday',
    dayWedShort: 'Wed',
    dayThu: 'Thursday',
    dayThuShort: 'Thu',
    dayFri: 'Friday',
    dayFriShort: 'Fri',

    // Medicine Forms
    formTablet: 'Tablets / Pills',
    formTabletUnit: '1 Tablet',
    formCapsule: 'Capsule',
    formCapsuleUnit: '1 Capsule',
    formSyrup: 'Liquid Syrup',
    formSyrupUnit: '5 ml (Spoon)',
    formDrops: 'Drops',
    formDropsUnit: '2 Drops',
    formInjection: 'Injection',
    formInjectionUnit: '1 Injection',
    formInhaler: 'Inhaler',
    formInhalerUnit: '2 Puffs',

    // Today Stats Bar
    todayAdherence: 'Today Adherence',
    dosesOf: 'of',
    dosesUnit: 'doses',
    allDosesCompleted: '🎉 Great! You completed all today’s doses successfully',
    dosesRemaining: 'doses remaining today',
    viewAdherenceChart: 'View past week adherence chart →',
    nextDose: 'Next Upcoming Dose',
    timeLabel: 'Time:',
    noDosesRemaining: 'No remaining doses today',
    allDosesDoneDesc: 'All scheduled doses for today have been completed or taken',
    alarmAutoEnabled: 'Alarm enabled automatically',
    monitoring247: '24/7 Accurate Tracking',
    soundSystemTitle: 'Sound Alarm System (+25% Volume)',
    tonesCount: '14 Tones',
    currentTone: 'Current Tone:',
    soundBoostDesc: 'Alarm volume boosted by 25% for a clear, audible alert across your home.',
    testAlarmNow: 'Test Alarm Now',
    changeRingtone: 'Change Ringtone',

    // Medication Card
    takeDoseNow: 'Take Dose Now',
    taken: 'Dose Taken',
    skipped: 'Dose Skipped',
    snooze5Min: 'Snooze 5 min',
    edit: 'Edit',
    delete: 'Delete',
    dosageLabel: 'Dosage:',
    instructionsLabel: 'Instructions:',
    stockLabel: 'Stock:',
    stockRemaining: 'doses remaining',
    stockLowAlert: '⚠️ Low Stock Alert!',
    doctorNotesLabel: 'Doctor Notes:',
    dailyAlarmTime: 'Daily Alarm Time:',

    // Weekly Schedule
    weeklyScheduleTitle: 'Weekly Medication Schedule',
    weeklyScheduleDesc: 'Overview of scheduled medications for each day of the week by time slot',
    noMedsOnThisDay: 'No medications scheduled for this day',
    allWeekDays: 'All Days of Week',
    todayBadge: 'Today',

    // Adherence Chart & Share
    adherenceTitle: 'Medication Adherence Report & Tracking',
    past7Days: 'Over the Past 7 Days',
    overallAdherence: 'Overall Adherence Rate',
    dosesTakenSuccess: 'Doses Taken Successfully',
    dosesSkipped: 'Doses Skipped',
    shareReportButton: 'Share Report with Doctor',
    shareReportTitle: 'Medication Adherence Report for Doctor',
    copyReport: 'Copy Text',
    copiedToast: 'Report text copied successfully',

    // Form Modal
    addNewMedTitle: 'Add New Medication Alert',
    editMedTitle: 'Edit Medication & Alert Details',
    medNameLabel: 'Medication or Vitamin Name',
    medNamePlaceholder: 'Enter medication name and dosage...',
    quickSuggestions: 'Quick suggestions:',
    dosageAmountLabel: 'Prescribed Dosage (e.g. 1 Tablet, 5 ml)',
    dosageAmountPlaceholder: 'e.g., 1 Tablet after meal',
    timeSlotLabel: 'Time Slot & Timing',
    repeatDaysLabel: 'Weekly Repeating Days',
    selectAllDays: 'All Days of Week',
    instructionsLabelForm: 'Usage Instructions & Guidelines',
    instructionsPlaceholder: 'e.g., Take with a large glass of water on empty stomach',
    ringtoneLabel: 'Custom Ringtone for this Medication',
    colorThemeLabel: 'Badge Color Theme',
    stockTrackingTitle: 'Stock Tracking & Low Stock Alert (Optional)',
    currentStockCount: 'Current Pill/Dose Count in Stock',
    stockThreshold: 'Alert Threshold when Remaining',
    cancel: 'Cancel',
    saveMedication: 'Save Medication & Set Alarm',
    saveChanges: 'Save Changes',

    // Ringtone Selector & Settings
    ringtoneModalTitle: 'Ringtone Library & Sound Settings',
    selectDefaultRingtone: 'Select Default Ringtone',
    playPreview: 'Play',
    stopPreview: 'Stop',
    setAsDefault: 'Set as Default',
    isDefaultRingtone: 'Default Active',
    soundVolume: 'Alarm Volume (+25% Boosted)',
    snoozeDuration: 'Snooze Duration',
    minutes: 'minutes',
    vibration: 'Vibration with Alarm',
    enableNotifications: 'Background Notifications & Alarm System',

    // Alarm Ringing Modal
    timeForDose: 'Time to take your medication now!',
    takeDoseBtn: 'I Took the Dose Now',
    snoozeBtn: 'Snooze 5 Minutes',
    skipBtn: 'Skip This Dose',

    // Delete Modal
    deleteTitle: 'Delete Medication',
    deleteConfirmDesc: 'Are you sure you want to delete this medication and cancel all future alarms?',
    confirmDelete: 'Yes, Delete Medication',

    // Voice Assistant
    voiceAssistantTitle: 'Smart Voice Assistant for Medications',
    startListening: 'Tap to Speak Now...',
    listening: 'Listening to you...',
    typeCommandPlaceholder: 'Or type your query here (e.g. I took the dose, when is next?)...',

    // General & Search
    audioUnlockNotice: 'Tap here to enable high-quality audio alarm system',
    searchPlaceholder: 'Search medication...',
    allSlotsFilter: 'All Time Slots',
    noMedicationsAdded: 'No medications added yet',
    clickAddMedication: "Click the 'Add Medication' button above to schedule your first medication alert",

    // Footer & Disclaimers
    disclaimerTitle: 'Medical Disclaimer / تنبيه إخلاء المسؤولية الطبية',
    disclaimerText: 'This application is a personal medication reminder tool and is not intended to be a substitute for professional medical advice, diagnosis, or treatment.',
    privacyTitle: 'Data Privacy / حماية الخصوصية',
    privacyText: 'All medication data and dose logs are stored 100% locally on your device and are never collected, shared, or transmitted off-device.',
    footerRights: 'Dawaa · Daily Medication Reminder & Schedule with Custom Sounds',
    footerSubtitle: '100% Accurate Sound Alarm System Offline',
  },
};

const LANG_STORAGE_KEY = 'dawaei_language_v1';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationDictionary;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en' || saved === 'ar') return saved;
    } catch {
      // fallback
    }
    return 'ar';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {
      // ignore
    }
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
