
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { Medication } from '../types/medication';

export async function requestAndroidNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  const permission = await LocalNotifications.checkPermissions();

  if (permission.display === 'granted') return true;

  const result = await LocalNotifications.requestPermissions();
  return result.display === 'granted';
}

export async function scheduleAndroidMedicationNotifications(
  medications: Medication[]
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const allowed = await requestAndroidNotificationPermission();
  if (!allowed) return;

  const existing = await LocalNotifications.getPending();

  const oldIds = existing.notifications
    .filter(n => n.extra?.source === 'dawaa-medication')
    .map(n => ({ id: n.id }));

  if (oldIds.length > 0) {
    await LocalNotifications.cancel({ notifications: oldIds });
  }

  const notifications = [];
  const now = new Date();
  let nextId = 10000;

  for (const medication of medications) {
    if (!medication.enabled) continue;

    const [hour, minute] = medication.time.split(':').map(Number);

    if (
      !Number.isInteger(hour) || hour < 0 || hour > 23 ||
      !Number.isInteger(minute) || minute < 0 || minute > 59
    ) continue;

    for (const day of new Set(medication.days)) {
      if (!Number.isInteger(day) || day < 0 || day > 6) continue;

      const scheduledDate = new Date(now);
      const todayArabic = (now.getDay() + 1) % 7;
      let daysAhead = (day - todayArabic + 7) % 7;

      scheduledDate.setDate(now.getDate() + daysAhead);
      scheduledDate.setHours(hour, minute, 0, 0);

      if (scheduledDate <= now) {
        daysAhead += 7;
        scheduledDate.setDate(now.getDate() + daysAhead);
      }

      notifications.push({
        id: nextId++,
        title: 'موعد دوائك',
        body: `${medication.name} - ${medication.dosage}`,
        schedule: {
          at: scheduledDate,
          repeats: true,
          every: 'week' as const
        },
        extra: {
          source: 'dawaa-medication',
          medicationId: medication.id
        }
      });
    }
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }

  console.log('Dawaa notifications updated');
}
  