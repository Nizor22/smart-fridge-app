import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import { getDaysRemaining } from '../lib/expiration';

export const INVENTORY_CHECK_TASK = 'BACKGROUND_INVENTORY_CHECK';

TaskManager.defineTask(INVENTORY_CHECK_TASK, async () => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return BackgroundFetch.BackgroundFetchResult.NoData;

    const { data: items } = await supabase.from('inventory').select('*').eq('status', 'ACTIVE');
    if (!items || items.length === 0) return BackgroundFetch.BackgroundFetchResult.NoData;

    // Trigger 1: Expiry warnings
    const expiringItems = items.filter(i => i.expires_at && getDaysRemaining(i.expires_at) <= 2);
    if (expiringItems.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: { title: '🚨 Expiry Warning', body: `${expiringItems.length} items expiring soon!` },
        trigger: null,
      });
    }

    // Trigger 2: Restock alerts
    const lowStock = items.filter(i => (i.quantity || 1) <= 1);
    if (lowStock.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: { title: '🛒 Restock Alert', body: `Low stock on ${lowStock.length} items.` },
        trigger: null,
      });
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundScheduler() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(INVENTORY_CHECK_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(INVENTORY_CHECK_TASK, {
        minimumInterval: 60 * 60 * 24,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch (err) {
    console.error('Failed to register background task:', err);
  }
}
