import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState<string>('Chef');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user?.id) fetchProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      } else {
        setProfileName('Chef');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', uid)
        .single();

      if (data) {
        const name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
        setProfileName(name || 'Chef');
      }
    } catch (e) {
      // Profile might not exist yet (first-time signup trigger)
      console.log('Profile fetch pending:', e);
    }
  };

  const userId = session?.user?.id || null;
  const userEmail = session?.user?.email || null;
  const userName = profileName;
  const isAuthenticated = !!session;

  return { session, userId, userEmail, userName, isAuthenticated, loading, refreshProfile: () => userId && fetchProfile(userId) };
}
