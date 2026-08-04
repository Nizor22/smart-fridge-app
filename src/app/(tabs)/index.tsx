import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, withRepeat, withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { supabase, getCurrentUserId } from '../../lib/supabase';
import UrgencyFilter from '../../components/UrgencyFilter';
import InventoryCard, { InventoryItem } from '../../components/InventoryCard';
import CameraScanner from '../../components/CameraScanner';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function DashboardScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const pulseValue = useSharedValue(1);

  useEffect(() => {
    pulseValue.value = withRepeat(withTiming(1.1, { duration: 1000 }), -1, true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const uid = await getCurrentUserId();
    setUserId(uid);
    if (uid) fetchItems(uid);
    else { setItems([]); setLoading(false); }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (uid) fetchItems(uid);
      else { setItems([]); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const fetchItems = async (uid?: string) => {
    const id = uid || userId;
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase.from('inventory').select('*').eq('user_id', id).order('created_at', { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const expiringSoon = items.filter(i => i.urgency === 'EAT_NOW' || i.urgency === 'USE_SOON').length;
  const moneySaved = items.reduce((sum, i) => sum + (i.price || 0), 0);

  const handleScanSuccess = async (scannedItems: any[]) => {
    setIsScannerVisible(false);
    if (!userId) {
      Alert.alert('Sign In Required', 'Please sign in to save scanned items to your fridge.', [
        { text: 'OK', onPress: () => router.push('/settings') }
      ]);
      return;
    }
    const newItems = scannedItems.map(item => ({
      name: item.name || 'Unknown',
      category: item.category || 'Other',
      urgency: item.urgency || 'FRESH',
      price: item.price || 0,
      image_url: item.image_url || null,
      user_id: userId,
    }));
    setItems(prev => [...newItems.map((item, i) => ({ ...item, id: `temp-${Date.now()}-${i}` })), ...prev]);
    await supabase.from('inventory').insert(newItems);
    fetchItems();
  };

  const handleDeleteItem = async (id: string) => {
    Alert.alert('Remove Item', 'Remove this item from your fridge?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        setItems(prev => prev.filter(i => i.id !== id));
        await supabase.from('inventory').delete().eq('id', id);
      }}
    ]);
  };

  const filteredData = items.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter.includes('Eat Now') && item.urgency === 'EAT_NOW') return true;
    if (activeFilter.includes('Use Soon') && item.urgency === 'USE_SOON') return true;
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <View>
                    <Text style={{ color: '#94a3b8', fontSize: 14 }}>{getGreeting()},</Text>
                    <Text style={{ color: '#f8fafc', fontSize: 24, fontWeight: 'bold' }}>Chef</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/settings')} style={styles.avatarBtn}>
                    <MaterialCommunityIcons name="account" size={24} color="#f8fafc" />
                  </TouchableOpacity>
                </View>

                {!userId && (
                  <TouchableOpacity style={styles.authBanner} onPress={() => router.push('/settings')}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#f59e0b" />
                    <Text style={{ color: '#f59e0b', marginLeft: 8, flex: 1 }}>Sign in to save your scanned items</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#f59e0b" />
                  </TouchableOpacity>
                )}

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
              </Animated.View>
              <View style={{ marginBottom: 16 }}>
                <UrgencyFilter active={activeFilter} onChange={setActiveFilter} />
              </View>
            </>
          }
          renderItem={({ item, index }) => (
            <InventoryCard item={item} index={index} onDelete={handleDeleteItem} />
          )}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <MaterialCommunityIcons name="fridge-outline" size={64} color="#334155" />
              <Text style={{ color: '#94a3b8', marginTop: 16, fontSize: 16 }}>
                {userId ? 'Your fridge is empty' : 'Sign in to see your fridge'}
              </Text>
              <Text style={{ color: '#64748b', marginTop: 4 }}>Tap the camera to scan items</Text>
            </View>
          }
        />
      </View>

      <AnimatedTouchable style={[styles.fab, pulseStyle, styles.shadow]} onPress={() => setIsScannerVisible(true)}>
        <MaterialCommunityIcons name="camera-plus" size={28} color="#ffffff" />
      </AnimatedTouchable>

      <Modal visible={isScannerVisible} animationType="slide">
        <CameraScanner onClose={() => setIsScannerVisible(false)} onScanSuccess={handleScanSuccess} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  glassCard: { backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  authBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)' },
  fab: { position: 'absolute', bottom: 80, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center' },
  shadow: { shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
});
