import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  urgency: 'EAT_NOW' | 'USE_SOON' | 'FRESH';
  price?: number;
  imageUrl?: string;
};

const urgencyConfig = {
  EAT_NOW: { color: '#ef4444', label: 'Eat Now', shadowColor: '#ef4444' }, // red-500
  USE_SOON: { color: '#f59e0b', label: 'Use Soon', shadowColor: '#f59e0b' }, // amber-500
  FRESH: { color: '#10b981', label: 'Fresh', shadowColor: '#10b981' }, // emerald-500
};

const categoryIconMap: Record<string, any> = {
  dairy: 'water',
  produce: 'leaf',
  meat: 'food-drumstick',
  pantry: 'package-variant',
  beverage: 'cup',
  other: 'food-apple',
};

export default function InventoryCard({ item, index, onPress }: { item: InventoryItem; index: number; onPress?: () => void }) {
  const config = urgencyConfig[item.urgency] || urgencyConfig.FRESH;
  const iconName = categoryIconMap[item.category.toLowerCase()] || 'food-apple';

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <Pressable onPress={onPress}>
        <View style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(30, 41, 59, 0.8)' }]}>
            <MaterialCommunityIcons name={iconName} size={28} color="#94a3b8" />
          </View>
          
          <View style={styles.content}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.category}>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</Text>
          </View>

          <View style={styles.rightSection}>
            <View 
              style={[
                styles.badge, 
                { backgroundColor: `${config.color}20`, borderColor: config.color, shadowColor: config.shadowColor }
              ]}
            >
              <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
            </View>
            {item.price && (
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)', // dark transparent slate
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  name: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    color: '#94a3b8',
    fontSize: 13,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  price: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
});
