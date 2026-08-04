import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { cacheGroceryList, getCachedGroceryList } from '../lib/cache';

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  is_purchased: boolean;
}

export function useGroceryList(userId: string | null, fridgeId?: string | null) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const fetchList = useCallback(async () => {
    if (!userId || !fridgeId) { setItems([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grocery_list')
        .select('*')
        .eq('fridge_id', fridgeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
      setIsOffline(false);
      await cacheGroceryList(data || []);
    } catch {
      setIsOffline(true);
      const cached = await getCachedGroceryList();
      if (cached) setItems(cached);
    } finally {
      setLoading(false);
    }
  }, [userId, fridgeId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const addItem = async (name: string, quantity: number = 1) => {
    if (!userId || !fridgeId || !name.trim()) return;
    const newItem = { name: name.trim(), quantity, is_purchased: false, added_by: userId, fridge_id: fridgeId };
    setItems(prev => [{ id: `temp-${Date.now()}`, ...newItem }, ...prev]);
    await supabase.from('grocery_list').insert([newItem]);
    fetchList();
  };

  const toggleItem = async (id: string, current: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_purchased: !current } : i));
    await supabase.from('grocery_list').update({ is_purchased: !current }).eq('id', id);
  };

  const deleteItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await supabase.from('grocery_list').delete().eq('id', id);
  };

  return { items, loading, isOffline, fetchList, addItem, toggleItem, deleteItem };
}
