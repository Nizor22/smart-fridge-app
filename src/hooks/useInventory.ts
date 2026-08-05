import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { cacheInventory, getCachedInventory } from '../lib/cache';
import { getUrgencyFromItem } from '../lib/expiration';
import { scheduleExpirationAlerts } from '../lib/notifications';
import { InventoryItem } from '../components/InventoryCard';
import { calculateExpiryDate } from '../lib/expiration';

export function useInventory(userId: string | null, fridgeId?: string | null) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const hasLoaded = useRef(false);

  const enrichWithExpiration = (rawItems: any[]): InventoryItem[] => {
    return rawItems.map(item => {
      const { urgency, daysLeft, expiresAt } = getUrgencyFromItem(item);
      return { ...item, urgency, daysLeft, expiresAt };
    });
  };

  const fetchItems = useCallback(async () => {
    if (!userId || !fridgeId) { setItems([]); return; }
    if (!hasLoaded.current) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('fridge_id', fridgeId)
        .eq('status', 'ACTIVE')
        .order('expires_at', { ascending: true });

      if (error) throw error;
      const enriched = enrichWithExpiration(data || []);
      setItems(enriched);
      setIsOffline(false);
      hasLoaded.current = true;
      await cacheInventory(enriched);
      scheduleExpirationAlerts(enriched);  // fire-and-forget, don't block UI
    } catch {
      setIsOffline(true);
      const cached = await getCachedInventory();
      if (cached) setItems(enrichWithExpiration(cached));
    } finally {
      setLoading(false);
    }
  }, [userId, fridgeId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Realtime: auto-refresh when roommate adds/modifies items
  useEffect(() => {
    if (!fridgeId) return;
    const channel = supabase
      .channel(`inventory:${fridgeId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory',
        filter: `fridge_id=eq.${fridgeId}`,
      }, () => {
        fetchItems();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fridgeId, fetchItems]);

  const addItems = async (newItems: any[]) => {
    if (!userId || !fridgeId) return;
    const toInsert = newItems.map(item => ({
      name: item.name || 'Unknown',
      category: item.category || 'Other',
      urgency: item.urgency || 'FRESH',
      status: 'ACTIVE',
      quantity: item.quantity || 1,
      unit: item.unit || 'item',
      price: item.price || 0,
      image_url: item.image_url || null,
      added_by: userId,
      fridge_id: fridgeId,
      expires_at: item.expires_at || calculateExpiryDate(item.category || 'Other'),
      barcode: item.barcode || null,
    }));
    const tempItems = toInsert.map((item, i) => ({ ...item, id: `temp-${Date.now()}-${i}` }));
    setItems(prev => [...enrichWithExpiration(tempItems), ...prev]);
    await supabase.from('inventory').insert(toInsert);
  };

  // Soft delete → mark as TRASHED (preserves AI training data)
  const deleteItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await supabase.from('inventory').update({ status: 'TRASHED' }).eq('id', id);
  };

  // Mark as consumed (preserves AI training data, triggers updated_at)
  const consumeItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await supabase.from('inventory').update({ status: 'CONSUMED' }).eq('id', id);
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

  return { items, loading, isOffline, fetchItems, addItems, deleteItem, consumeItem, updateExpiry };
}
