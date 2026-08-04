import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Fridge {
  id: string;
  name: string;
  created_by: string;
  invite_code: string;
  created_at: string;
  role?: string;
}

export function useFridges(userId: string | null) {
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [activeFridgeId, setActiveFridgeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFridges = useCallback(async () => {
    if (!userId) { setFridges([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data: memberships } = await supabase
        .from('fridge_members')
        .select('fridge_id, role')
        .eq('user_id', userId);

      if (!memberships?.length) { setFridges([]); setLoading(false); return; }

      const fridgeIds = memberships.map(m => m.fridge_id);
      const { data: fridgeData } = await supabase
        .from('fridges')
        .select('*')
        .in('id', fridgeIds);

      if (fridgeData) {
        const enriched = fridgeData.map(f => ({
          ...f,
          role: memberships.find(m => m.fridge_id === f.id)?.role || 'member',
        }));
        setFridges(enriched);
        if (!activeFridgeId || !fridgeIds.includes(activeFridgeId)) {
          setActiveFridgeId(enriched[0]?.id || null);
        }
      }
    } catch (e) {
      console.error('Error fetching fridges:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchFridges(); }, [fetchFridges]);

  const createFridge = async (name: string) => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('fridges')
      .insert({ name, created_by: userId })
      .select()
      .single();

    if (error || !data) { console.error(error); return null; }

    // Owner membership handled by: the owner manages their own fridge
    // We need to insert ourselves as owner since RPC isn't used for creation
    await supabase.from('fridge_members').insert({
      fridge_id: data.id,
      user_id: userId,
      role: 'owner',
    });

    await fetchFridges();
    return data;
  };

  // SECURE: Uses RPC instead of direct insert (patched invite code bypass)
  const joinFridge = async (inviteCode: string): Promise<{ success: boolean; message: string }> => {
    if (!userId) return { success: false, message: 'Not signed in' };

    const { data, error } = await supabase.rpc('join_fridge_by_code', {
      invite_code_input: inviteCode.trim().toLowerCase(),
    });

    if (error) return { success: false, message: error.message };
    if (!data?.success) return { success: false, message: data?.message || 'Failed to join' };

    await fetchFridges();
    return { success: true, message: data.message };
  };

  const leaveFridge = async (fridgeId: string) => {
    if (!userId) return;
    // Works via "Members can leave fridge" policy: FOR DELETE USING (user_id = auth.uid())
    await supabase.from('fridge_members').delete().eq('fridge_id', fridgeId).eq('user_id', userId);
    await fetchFridges();
  };

  const deleteFridge = async (fridgeId: string) => {
    await supabase.from('fridges').delete().eq('id', fridgeId);
    await fetchFridges();
  };

  const renameFridge = async (fridgeId: string, name: string) => {
    await supabase.from('fridges').update({ name }).eq('id', fridgeId);
    await fetchFridges();
  };

  const getMembers = async (fridgeId: string) => {
    const { data } = await supabase
      .from('fridge_members')
      .select('user_id, role, joined_at')
      .eq('fridge_id', fridgeId);

    if (!data?.length) return [];

    const userIds = data.map(m => m.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);

    return data.map(m => ({
      ...m,
      name: profiles?.find(p => p.id === m.user_id)
        ? `${profiles.find(p => p.id === m.user_id)!.first_name} ${profiles.find(p => p.id === m.user_id)!.last_name}`
        : 'Unknown',
    }));
  };

  return {
    fridges, activeFridgeId, setActiveFridgeId, loading,
    createFridge, joinFridge, leaveFridge, deleteFridge, renameFridge, getMembers, fetchFridges,
  };
}
