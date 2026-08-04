import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  INVENTORY: 'cache_inventory',
  GROCERY_LIST: 'cache_grocery_list',
};

export async function cacheInventory(items: any[]) {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.INVENTORY, JSON.stringify(items));
  } catch {}
}

export async function getCachedInventory(): Promise<any[] | null> {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEYS.INVENTORY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export async function cacheGroceryList(items: any[]) {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.GROCERY_LIST, JSON.stringify(items));
  } catch {}
}

export async function getCachedGroceryList(): Promise<any[] | null> {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEYS.GROCERY_LIST);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export async function clearCache() {
  try {
    await AsyncStorage.multiRemove([CACHE_KEYS.INVENTORY, CACHE_KEYS.GROCERY_LIST]);
  } catch {}
}
