/**
 * Voice Assistant & Speech Interaction Engine for Patients
 * Handles Arabic Speech-to-Text (STT) and Arabic Text-to-Speech (TTS)
 * Supports verbal commands for taking meds, snoozing alarms, inquiries, and schedule review.
 */

import { Medication, TIME_SLOTS } from '../types/medication';
import { RINGTONES } from './soundEngine';

export interface VoiceCommandResult {
  type:
    | 'TAKE_DOSE'
    | 'SNOOZE'
    | 'STOP_ALARM'
    | 'SKIP_DOSE'
    | 'INQUIRE_NEXT'
    | 'INQUIRE_TODAY'
    | 'ADD_MED'
    | 'NAVIGATE'
    | 'PREVIEW_TONE'
    | 'ADJUST_VOLUME'
    | 'HELP'
    | 'UNKNOWN';
  spokenResponse: string;
  matchedMedication?: Medication;
  tabTarget?: 'today' | 'weekly' | 'ringtones';
  snoozeMinutes?: number;
  newMedName?: string;
  newMedSlot?: 'morning' | 'before_lunch' | 'during_lunch' | 'night';
  volumeDelta?: number;
}

export interface VoiceContext {
  ringingMedication: Medication | null;
  todayMeds: Medication[];
  takenMedIds: string[];
  allMeds: Medication[];
  nextMedication: Medication | null;
}

/**
 * Text-to-Speech (TTS) in Arabic
 */
export function speakArabic(text: string, onEnd?: () => void): boolean {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any previous utterance

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95; // Clear and natural pacing for patients
    utterance.pitch = 1.0;

    // Pick best Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar') || v.name.includes('Arabic'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Failed to speak text:', err);
    if (onEnd) onEnd();
    return false;
  }
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Normalizes Arabic text for flexible matching (removes tashkeel, standardizes alef/ta/ya)
 */
export function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove diacritics
    .trim();
}

/**
 * Parse verbal command from speech recognition transcript
 */
