import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#059669',
    });
  }

  return token;
}

export async function scheduleExpirationAlerts(items: any[]) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

    for (const item of items) {
      if (!item.expiry_date) continue;
      const expiry = new Date(item.expiry_date);
      const diff = expiry.getTime() - now.getTime();

      if (diff > 0 && diff < twoDaysMs) {
        const daysLeft = Math.ceil(diff / (24 * 60 * 60 * 1000));
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🧊 Expiring Soon!',
            body: `${item.name} expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Use it before it goes to waste!`,
            data: { itemId: item.id },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 60, repeats: false },
        });
      }
    }
  } catch (e) {
    console.warn('[Notifications] Failed to schedule alerts:', e);
  }
}
