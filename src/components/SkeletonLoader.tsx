import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
  count?: number;
  style?: 'card' | 'stat';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 3, style = 'card' }) => {
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 1300, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
      -1,
      false
    );
    return () => { shimmerProgress.value = 0; };
  }, [shimmerProgress]);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerProgress.value, [0, 1], [-SCREEN_WIDTH, SCREEN_WIDTH]);
    return { transform: [{ translateX }] };
  });

  if (style === 'stat') {
    return (
      <View style={styles.statContainer}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.statBlock}>
            <View style={styles.statIcon} />
            <View style={styles.statValue} />
            <View style={styles.statLabel} />
            <Animated.View style={[styles.shimmerBeam, shimmerStyle]} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.avatarPlaceholder} />
          <View style={styles.textGroup}>
            <View style={styles.lineLong} />
            <View style={styles.lineShort} />
          </View>
          <View style={styles.badgePlaceholder} />
          <Animated.View style={[styles.shimmerBeam, shimmerStyle]} />
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
    backgroundColor: '#172033',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1e293b',
  },
  textGroup: {
    flex: 1,
    marginLeft: 12,
  },
  lineLong: {
    width: '65%',
    height: 14,
    backgroundColor: '#1e293b',
    borderRadius: 6,
    marginBottom: 8,
  },
  lineShort: {
    width: '40%',
    height: 10,
    backgroundColor: '#1e293b',
    borderRadius: 4,
  },
  badgePlaceholder: {
    width: 56,
    height: 22,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    marginLeft: 8,
  },
  statContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statBlock: {
    flex: 1,
    height: 80,
    backgroundColor: '#172033',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    marginBottom: 8,
  },
  statValue: {
    width: 32,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    width: 40,
    height: 10,
    borderRadius: 4,
    backgroundColor: '#1e293b',
  },
  shimmerBeam: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
});

export default SkeletonLoader;
