import { Medication, DoseLog, AppSettings } from '../types/medication';

const MEDS_STORAGE_KEY = 'dawaei_medications_v1';
const LOGS_STORAGE_KEY = 'dawaei_doselogs_v1';
const SETTINGS_STORAGE_KEY = 'dawaei_settings_v1';

export const INITIAL_MEDICATIONS: Medication[] = [];

export const INITIAL_SETTINGS: AppSettings = {
  defaultRingtoneId: 'morning_gentle',
  volume: 0.85,
  snoozeMinutes: 5,
  vibrationEnabled: true,
  enableNotifications: true,
  showInstructionsReminder: true,
};

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's Arabic index:
 * Saturday = 0, Sunday = 1, Monday = 2, Tuesday = 3, Wednesday = 4, Thursday = 5, Friday = 6
 */
export function getArabicDayIndex(date: Date = new Date()): number {
  const jsDay = date.getDay(); // 0 is Sunday, 6 is Saturday
  // Map:
  // Saturday (6) -> 0
  // Sunday (0) -> 1
  // Monday (1) -> 2
  // Tuesday (2) -> 3
  // Wednesday (3) -> 4
  // Thursday (4) -> 5
  // Friday (5) -> 6
  return (jsDay + 1) % 7;
}

export function loadMedications(): Medication[] {
  try {
    const raw = localStorage.getItem(MEDS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MEDS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load medications from storage', err);
    return [];
  }
}

export function saveMedications(meds: Medication[]) {
  try {
    localStorage.setItem(MEDS_STORAGE_KEY, JSON.stringify(meds));
  } catch (err) {
    console.error('Failed to save medications', err);
  }
}

export function loadDoseLogs(): DoseLog[] {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function generateInitialPastWeekLogs(): DoseLog[] {
  return [];
}

  
export function saveDoseLogs(logs: DoseLog[]) {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save dose logs', err);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? { ...INITIAL_SETTINGS, ...JSON.parse(raw) } : INITIAL_SETTINGS;
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}
