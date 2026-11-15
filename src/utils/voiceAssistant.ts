/**
 * Voice Assistant & Speech Interaction Engine for Patients
 * Handles Speech-to-Text (STT) and Native/Web Text-to-Speech (TTS)
 * Supports verbal commands for taking meds, snoozing alarms, inquiries, and schedule review.
 */

import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
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

// Pre-load Web SpeechSynthesis voices if available
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  } catch {}
}

/**
 * Web SpeechSynthesis Fallback Helper
 */
function speakWebSpeech(text: string, langTag: string, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return false;
  }

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        const isEnglish = /[a-zA-Z]/.test(text) && !/[\u0600-\u06FF]/.test(text);
        utterance.lang = isEnglish ? 'en-US' : 'ar-SA';
        utterance.rate = 0.92;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const matchVoice = isEnglish
            ? voices.find((v) => v.lang.startsWith('en'))
            : voices.find((v) => v.lang.startsWith('ar') || v.name.includes('Arabic'));
          if (matchVoice) {
            utterance.voice = matchVoice;
          }
        }

        if (onEnd) {
          utterance.onend = onEnd;
          utterance.onerror = onEnd;
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('SpeechSynthesis error:', err);
        if (onEnd) onEnd();
      }
    }, 60);

    return true;
  } catch (err) {
    console.error('Failed WebSpeech:', err);
    if (onEnd) onEnd();
    return false;
  }
}

/**
 * Text-to-Speech (TTS) engine for Arabic and English.
 * Uses Native Android TTS on Capacitor with multi-lang fallback (ar, ar_SA, ar-SA, en-US) for 100% reliable voice playback.
 */
export function speakArabic(text: string, onEnd?: () => void): boolean {
  const isEnglish = /[a-zA-Z]/.test(text) && !/[\u0600-\u06FF]/.test(text);
  const primaryLang = isEnglish ? 'en-US' : 'ar';

  // 1. Native Android TTS via Capacitor Plugin with multi-locale fallback
  if (Capacitor.isNativePlatform()) {
    TextToSpeech.stop().catch(() => {});

    TextToSpeech.speak({
      text,
      lang: primaryLang,
      rate: 0.95,
      pitch: 1.0,
      volume: 1.0,
      category: 'ambient',
    })
      .then(() => {
        if (onEnd) onEnd();
      })
      .catch((err1) => {
        console.warn('Native TTS primary lang failed, trying secondary:', err1);

        TextToSpeech.speak({
          text,
          lang: isEnglish ? 'en_US' : 'ar_SA',
          rate: 0.95,
          pitch: 1.0,
          volume: 1.0,
          category: 'ambient',
        })
          .then(() => {
            if (onEnd) onEnd();
          })
          .catch((err2) => {
            console.warn('Native TTS secondary lang failed, trying tertiary:', err2);

            TextToSpeech.speak({
              text,
              lang: isEnglish ? 'en-US' : 'ar-SA',
              rate: 0.95,
              pitch: 1.0,
              volume: 1.0,
              category: 'ambient',
            })
              .then(() => {
                if (onEnd) onEnd();
              })
              .catch((err3) => {
                console.warn('Native TTS all locales failed, falling back to WebSpeech:', err3);
                speakWebSpeech(text, primaryLang, onEnd);
              });
          });
      });
    return true;
  }

  // 2. Web Browser Fallback
  return speakWebSpeech(text, primaryLang, onEnd);
}

