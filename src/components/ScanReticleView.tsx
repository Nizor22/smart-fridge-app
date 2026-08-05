import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function ScanReticleView({ status, mode }: { status: 'idle' | 'focusing' | 'success'; mode: 'Photo' | 'Barcode' }) {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (status === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      pulseScale.value = withTiming(1.12, { duration: 150 });
    } else {
      pulseScale.value = withRepeat(withSequence(withTiming(1.05, { duration: 700 }), withTiming(1.0, { duration: 700 })), -1, true);
    }
  }, [status]);

  const reticleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    borderColor: status === 'success' ? '#10B981' : '#FFFFFF',
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[styles.reticleBox, reticleAnimatedStyle]} />
      <Text style={styles.guideText}>{mode === 'Barcode' ? 'Align barcode inside reticle' : 'Center food item in frame'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  reticleBox: { width: 240, height: 240, borderWidth: 2, borderRadius: 16, borderColor: '#FFFFFF' },
  guideText: { color: '#F8FAFC', fontSize: 14, marginTop: 20, backgroundColor: 'rgba(15, 23, 42, 0.75)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
});
