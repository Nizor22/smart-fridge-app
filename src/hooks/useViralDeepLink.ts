// src/hooks/useViralDeepLink.ts
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

export function useViralDeepLink() {
  useEffect(() => {
    Linking.getInitialURL().then(url => { if (url) claim(url); });
  }, []);

  const claim = async (url: string) => {
    const parsed = Linking.parse(url);
    if (parsed.queryParams?.code) {
      await supabase.rpc('process_referral_reward', { p_invite_code: parsed.queryParams.code });
    }
  };
}
