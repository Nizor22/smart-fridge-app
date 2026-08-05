import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS, FadeInDown, Layout, FadeOutLeft } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 90;

export default function SwipeableInventoryCard({ item, index, onDelete, onConsume }: any) {
  const translateX = useSharedValue(0);

  const triggerHaptic = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => { translateX.value = event.translationX; })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 250 }, () => { runOnJS(onDelete)(item.id); });
      } else if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 250 }, () => { runOnJS(onConsume)(item.id); });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()} exiting={FadeOutLeft} layout={Layout.springify()} style={{ marginBottom: 10 }}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <Image source={{ uri: item.image_url }} style={styles.image} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
            <Text style={{ color: '#94A3B8', fontSize: 13 }}>{item.category}</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#172033', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  image: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#1E293B' },
});
