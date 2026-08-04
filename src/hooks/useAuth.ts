import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id || null;
  const userEmail = session?.user?.email || null;
  const userName = session?.user?.user_metadata?.first_name
    ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name || ''}`
    : 'Chef';
  const isAuthenticated = !!session;

  return { session, userId, userEmail, userName, isAuthenticated, loading };
}
