import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Fridge {
  id: string;
  name: string;
  created_by: string;
  invite_code: string;
  created_at: string;
  role?: string;
  memberCount?: number;
}

export function useFridges(userId: string | null) {
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [activeFridgeId, setActiveFridgeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFridges = useCallback(async () => {
    if (!userId) { setFridges([]); setLoading(false); return; }
    setLoading(true);
    try {
      // Get all fridges where user is a member
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
        // Auto-select first fridge if none selected
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

    // Add self as owner
    await supabase.from('fridge_members').insert({
      fridge_id: data.id,
      user_id: userId,
      role: 'owner',
    });

    await fetchFridges();
    return data;
  };

  const joinFridge = async (inviteCode: string): Promise<{ success: boolean; message: string }> => {
    if (!userId) return { success: false, message: 'Not signed in' };

    // Look up fridge by invite code
    const { data: fridge } = await supabase
      .from('fridges')
      .select('id, name')
      .eq('invite_code', inviteCode.trim().toLowerCase())
      .single();

    if (!fridge) return { success: false, message: 'Invalid invite code' };

    // Check if already a member
    const { data: existing } = await supabase
      .from('fridge_members')
      .select('id')
      .eq('fridge_id', fridge.id)
      .eq('user_id', userId)
      .single();

    if (existing) return { success: false, message: 'You are already a member of this fridge' };

    const { error } = await supabase.from('fridge_members').insert({
      fridge_id: fridge.id,
      user_id: userId,
      role: 'member',
    });

    if (error) return { success: false, message: error.message };

    await fetchFridges();
    return { success: true, message: `Joined "${fridge.name}" successfully!` };
  };

  const leaveFridge = async (fridgeId: string) => {
    if (!userId) return;
    await supabase
      .from('fridge_members')
      .delete()
      .eq('fridge_id', fridgeId)
      .eq('user_id', userId);
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

    // Get profile info for each member
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
    createFridge, joinFridge, leaveFridge, deleteFridge, renameFridge, getMembers,
    fetchFridges,
  };
}
