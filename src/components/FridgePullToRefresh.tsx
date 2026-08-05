import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const PULL_THRESHOLD = 80;

export default function FridgePullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<void>; children: React.ReactNode }) {
  const pullY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);
  const spinValue = useSharedValue(0);

  const executeRefresh = async () => {
    try { await onRefresh(); } finally {
      pullY.value = withSpring(0);
      isRefreshing.value = false;
      spinValue.value = 0;
    }
  };

  const startRefresh = () => {
    'worklet';
    isRefreshing.value = true;
    spinValue.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1, false);
    runOnJS(executeRefresh)();
  };

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (event.translationY > 0 && !isRefreshing.value) {
        pullY.value = Math.min(event.translationY * 0.5, PULL_THRESHOLD + 20);
      }
    })
    .onEnd(() => {
      if (pullY.value >= PULL_THRESHOLD && !isRefreshing.value) {
        pullY.value = withSpring(PULL_THRESHOLD);
        startRefresh();
      } else if (!isRefreshing.value) {
        pullY.value = withSpring(0);
      }
    });

  const pullContainerStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pullY.value }] }));

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{ flex: 1 }, pullContainerStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
