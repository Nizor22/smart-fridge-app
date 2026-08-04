import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lljudjuoawzigandmtal.supabase.co';
const supabaseAnonKey = 'sb_publishable_1bGjvIIf_ZlOhIkm9wUO_Q_gCxHodQy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}
