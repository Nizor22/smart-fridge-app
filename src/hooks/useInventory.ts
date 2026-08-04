import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { cacheInventory, getCachedInventory } from '../lib/cache';
import { getUrgencyFromItem } from '../lib/expiration';
import { scheduleExpirationAlerts } from '../lib/notifications';
import { InventoryItem } from '../components/InventoryCard';

export function useInventory(userId: string | null, fridgeId?: string | null) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const enrichWithExpiration = (rawItems: any[]): InventoryItem[] => {
    return rawItems.map(item => {
      const { urgency, daysLeft, expiresAt } = getUrgencyFromItem(item);
      return { ...item, urgency, daysLeft, expiresAt };
    });
  };

  const fetchItems = useCallback(async () => {
    if (!userId) { setItems([]); setLoading(false); return; }
    setLoading(true);
    try {
      let query = supabase.from('inventory').select('*').order('created_at', { ascending: false });

      if (fridgeId) {
        // Shared fridge: get items for this fridge
        query = query.eq('fridge_id', fridgeId);
      } else {
        // Personal: get items with no fridge_id for this user
        query = query.eq('user_id', userId).is('fridge_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      const enriched = enrichWithExpiration(data || []);
      setItems(enriched);
      setIsOffline(false);
      await cacheInventory(enriched);
      await scheduleExpirationAlerts(enriched);
    } catch {
      setIsOffline(true);
      const cached = await getCachedInventory();
      if (cached) setItems(enrichWithExpiration(cached));
    } finally {
      setLoading(false);
    }
  }, [userId, fridgeId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItems = async (newItems: any[]) => {
    if (!userId) return;
    const toInsert = newItems.map(item => ({
      name: item.name || 'Unknown',
      category: item.category || 'Other',
      urgency: item.urgency || 'FRESH',
      price: item.price || 0,
      image_url: item.image_url || null,
      user_id: userId,
      fridge_id: fridgeId || null,
      expires_at: item.expires_at || null,
      barcode: item.barcode || null,
    }));
    const tempItems = toInsert.map((item, i) => ({ ...item, id: `temp-${Date.now()}-${i}` }));
    setItems(prev => [...enrichWithExpiration(tempItems), ...prev]);
    await supabase.from('inventory').insert(toInsert);
    fetchItems();
  };

  const deleteItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await supabase.from('inventory').delete().eq('id', id);
  };

  const updateExpiry = async (id: string, expiresAt: string) => {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, expires_at: expiresAt };
      const { urgency, daysLeft } = getUrgencyFromItem(updated);
      return { ...updated, urgency, daysLeft };
    }));
    await supabase.from('inventory').update({ expires_at: expiresAt }).eq('id', id);
  };

  return { items, loading, isOffline, fetchItems, addItems, deleteItem, updateExpiry };
}
