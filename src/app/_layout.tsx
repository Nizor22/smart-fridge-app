import { Stack } from 'expo-router';
import { FridgeProvider } from '../context/FridgeContext';
import '../global.css';

export default function RootLayout() {
  return (
    <FridgeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </FridgeProvider>
  );
}
