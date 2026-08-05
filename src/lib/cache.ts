import AsyncStorage from '@react-native-async-storage/async-storage';

const INVENTORY_KEY = 'cached_inventory';
const GROCERY_KEY = 'cached_grocery_list';

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function setCachedData(key: string, data: any): Promise<void> {
  try { await AsyncStorage.setItem(key, JSON.stringify(data)); } catch {}
}

export async function clearCacheKey(key: string): Promise<void> {
  try { await AsyncStorage.removeItem(key); } catch {}
}

// Inventory-specific cache helpers
export async function cacheInventory(items: any[]): Promise<void> {
  return setCachedData(INVENTORY_KEY, items);
}

export async function getCachedInventory(): Promise<any[] | null> {
  return getCachedData<any[]>(INVENTORY_KEY);
}

// Grocery list cache helpers
export async function cacheGroceryList(items: any[]): Promise<void> {
  return setCachedData(GROCERY_KEY, items);
}

export async function getCachedGroceryList(): Promise<any[] | null> {
  return getCachedData<any[]>(GROCERY_KEY);
}
