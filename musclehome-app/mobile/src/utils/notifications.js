import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getMascotLine } from './mascotLines';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_HOUR = 19; // rappel du soir si pas de séance loggée dans la journée
const CATEGORY_ID = 'musclehome-reminders';

export async function ensureNotificationPermission() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Reprogramme les rappels des 7 prochains jours à heure fixe, avec une réplique
 * mascotte différente selon la distance à l'objectif de la semaine. On annule d'abord
 * tout ce qu'on avait programmé pour ne pas empiler les notifs à chaque changement d'état.
 */
export async function scheduleWeeklyReminders(streakInfo) {
  const granted = await ensureNotificationPermission();
  if (!granted) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const { remainingForGoal, streakWeeks } = streakInfo;

  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const trigger = nextTriggerDate(dayOffset);
    const isLastDayOfWeek = trigger.getDay() === 0; // dimanche

    const body =
      isLastDayOfWeek && remainingForGoal > 0
        ? getMascotLine('streak_risk', { streak: streakWeeks })
        : getMascotLine('week_in_progress', { remaining: remainingForGoal });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Buffalo',
        body,
        categoryIdentifier: Platform.OS === 'ios' ? CATEGORY_ID : undefined,
      },
      trigger,
    });
  }
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function nextTriggerDate(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(REMINDER_HOUR, 0, 0, 0);
  return d;
}
