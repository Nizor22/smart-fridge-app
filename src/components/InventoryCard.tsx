import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  urgency: 'EAT_NOW' | 'USE_SOON' | 'FRESH';
  price?: number;
  image_url?: string;
};

const urgencyConfig = {
  EAT_NOW: { color: '#ef4444', label: 'Eat Now' },
  USE_SOON: { color: '#f59e0b', label: 'Use Soon' },
  FRESH: { color: '#10b981', label: 'Fresh' },
};

const categoryIconMap: Record<string, any> = {
  dairy: 'water',
  produce: 'leaf',
  meat: 'food-drumstick',
  pantry: 'package-variant',
  beverage: 'cup',
  other: 'food-apple',
};

export default function InventoryCard({ item, index = 0, onDelete }: { item: InventoryItem; index?: number; onDelete?: (id: string) => void }) {
  const config = urgencyConfig[item.urgency] || urgencyConfig.FRESH;
  const iconName = categoryIconMap[item.category?.toLowerCase()] || 'food-apple';

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <View style={styles.card}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.productImage} />
        ) : (
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={iconName} size={28} color="#94a3b8" />
          </View>
        )}
        
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.category}>{(item.category || 'Other').charAt(0).toUpperCase() + (item.category || 'other').slice(1)}</Text>
        </View>

        <View style={styles.rightSection}>
          <View style={[styles.badge, { backgroundColor: `${config.color}20`, borderColor: config.color }]}>
            <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
          </View>
          {item.price ? <Text style={styles.price}>${item.price.toFixed(2)}</Text> : null}
        </View>

        {onDelete && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="close-circle" size={22} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  productImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#1e293b',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  content: { flex: 1 },
  name: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  category: { color: '#94a3b8', fontSize: 13 },
  rightSection: { alignItems: 'flex-end', marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  price: { color: '#cbd5e1', fontSize: 13, marginTop: 6, fontWeight: '500' },
  deleteBtn: { padding: 4 },
});
