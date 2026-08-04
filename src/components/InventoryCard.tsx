import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  urgency: 'EXPIRED' | 'EXPIRING_SOON' | 'FRESH';
  status?: 'ACTIVE' | 'CONSUMED' | 'TRASHED';
  quantity?: number;
  unit?: string;
  price?: number;
  image_url?: string;
  daysLeft?: number;
  expires_at?: string;
  expiresAt?: string;
  created_at?: string;
  fridge_id?: string;
  added_by?: string;
};

const urgencyConfig = {
  EXPIRED: { color: '#ef4444', label: 'Expired' },
  EXPIRING_SOON: { color: '#f59e0b', label: 'Use Soon' },
  FRESH: { color: '#10b981', label: 'Fresh' },
};

const categoryIconMap: Record<string, any> = {
  dairy: 'water', produce: 'leaf', meat: 'food-drumstick',
  pantry: 'package-variant', beverage: 'cup', other: 'food-apple',
};

export default function InventoryCard({ item, index = 0, onDelete, onUpdateExpiry, onMarkConsumed }: {
  item: InventoryItem;
  index?: number;
  onDelete?: (id: string) => void;
  onUpdateExpiry?: (id: string, expiresAt: string) => void;
  onMarkConsumed?: (id: string) => void;
}) {
  const [expiryModalVisible, setExpiryModalVisible] = useState(false);
  const [daysInput, setDaysInput] = useState('');

  const config = urgencyConfig[item.urgency] || urgencyConfig.FRESH;
  const iconName = categoryIconMap[item.category?.toLowerCase()] || 'food-apple';
  const daysText = item.daysLeft !== undefined
    ? item.daysLeft <= 0 ? 'Expired' : `${item.daysLeft}d left`
    : null;
  const qtyText = (item.quantity && item.quantity > 1) ? `${item.quantity} ${item.unit || 'items'}` : null;

  const handleSetExpiry = () => {
    const days = parseInt(daysInput);
    if (isNaN(days) || days < 0) { Alert.alert('Invalid', 'Enter a valid number of days'); return; }
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + days);
    onUpdateExpiry?.(item.id, newExpiry.toISOString());
    setExpiryModalVisible(false);
    setDaysInput('');
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={styles.category}>{(item.category || 'Other').charAt(0).toUpperCase() + (item.category || 'other').slice(1)}</Text>
            {qtyText && <Text style={{ color: '#64748b', fontSize: 12 }}> · {qtyText}</Text>}
            {daysText && (
              <TouchableOpacity onPress={() => onUpdateExpiry && setExpiryModalVisible(true)}>
                <Text style={[styles.daysLeft, { color: config.color }]}> · {daysText} {onUpdateExpiry ? '✏️' : ''}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={[styles.badge, { backgroundColor: `${config.color}20`, borderColor: config.color }]}>
            <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
          </View>
          {item.price ? <Text style={styles.price}>${item.price.toFixed(2)}</Text> : null}
        </View>

        <View style={{ flexDirection: 'column', gap: 4 }}>
          {onMarkConsumed && (
            <TouchableOpacity onPress={() => onMarkConsumed(item.id)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
              <MaterialCommunityIcons name="check-circle-outline" size={20} color="#059669" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={() => onDelete(item.id)} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal visible={expiryModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.expiryModal}>
            <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>Set Expiry</Text>
            <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>{item.name}</Text>
            <Text style={{ color: '#94a3b8', marginBottom: 8 }}>Expires in how many days?</Text>
            <TextInput style={styles.expiryInput} placeholder="e.g. 5" placeholderTextColor="#64748b" keyboardType="number-pad" value={daysInput} onChangeText={setDaysInput} autoFocus />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity style={[styles.expiryBtn, { backgroundColor: '#334155' }]} onPress={() => setExpiryModalVisible(false)}>
                <Text style={{ color: '#94a3b8', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.expiryBtn, { backgroundColor: '#059669' }]} onPress={handleSetExpiry}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Set</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {[1, 3, 7, 14, 30].map(d => (
                <TouchableOpacity key={d} style={styles.quickBtn} onPress={() => setDaysInput(d.toString())}>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>{d}d</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  productImage: { width: 52, height: 52, borderRadius: 12, marginRight: 14, backgroundColor: '#1e293b' },
  iconContainer: { width: 52, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14, backgroundColor: 'rgba(30, 41, 59, 0.8)' },
  content: { flex: 1 },
  name: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  category: { color: '#94a3b8', fontSize: 13 },
  daysLeft: { fontSize: 12, fontWeight: '600' },
  rightSection: { alignItems: 'flex-end', marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  price: { color: '#cbd5e1', fontSize: 13, marginTop: 6, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  expiryModal: { backgroundColor: '#1e293b', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340, borderWidth: 1, borderColor: '#334155' },
  expiryInput: { backgroundColor: '#0f172a', borderRadius: 12, padding: 14, color: '#f8fafc', borderWidth: 1, borderColor: '#334155', fontSize: 18, textAlign: 'center' },
  expiryBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  quickBtn: { backgroundColor: '#0f172a', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
});
