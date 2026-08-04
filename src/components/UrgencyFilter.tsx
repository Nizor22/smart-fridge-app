import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';

const filters = [
  { id: 'ALL', label: 'All Items' },
  { id: 'EAT_NOW', label: 'Eat Now' },
  { id: 'USE_SOON', label: 'Use Soon' },
  { id: 'FRESH', label: 'Fresh' },
];

const FilterPill = ({ filter, isActive, onPress }: { filter: any, isActive: boolean, onPress: () => void }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(isActive ? '#059669' : 'rgba(30, 41, 59, 0.8)', { duration: 200 }),
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(isActive ? '#ffffff' : '#94a3b8', { duration: 200 }),
    };
  });

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.pill, animatedStyle]}>
        <Animated.Text style={[styles.pillText, textStyle]}>{filter.label}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export default function UrgencyFilter({ activeFilter, onFilterChange }: { activeFilter: string, onFilterChange: (id: string) => void }) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filters.map((filter) => (
          <FilterPill 
            key={filter.id}
            filter={filter}
            isActive={activeFilter === filter.id}
            onPress={() => onFilterChange(filter.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
