import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, withRepeat, withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useInventory } from '../../hooks/useInventory';
import { useFridges } from '../../hooks/useFridges';
import UrgencyFilter from '../../components/UrgencyFilter';
import InventoryCard from '../../components/InventoryCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import CameraScanner from '../../components/CameraScanner';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function DashboardScreen() {
  const { userId, userName, isAuthenticated } = useAuth();
  const { fridges, activeFridgeId, setActiveFridgeId } = useFridges(userId);
  const { items, loading, isOffline, addItems, deleteItem, consumeItem, updateExpiry } = useInventory(userId, activeFridgeId);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [fridgePickerVisible, setFridgePickerVisible] = useState(false);
  const router = useRouter();

  const pulseValue = useSharedValue(1);
  React.useEffect(() => {
    pulseValue.value = withRepeat(withTiming(1.1, { duration: 1000 }), -1, true);
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseValue.value }] }));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const expiringSoon = items.filter(i => i.urgency === 'EXPIRED' || i.urgency === 'EXPIRING_SOON').length;
  const moneySaved = items.reduce((sum, i) => sum + (i.price || 0), 0);
  const activeFridge = fridges.find(f => f.id === activeFridgeId);

  const handleScanSuccess = async (scannedItems: any[]) => {
    setIsScannerVisible(false);
    if (!userId) {
      Alert.alert('Sign In Required', 'Please sign in to save scanned items.', [
        { text: 'OK', onPress: () => router.push('/settings') }
      ]);
      return;
    }
    if (!activeFridgeId) {
      Alert.alert('No Fridge', 'Create a fridge first in Settings.');
      return;
    }
    await addItems(scannedItems);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert('Remove Item', 'What happened to this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Used It', onPress: () => consumeItem(id) },
      { text: 'Trashed', style: 'destructive', onPress: () => deleteItem(id) }
    ]);
  };

  const filteredData = items.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter.includes('Expired') && item.urgency === 'EXPIRED') return true;
    if (activeFilter.includes('Expiring') && item.urgency === 'EXPIRING_SOON') return true;
    if (activeFilter.includes('Fresh') && item.urgency === 'FRESH') return true;
    if (activeFilter === item.category) return true;
    return false;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }} edges={['top', 'left', 'right']}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        <FlatList
          data={filteredData}
          ListHeaderComponent={
            <>
              <Animated.View entering={FadeInDown.delay(100).duration(500)} style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <View>
                    <Text style={{ color: '#94a3b8', fontSize: 14 }}>{getGreeting()},</Text>
                    <Text style={{ color: '#f8fafc', fontSize: 24, fontWeight: 'bold' }}>{userName}</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/settings')} style={styles.avatarBtn}>
                    <MaterialCommunityIcons name="account" size={24} color="#f8fafc" />
                  </TouchableOpacity>
                </View>

                {isAuthenticated && fridges.length > 0 && (
                  <TouchableOpacity style={styles.fridgeSelector} onPress={() => setFridgePickerVisible(true)}>
                    <MaterialCommunityIcons name="fridge-outline" size={18} color="#059669" />
                    <Text style={{ color: '#f8fafc', fontWeight: '600', marginLeft: 8, flex: 1 }}>
                      {activeFridge?.name || 'My Fridge'}
                    </Text>
                    {fridges.length > 1 && <MaterialCommunityIcons name="chevron-down" size={18} color="#94a3b8" />}
                  </TouchableOpacity>
                )}

                {!isAuthenticated && (
                  <TouchableOpacity style={styles.authBanner} onPress={() => router.push('/settings')}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#f59e0b" />
                    <Text style={{ color: '#f59e0b', marginLeft: 8, flex: 1 }}>Sign in to save your items</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#f59e0b" />
                  </TouchableOpacity>
                )}

                {isOffline && (
                  <View style={styles.offlineBanner}>
                    <MaterialCommunityIcons name="wifi-off" size={16} color="#94a3b8" />
                    <Text style={{ color: '#94a3b8', marginLeft: 8, fontSize: 12 }}>Offline — showing cached data</Text>
                  </View>
                )}

                {loading ? <SkeletonLoader style="stat" /> : (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {[
                      { label: 'Total', value: items.length.toString(), icon: 'format-list-bulleted' },
                      { label: 'Expiring', value: expiringSoon.toString(), icon: 'alert-circle-outline' },
                      { label: 'Saved', value: `$${moneySaved.toFixed(0)}`, icon: 'currency-usd' }
                    ].map((stat, idx) => (
                      <View key={idx} style={[styles.glassCard, { flex: 1, marginHorizontal: 4, padding: 12, alignItems: 'center' }]}>
                        <MaterialCommunityIcons name={stat.icon as any} size={20} color="#059669" />
                        <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>{stat.value}</Text>
                        <Text style={{ color: '#94a3b8', fontSize: 12 }}>{stat.label}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Animated.View>
              <View style={{ marginBottom: 16 }}>
                <UrgencyFilter active={activeFilter} onChange={setActiveFilter} />
              </View>
            </>
          }
          renderItem={({ item, index }) => (
            <InventoryCard item={item} index={index} onDelete={handleDeleteItem} onUpdateExpiry={updateExpiry} onMarkConsumed={consumeItem} />
          )}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            loading ? <SkeletonLoader count={4} style="card" /> : (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <MaterialCommunityIcons name="fridge-outline" size={64} color="#334155" />
                <Text style={{ color: '#94a3b8', marginTop: 16, fontSize: 16 }}>{isAuthenticated ? 'Your fridge is empty' : 'Sign in to see your fridge'}</Text>
                <Text style={{ color: '#64748b', marginTop: 4 }}>Tap the camera to scan items</Text>
              </View>
            )
          }
        />
      </View>

      <AnimatedTouchable style={[styles.fab, pulseStyle, styles.shadow]} onPress={() => setIsScannerVisible(true)}>
        <MaterialCommunityIcons name="camera-plus" size={28} color="#ffffff" />
      </AnimatedTouchable>

      <Modal visible={isScannerVisible} animationType="slide">
        <CameraScanner onClose={() => setIsScannerVisible(false)} onScanSuccess={handleScanSuccess} />
      </Modal>

      <Modal visible={fridgePickerVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setFridgePickerVisible(false)}>
          <View style={styles.pickerCard}>
            <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Select Fridge</Text>
            {fridges.map(fridge => (
              <TouchableOpacity key={fridge.id} style={[styles.pickerItem, fridge.id === activeFridgeId && styles.pickerItemActive]}
                onPress={() => { setActiveFridgeId(fridge.id); setFridgePickerVisible(false); }}>
                <MaterialCommunityIcons name="fridge-outline" size={20} color={fridge.id === activeFridgeId ? '#059669' : '#94a3b8'} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: '#f8fafc', fontWeight: '600' }}>{fridge.name}</Text>
                  <Text style={{ color: '#64748b', fontSize: 12 }}>{fridge.role === 'owner' ? 'Owner' : 'Member'}</Text>
                </View>
                {fridge.id === activeFridgeId && <MaterialCommunityIcons name="check-circle" size={20} color="#059669" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => { setFridgePickerVisible(false); router.push('/settings'); }}>
              <Text style={{ color: '#059669', fontWeight: '600' }}>Manage Fridges →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  glassCard: { backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  fridgeSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  authBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)' },
  offlineBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(148, 163, 184, 0.1)', borderRadius: 8, padding: 8, marginBottom: 12 },
  fab: { position: 'absolute', bottom: 80, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center' },
  shadow: { shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  pickerCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#334155' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 8 },
  pickerItemActive: { backgroundColor: 'rgba(5, 150, 105, 0.1)', borderWidth: 1, borderColor: 'rgba(5, 150, 105, 0.3)' },
});
