import * as Notifications from 'expo-notifications';
import { getDaysRemaining } from './expiration';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleExpirationAlerts(items: Array<{ name: string; expires_at?: string; category: string; created_at?: string }>) {
  // Cancel all existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const now = new Date();

  for (const item of items) {
    if (!item.expires_at) continue;

    const daysLeft = getDaysRemaining(item.expires_at);

    // Schedule for items expiring within 48 hours
    if (daysLeft <= 2 && daysLeft > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Food Expiring Soon!',
          body: `${item.name} expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Use it before it goes to waste!`,
          sound: true,
          data: { itemName: item.name },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5, // Show quickly for items already near expiry
        },
      });
    }

    // Schedule a reminder for items expiring in 3-5 days (morning alert)
    if (daysLeft > 2 && daysLeft <= 5) {
      const tomorrow9am = new Date(now);
      tomorrow9am.setDate(tomorrow9am.getDate() + 1);
      tomorrow9am.setHours(9, 0, 0, 0);
      const secondsUntil = Math.max(60, Math.floor((tomorrow9am.getTime() - now.getTime()) / 1000));

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Use Soon',
          body: `${item.name} has ${daysLeft} days left. Plan to use it this week!`,
          sound: false,
          data: { itemName: item.name },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntil,
        },
      });
    }
  }
}
