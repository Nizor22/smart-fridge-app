import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

export function useVoiceShortcuts() {
  const router = useRouter();

  useEffect(() => {
    Linking.getInitialURL().then(url => { if (url) handleUrl(url); });
    const sub = Linking.addEventListener('url', evt => handleUrl(evt.url));
    return () => sub.remove();
  }, []);

  const handleUrl = (url: string) => {
    const parsed = Linking.parse(url);
    if (parsed.path === 'intent/add-item') router.push('/(tabs)');
  };
}