export function stopSpeaking() {
  if (Capacitor.isNativePlatform()) {
    TextToSpeech.stop().catch(() => {});
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Normalizes text for flexible matching
 */
export function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .trim();
}

/**
 * Parse verbal command from speech recognition transcript in active language (ar / en)
 */
export function parseVoiceCommand(
  rawTranscript: string,
  context: VoiceContext,
  language: 'ar' | 'en' = 'ar'
): VoiceCommandResult {
  const norm = normalizeArabic(rawTranscript);
  const isEn = language === 'en';

  // 1. Alarm control during active ringing
  if (context.ringingMedication) {
    const ringing = context.ringingMedication;

    if (
      norm.includes('اسكت') ||
      norm.includes('اوقف') ||
      norm.includes('اقفل') ||
      norm.includes('كفايه') ||
      norm.includes('ايقاف') ||
      norm.includes('stop') ||
      norm.includes('silence') ||
      norm.includes('off')
    ) {
      return {
        type: 'STOP_ALARM',
        spokenResponse: isEn ? 'Alarm stopped successfully.' : 'تم إيقاف صوت المنبه.',
        matchedMedication: ringing,
      };
    }

    if (
      norm.includes('غفوه') ||
      norm.includes('اجل') ||
      norm.includes('اخر') ||
      norm.includes('ساعه غفوه') ||
      norm.includes('كمان شويه') ||
      norm.includes('5 دقائق') ||
      norm.includes('خمس دقائق') ||
      norm.includes('snooze') ||
      norm.includes('later')
    ) {
      return {
        type: 'SNOOZE',
        spokenResponse: isEn
          ? 'Alarm snoozed for 5 minutes. I will remind you again.'
          : 'تم تأجيل التنبيه لمدة 5 دقائق. سأذكرك مرة أخرى.',
        matchedMedication: ringing,
        snoozeMinutes: 5,
      };
    }

    if (norm.includes('تخطي') || norm.includes('مش هاخد') || norm.includes('الغاء') || norm.includes('skip')) {
      return {
        type: 'SKIP_DOSE',
        spokenResponse: isEn ? 'Skipped this dose.' : 'تم تسجيل تخطي هذه الجرعة.',
        matchedMedication: ringing,
      };
    }

    if (
      norm.includes('اخذت') ||
      norm.includes('تناولت') ||
      norm.includes('شربت') ||
      norm.includes('بلعت') ||
      norm.includes('تمام') ||
      norm.includes('خلاص') ||
      norm.includes('تم التناول') ||
      norm.includes('خدت') ||
      norm.includes('took') ||
      norm.includes('taken') ||
      norm.includes('done')
    ) {
      return {
        type: 'TAKE_DOSE',
        spokenResponse: isEn
          ? `Recorded taking ${ringing.name} successfully.`
          : `بالشفاء والعافية إن شاء الله، تم تسجيل تناول ${ringing.name} بنجاح.`,
        matchedMedication: ringing,
      };
    }
  }

  // 2. Taking a medication generally
  const isTakeIntent =
    norm.includes('اخذت') ||
    norm.includes('تناولت') ||
    norm.includes('شربت') ||
    norm.includes('بلعت') ||
    norm.includes('تم اخذ') ||
    norm.includes('سجل اني اخدت') ||
    norm.includes('خدت') ||
    norm.includes('took') ||
    norm.includes('taken') ||
    norm.includes('take');

  if (isTakeIntent) {
    for (const med of context.todayMeds) {
      const medNorm = normalizeArabic(med.name);
      const nameParts = medNorm.split(/[\s()_-]+/).filter((w) => w.length > 2);
      const matched = nameParts.some((part) => norm.includes(part));
      if (matched) {
        return {
          type: 'TAKE_DOSE',
          spokenResponse: isEn
            ? `Recorded taking ${med.name} successfully.`
            : `صحة وعافية، تم تسجيل تناول ${med.name}.`,
          matchedMedication: med,
        };
      }
    }

    if (norm.includes('صباح') || norm.includes('افطار') || norm.includes('فطار') || norm.includes('morning')) {
      const morningMed = context.todayMeds.find((m) => m.timeSlot === 'morning');
      if (morningMed) {
        return {
          type: 'TAKE_DOSE',
          spokenResponse: isEn
            ? `Recorded morning dose: ${morningMed.name}.`
            : `تم تسجيل تناول أدوية الصباح: ${morningMed.name}. ألف سلامة.`,
          matchedMedication: morningMed,
        };
      }
    }
    if (norm.includes('قبل الغدا') || norm.includes('before lunch')) {
      const bLunchMed = context.todayMeds.find((m) => m.timeSlot === 'before_lunch');
      if (bLunchMed) {
        return {
          type: 'TAKE_DOSE',
          spokenResponse: isEn
            ? `Recorded dose before lunch: ${bLunchMed.name}.`
            : `تم تسجيل تناول دواء قبل الغداء: ${bLunchMed.name}. بالشفاء.`,
          matchedMedication: bLunchMed,
        };
      }
    }
    if (norm.includes('اثناء الغدا') || norm.includes('مع الغدا') || norm.includes('during lunch')) {
      const dLunchMed = context.todayMeds.find((m) => m.timeSlot === 'during_lunch');
      if (dLunchMed) {
        return {
          type: 'TAKE_DOSE',
          spokenResponse: isEn
            ? `Recorded dose during lunch: ${dLunchMed.name}.`
            : `تم تسجيل تناول دواء أثناء الغداء: ${dLunchMed.name}. بالهناء والشفاء.`,
          matchedMedication: dLunchMed,
        };
      }
    }
    if (norm.includes('ليل') || norm.includes('مساء') || norm.includes('نوم') || norm.includes('night')) {
      const nightMed = context.todayMeds.find((m) => m.timeSlot === 'night');
      if (nightMed) {
        return {
          type: 'TAKE_DOSE',
          spokenResponse: isEn
            ? `Recorded night dose: ${nightMed.name}.`
            : `تم تسجيل تناول دواء الليل: ${nightMed.name}. نوماً هنيئاً وعافية.`,
          matchedMedication: nightMed,
        };
      }
    }

    const untaken = context.todayMeds.filter((m) => !context.takenMedIds.includes(m.id));
    if (untaken.length > 0) {
      const target = untaken[0];
      return {
        type: 'TAKE_DOSE',
        spokenResponse: isEn
          ? `Recorded taking ${target.name} successfully.`
          : `تم تسجيل تناول ${target.name}. شفاك الله وعافاك.`,
        matchedMedication: target,
      };
    } else {
      return {
        type: 'TAKE_DOSE',
        spokenResponse: isEn
          ? 'Great job! All scheduled doses for today are already recorded as taken.'
          : 'أحسنت! جميع جرعات اليوم مسجلة بالفعل بأنك تناولتها.',
      };
    }
  }

  // 3. Inquire: Next upcoming dose
  if (
    norm.includes('القادم') ||
    norm.includes('الجاي') ||
    norm.includes('التالي') ||
    norm.includes('بعد كده') ||
    norm.includes('الدور') ||
    norm.includes('next') ||
    norm.includes('upcoming')
  ) {
    if (context.nextMedication) {
      const slot = isEn
        ? TIME_SLOTS[context.nextMedication.timeSlot]?.labelEn || 'Custom'
        : TIME_SLOTS[context.nextMedication.timeSlot]?.labelAr || 'مخصص';

      return {
        type: 'INQUIRE_NEXT',
        spokenResponse: isEn
          ? `Your next dose is ${context.nextMedication.name}, dosage ${context.nextMedication.dosage}, scheduled for ${slot} at ${context.nextMedication.time}.`
          : `جرعتك القادمة هي ${context.nextMedication.name}، الجرعة ${context.nextMedication.dosage}، في موعد ${slot} الساعة ${context.nextMedication.time}. ${context.nextMedication.instructions || ''}`,
        matchedMedication: context.nextMedication,
      };
    } else {
      return {
        type: 'INQUIRE_NEXT',
        spokenResponse: isEn
          ? 'No remaining doses for today. You completed all medications successfully!'
          : 'لا توجد جرعات متبقية لليوم. أكملت جميع أدويتك بنجاح!',
      };
    }
  }

  // 4. Inquire: Today's full schedule
  if (
    norm.includes('ادويه اليوم') ||
    norm.includes('جدول اليوم') ||
    norm.includes('جرعات اليوم') ||
    norm.includes('اقرا جدول') ||
    norm.includes('schedule') ||
    norm.includes('today')
  ) {
    const total = context.todayMeds.length;
    const taken = context.todayMeds.filter((m) => context.takenMedIds.includes(m.id)).length;
    const remaining = total - taken;

    if (isEn) {
      let response = `You have ${total} doses today. ${taken} taken, ${remaining} remaining. `;
      if (remaining > 0) {
        const untakenNames = context.todayMeds
          .filter((m) => !context.takenMedIds.includes(m.id))
          .map((m) => `${m.name} at ${m.time}`)
          .join(', and ');
        response += `Remaining: ${untakenNames}.`;
      } else {
        response += 'You have completed all scheduled doses today!';
      }
      return {
        type: 'INQUIRE_TODAY',
        spokenResponse: response,
      };
    } else {
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
  }

  // 5. Add new medication by voice
  if (norm.includes('اضف') || norm.includes('ضيف') || norm.includes('سجل دواء') || norm.includes('دواء جديد') || norm.includes('add')) {
    let extractedName = '';
    let extractedSlot: 'morning' | 'before_lunch' | 'during_lunch' | 'night' = 'morning';

    if (norm.includes('قبل الغدا') || norm.includes('before lunch')) extractedSlot = 'before_lunch';
    else if (norm.includes('اثناء الغدا') || norm.includes('مع الغدا') || norm.includes('during lunch')) extractedSlot = 'during_lunch';
    else if (norm.includes('ليل') || norm.includes('مساء') || norm.includes('night')) extractedSlot = 'night';
    else if (norm.includes('صباح') || norm.includes('morning')) extractedSlot = 'morning';

    const match = norm.match(/(?:اضف|ضيف|سجل دواء|دواء جديد|add)\s+(?:دواء\s+)?([^\s]+(?:\s+[^\s]+)?)/);
    if (match && match[1]) {
      extractedName = match[1];
    }

    return {
      type: 'ADD_MED',
      spokenResponse: isEn
        ? `Opening add medication window for ${extractedName || 'new medication'}.`
        : extractedName
        ? `سأفتح لك نافذة إضافة الدواء لـ ${extractedName}. يرجى مراجعة التفاصيل وتأكيد الحفظ.`
        : 'سأفتح لك نافذة إضافة دواء جديد لتسجيل بياناته.',
      newMedName: extractedName,
      newMedSlot: extractedSlot,
    };
  }

  // 6. Navigation tabs
  if (norm.includes('اسبوع') || norm.includes('اسبوعي') || norm.includes('weekly')) {
    return {
      type: 'NAVIGATE',
      spokenResponse: isEn ? 'Opened weekly schedule tab.' : 'تم فتح الجدول الأسبوعي للأدوية.',
      tabTarget: 'weekly',
    };
  }
  if (norm.includes('نغمات') || norm.includes('اصوات') || norm.includes('رنين') || norm.includes('ringtones')) {
    return {
      type: 'NAVIGATE',
      spokenResponse: isEn ? 'Opened ringtones sound center.' : 'تم فتح مكتبة نغمات المنبه والتحكم بالأصوات.',
      tabTarget: 'ringtones',
    };
  }
  if (norm.includes('اليوم') || norm.includes('رئيسيه') || norm.includes('today')) {
    return {
      type: 'NAVIGATE',
      spokenResponse: isEn ? 'Opened today doses schedule.' : 'تم فتح جدول جرعات اليوم.',
      tabTarget: 'today',
    };
  }

  // 7. Help & Commands guidance
  if (norm.includes('مساعده') || norm.includes('اوامر') || norm.includes('help')) {
    return {
      type: 'HELP',
      spokenResponse: isEn
        ? "You can say: 'I took the dose', 'What is my next dose?', 'Read today schedule', or 'Add new medication'."
        : 'يمكنك التحدث معي ببساطة وقول: "أخذت الدواء"، "ما هو دوائي القادم؟"، "اقرأ جدول اليوم"، "غفوة خمس دقائق"، أو "أضف دواء جديد". أنا هنا لمساعدتك دائماً.',
    };
  }

  // Fallback / Unknown
  return {
    type: 'UNKNOWN',
    spokenResponse: isEn
      ? `I heard you say: "${rawTranscript}". You can ask: 'What is my next dose?' or 'Read today schedule'.`
      : `سمعتك تقول: "${rawTranscript}". يمكنك أن تقول: "أخذت الدواء"، أو "ما هو دوائي القادم؟"، أو "اقرأ جدول اليوم".`,
  };
}

export interface SpeechRecognitionWrapper {
  start: () => void;
  stop: () => void;
  isSupported: boolean;
  isListening: boolean;
}
