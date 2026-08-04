import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export interface Fridge {
  id: string;
  name: string;
  created_by: string | null;
  invite_code: string;
  created_at: string;
  role?: string;
}

interface FridgeContextType {
  fridges: Fridge[];
  activeFridgeId: string | null;
  setActiveFridgeId: (id: string | null) => void;
  loading: boolean;
  createFridge: (name: string) => Promise<Fridge | null>;
  joinFridge: (code: string) => Promise<{ success: boolean; message: string }>;
  leaveFridge: (id: string) => Promise<void>;
  deleteFridge: (id: string) => Promise<void>;
  renameFridge: (id: string, name: string) => Promise<void>;
  getMembers: (id: string) => Promise<any[]>;
  fetchFridges: () => Promise<void>;
}

const FridgeContext = createContext<FridgeContextType>({
  fridges: [],
  activeFridgeId: null,
  setActiveFridgeId: () => {},
  loading: true,
  createFridge: async () => null,
  joinFridge: async () => ({ success: false, message: '' }),
  leaveFridge: async () => {},
  deleteFridge: async () => {},
  renameFridge: async () => {},
  getMembers: async () => [],
  fetchFridges: async () => {},
});

export function FridgeProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [activeFridgeId, setActiveFridgeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const activeFridgeRef = useRef<string | null>(null);

  useEffect(() => { activeFridgeRef.current = activeFridgeId; }, [activeFridgeId]);

  const fetchFridges = useCallback(async () => {
    if (!userId) { setFridges([]); setLoading(false); return; }
    setLoading(true);
    try {
      const { data: memberships } = await supabase
        .from('fridge_members')
        .select('fridge_id, role')
        .eq('user_id', userId);

      if (!memberships?.length) {
        setFridges([]);
        setActiveFridgeId(null);
        setLoading(false);
        return;
      }

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

        const currentActive = activeFridgeRef.current;
        if (!currentActive || !fridgeIds.includes(currentActive)) {
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

    await supabase.from('fridge_members').insert({
      fridge_id: data.id,
      user_id: userId,
      role: 'owner',
    });

    await fetchFridges();
    setActiveFridgeId(data.id);
    return data;
  };

  const joinFridge = async (inviteCode: string) => {
    if (!userId) return { success: false, message: 'Not signed in' };
    const { data, error } = await supabase.rpc('join_fridge_by_code', {
      invite_code_input: inviteCode.trim().toLowerCase(),
    });
    if (error) return { success: false, message: error.message };
    if (!data?.success) return { success: false, message: data?.message || 'Failed to join' };
    await fetchFridges();
    if (data.fridge_id) setActiveFridgeId(data.fridge_id);
    return { success: true, message: data.message };
  };

  const leaveFridge = async (fridgeId: string) => {
    if (!userId) return;
    await supabase.from('fridge_members').delete().eq('fridge_id', fridgeId).eq('user_id', userId);
    if (activeFridgeRef.current === fridgeId) setActiveFridgeId(null);
    await fetchFridges();
  };

  const deleteFridge = async (fridgeId: string) => {
    await supabase.from('fridges').delete().eq('id', fridgeId);
    if (activeFridgeRef.current === fridgeId) setActiveFridgeId(null);
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

    const userIds = data.map(m => m.user_id).filter(Boolean);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);

    return data.map(m => {
      const profile = profiles?.find(p => p.id === m.user_id);
      return {
        ...m,
        name: profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown'
          : 'Former Member',
      };
    });
  };

  return (
    <FridgeContext.Provider value={{
      fridges, activeFridgeId, setActiveFridgeId, loading,
      createFridge, joinFridge, leaveFridge, deleteFridge, renameFridge, getMembers, fetchFridges,
    }}>
      {children}
    </FridgeContext.Provider>
  );
}

export function useFridgeContext() {
  return useContext(FridgeContext);
}
