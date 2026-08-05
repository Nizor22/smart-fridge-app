import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
  count?: number;
  style?: 'card' | 'stat';
}

const { width } = Dimensions.get('window');

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 3, style = 'card' }) => {
  const translateX = useSharedValue(-width);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(width, {
        duration: 1200,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    return () => { translateX.value = -width; };
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const renderShimmer = () => (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );

  if (style === 'stat') {
    return (
      <View style={styles.statContainer}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.statBlock}>
            {renderShimmer()}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.line1} />
          <View style={styles.line2} />
          {renderShimmer()}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    height: 72,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  line1: {
    width: '60%',
    height: 16,
    backgroundColor: '#334155',
    borderRadius: 4,
  },
  line2: {
    width: '40%',
    height: 12,
    backgroundColor: '#334155',
    borderRadius: 4,
  },
  statContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBlock: {
    flex: 1,
    height: 80,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#334155',
    opacity: 0.4,
  },
});

export default SkeletonLoader;
