import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const filters = [
  { id: 'All', label: 'All Items' },
  { id: 'Expired', label: '🔴 Expired' },
  { id: 'Expiring', label: '🟡 Expiring' },
  { id: 'Fresh', label: '🟢 Fresh' },
  { id: 'Dairy', label: 'Dairy' },
  { id: 'Produce', label: 'Produce' },
  { id: 'Meat', label: 'Meat' },
];

const FilterPill = ({ filter, isActive, onPress }: { filter: any, isActive: boolean, onPress: () => void }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(isActive ? '#059669' : 'rgba(30, 41, 59, 0.8)', { duration: 200 }),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: withTiming(isActive ? '#ffffff' : '#94a3b8', { duration: 200 }),
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.pill, animatedStyle]}>
        <Animated.Text style={[styles.pillText, textStyle]}>{filter.label}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

const UrgencyFilter = memo(function UrgencyFilter({ active, onChange }: { active: string, onChange: (id: string) => void }) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filters.map((filter) => (
          <FilterPill 
            key={filter.id}
            filter={filter}
            isActive={active === filter.id}
            onPress={() => onChange(filter.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    gap: 10,
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

export default UrgencyFilter;