export function parseVoiceCommand(rawTranscript: string, context: VoiceContext): VoiceCommandResult {
  const norm = normalizeArabic(rawTranscript);

  // 1. Alarm control during active ringing
  if (context.ringingMedication) {
    const ringing = context.ringingMedication;

    // Stop / silence alarm
    if (
      norm.includes('اسكت') ||
      norm.includes('اوقف') ||
      norm.includes('اقفل') ||
      norm.includes('كفايه') ||
      norm.includes('ايقاف') ||
      norm.includes('stop')
    ) {
      return {
        type: 'STOP_ALARM',
        spokenResponse: 'تم إيقاف صوت المنبه.',
        matchedMedication: ringing,
      };
    }

    // Snooze alarm
    if (
      norm.includes('غفوه') ||
      norm.includes('اجل') ||
      norm.includes('اخر') ||
      norm.includes('ساعه غفوه') ||
      norm.includes('كمان شويه') ||
      norm.includes('5 دقائق') ||
      norm.includes('خمس دقائق') ||
      norm.includes('snooze')
    ) {
      return {
        type: 'SNOOZE',
        spokenResponse: 'تم تأجيل التنبيه لمدة 5 دقائق. سأذكرك مرة أخرى.',
        matchedMedication: ringing,
        snoozeMinutes: 5,
      };
    }

    // Skip dose
    if (norm.includes('تخطي') || norm.includes('مش هاخد') || norm.includes('الغاء')) {
      return {
        type: 'SKIP_DOSE',
        spokenResponse: 'تم تسجيل تخطي هذه الجرعة.',
        matchedMedication: ringing,
      };
    }

    // Taken confirmation
    if (
      norm.includes('اخذت') ||
      norm.includes('تناولت') ||
      norm.includes('شربت') ||
      norm.includes('بلعت') ||
      norm.includes('تمام') ||
      norm.includes('خلاص') ||
      norm.includes('تم التناول') ||
      norm.includes('خدت')
    ) {
      return {
        type: 'TAKE_DOSE',
        spokenResponse: `بالشفاء والعافية إن شاء الله، تم تسجيل تناول ${ringing.name} بنجاح.`,
        matchedMedication: ringing,
      };
    }
  }

  // 2. Taking a medication generally (when not currently ringing or specifying med name)
  const isTakeIntent =
    norm.includes('اخذت') ||
    norm.includes('تناولت') ||
    norm.includes('شربت') ||
    norm.includes('بلعت') ||
    norm.includes('تم اخذ') ||
    norm.includes('سجل اني اخدت') ||
    norm.includes('خدت');

  if (isTakeIntent) {
    // Check if user named a specific medication
    for (const med of context.todayMeds) {
      const medNorm = normalizeArabic(med.name);
      const nameParts = medNorm.split(/[\s()_-]+/).filter((w) => w.length > 2);
      const matched = nameParts.some((part) => norm.includes(part));
      if (matched) {
        return {
          type: 'TAKE_DOSE',
          spokenResponse: `صحة وعافية، تم تسجيل تناول ${med.name}.`,
          matchedMedication: med,
        };
      }
    }

    // Check if slot was named: الصباح، قبل الغداء، أثناء الغداء، بالليل
    if (norm.includes('صباح') || norm.includes('افطار') || norm.includes('فطار')) {
      const morningMed = context.todayMeds.find((m) => m.timeSlot === 'morning');
      if (morningMed) {
        return {
          type: 'TAKE_DOSE',
          spokenResponse: `تم تسجيل تناول أدوية الصباح: ${morningMed.name}. ألف سلامة.`,
          matchedMedication: morningMed,
        };
      }
    }
    if (norm.includes('قبل الغدا')) {
      const bLunchMed = context.todayMeds.find((m) => m.timeSlot === 'before_lunch');
      if (bLunchMed) {
        return {
          type: 'TAKE_DOSE',
          spokenResponse: `تم تسجيل تناول دواء قبل الغداء: ${bLunchMed.name}. بالشفاء.`,
          matchedMedication: bLunchMed,
        };
      }
    }
    if (norm.includes('اثناء الغدا') || norm.includes('مع الغدا') || norm.includes('في الغدا')) {
      const dLunchMed = context.todayMeds.find((m) => m.timeSlot === 'during_lunch');
      if (dLunchMed) {
        return {
          type: 'TAKE_DOSE',
          spokenResponse: `تم تسجيل تناول دواء أثناء الغداء: ${dLunchMed.name}. بالهناء والشفاء.`,
          matchedMedication: dLunchMed,
        };
      }
    }
    if (norm.includes('ليل') || norm.includes('مساء') || norm.includes('نوم') || norm.includes('عشاء')) {
      const nightMed = context.todayMeds.find((m) => m.timeSlot === 'night');
      if (nightMed) {
        return {
          type: 'TAKE_DOSE',
          spokenResponse: `تم تسجيل تناول دواء الليل: ${nightMed.name}. نوماً هنيئاً وعافية.`,
          matchedMedication: nightMed,
        };
      }
    }

    // If general "أخذت الدواء" without specific name, mark the next upcoming or first untaken
    const untaken = context.todayMeds.filter((m) => !context.takenMedIds.includes(m.id));
    if (untaken.length > 0) {
      const target = untaken[0];
      return {
        type: 'TAKE_DOSE',
        spokenResponse: `تم تسجيل تناول ${target.name}. شفاك الله وعافاك.`,
        matchedMedication: target,
      };
    } else {
      return {
        type: 'TAKE_DOSE',
        spokenResponse: 'أحسنت! جميع جرعات اليوم مسجلة بالفعل بأنك تناولتها.',
      };
    }
  }

  // 3. Inquire: Next upcoming dose (ما هو دوائي القادم؟ / إيه الجرعة الجاية؟)
  if (
    norm.includes('القادم') ||
    norm.includes('الجاي') ||
    norm.includes('التالي') ||
    norm.includes('بعد كده') ||
    norm.includes('الدور') ||
    norm.includes('الدواء الجاي') ||
    norm.includes('موعد الدواء القادم')
  ) {
    if (context.nextMedication) {
      const slot = TIME_SLOTS[context.nextMedication.timeSlot]?.labelAr || 'مخصص';
      return {
        type: 'INQUIRE_NEXT',
        spokenResponse: `جرعتك القادمة هي ${context.nextMedication.name}، الجرعة ${context.nextMedication.dosage}، في موعد ${slot} الساعة ${context.nextMedication.time}. ${context.nextMedication.instructions || ''}`,
        matchedMedication: context.nextMedication,
      };
    } else {
      return {
        type: 'INQUIRE_NEXT',
        spokenResponse: 'لا توجد جرعات متبقية لليوم. أكملت جميع أدويتك بنجاح!',
      };
    }
  }

  // 4. Inquire: Today's full schedule (ما هي أدوية اليوم؟ / اقرأ جدول اليوم)
  if (
    norm.includes('ادويه اليوم') ||
    norm.includes('جدول اليوم') ||
    norm.includes('جرعات اليوم') ||
    norm.includes('اقرا جدول') ||
    norm.includes('كام دواء') ||
    norm.includes('كم دواء') ||
    norm.includes('باقي ايه')
  ) {
    const total = context.todayMeds.length;
    const taken = context.todayMeds.filter((m) => context.takenMedIds.includes(m.id)).length;
    const remaining = total - taken;

    let response = `لديك اليوم ${total} جرعات. تناولت منها ${taken}، وبقي ${remaining}. `;
    if (remaining > 0) {
      const untakenNames = context.todayMeds
        .filter((m) => !context.takenMedIds.includes(m.id))
        .map((m) => `${m.name} في ${TIME_SLOTS[m.timeSlot]?.labelAr || ''} الساعة ${m.time}`)
        .join('، و ');
      response += `المتبقي هو: ${untakenNames}.`;
    } else {
      response += 'أتممت جميع جرعات اليوم بنجاح ممتاز!';
    }

    return {
      type: 'INQUIRE_TODAY',
      spokenResponse: response,
    };
  }

  // 5. Add new medication by voice (أضف دواء جديد / سجل دواء بنادول الصباح)
  if (norm.includes('اضف') || norm.includes('ضيف') || norm.includes('سجل دواء') || norm.includes('دواء جديد')) {
    let extractedName = '';
    let extractedSlot: 'morning' | 'before_lunch' | 'during_lunch' | 'night' = 'morning';

    if (norm.includes('قبل الغدا')) extractedSlot = 'before_lunch';
    else if (norm.includes('اثناء الغدا') || norm.includes('مع الغدا')) extractedSlot = 'during_lunch';
    else if (norm.includes('ليل') || norm.includes('مساء')) extractedSlot = 'night';
    else if (norm.includes('صباح')) extractedSlot = 'morning';

    // Extract medicine name after command word
    const match = norm.match(/(?:اضف|ضيف|سجل دواء|دواء جديد)\s+(?:دواء\s+)?([^\s]+(?:\s+[^\s]+)?)/);
    if (match && match[1]) {
      extractedName = match[1];
    }

    return {
      type: 'ADD_MED',
      spokenResponse: extractedName
        ? `سأفتح لك نافذة إضافة الدواء لـ ${extractedName}. يرجى مراجعة التفاصيل وتأكيد الحفظ.`
        : 'سأفتح لك نافذة إضافة دواء جديد لتسجيل بياناته.',
      newMedName: extractedName,
      newMedSlot: extractedSlot,
    };
  }

  // 6. Navigation tabs (افتح الأسبوع / افتح النغمات / افتح اليوم)
  if (norm.includes('اسبوع') || norm.includes('اسبوعي')) {
    return {
      type: 'NAVIGATE',
      spokenResponse: 'تم فتح الجدول الأسبوعي للأدوية.',
      tabTarget: 'weekly',
    };
  }
  if (norm.includes('نغمات') || norm.includes('اصوات') || norm.includes('رنين')) {
    return {
      type: 'NAVIGATE',
      spokenResponse: 'تم فتح مكتبة نغمات المنبه والتحكم بالأصوات.',
      tabTarget: 'ringtones',
    };
  }
  if (norm.includes('اليوم') || norm.includes('رئيسيه') || norm.includes('جرعات')) {
    return {
      type: 'NAVIGATE',
      spokenResponse: 'تم فتح جدول جرعات اليوم.',
      tabTarget: 'today',
    };
  }

  // 7. Help & Commands guidance
  if (norm.includes('مساعده') || norm.includes('اوامر') || norm.includes('اعمل ايه') || norm.includes('تعليمات')) {
    return {
      type: 'HELP',
      spokenResponse:
        'يمكنك التحدث معي ببساطة وقول: "أخذت الدواء"، "ما هو دوائي القادم؟"، "اقرأ جدول اليوم"، "غفوة خمس دقائق"، أو "أضف دواء جديد". أنا هنا لمساعدتك دائماً.',
    };
  }

  // Fallback / Unknown
  return {
    type: 'UNKNOWN',
    spokenResponse:
      'سمعتك تقول: "' +
      rawTranscript +
      '". يمكنك أن تقول: "أخذت الدواء"، أو "ما هو دوائي القادم؟"، أو "اقرأ جدول اليوم".',
  };
}

/**
 * Speech Recognition Wrapper Interface
 */
export interface SpeechRecognitionWrapper {
  start: () => void;
  stop: () => void;
  isSupported: boolean;
  isListening: boolean;
}
