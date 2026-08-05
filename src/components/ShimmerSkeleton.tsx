import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, interpolate } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ShimmerSkeleton({ count = 3 }: { count?: number }) {
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.bezier(0.4, 0, 0.6, 1) }), -1, false);
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerProgress.value, [0, 1], [-SCREEN_WIDTH, SCREEN_WIDTH]);
    return { transform: [{ translateX }] };
  });

  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.cardBox}>
          <View style={styles.avatarPlaceholder} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.lineLong} />
            <View style={styles.lineShort} />
          </View>
          <Animated.View style={[styles.shimmerBeam, shimmerStyle]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cardBox: { height: 72, backgroundColor: '#172033', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#1E293B' },
  lineLong: { width: '65%', height: 14, backgroundColor: '#1E293B', borderRadius: 4, marginBottom: 8 },
  lineShort: { width: '40%', height: 10, backgroundColor: '#1E293B', borderRadius: 4 },
  shimmerBeam: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
});
