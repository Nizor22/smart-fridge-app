import { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import InventoryCard, { InventoryItem } from '../../components/InventoryCard';
import UrgencyFilter from '../../components/UrgencyFilter';
import CameraScanner from '../../components/CameraScanner';
import { supabase } from '../../lib/supabase';

export default function DashboardScreen() {
  const [filter, setFilter] = useState('All');
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        // Fallback to local state if table doesn't exist yet
        console.error('Supabase fetch error (table might not exist):', error);
      } else if (data) {
        setInventory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (scannedItem: any) => {
    const newItem = {
      name: scannedItem.name || 'Unknown Food',
      category: scannedItem.category || 'Other',
      urgency: scannedItem.urgency || 'FRESH',
      price: scannedItem.price || 0,
    };
    
    // Optimistic update
    const tempId = Math.random().toString();
    setInventory(prev => [{ ...newItem, id: tempId }, ...prev]);

    // Insert into Supabase
    const { error } = await supabase.from('inventory').insert([newItem]);
    
    if (error) {
      console.error('Insert error:', error);
      alert('Failed to save to database. Is the inventory table created in Supabase?');
    } else {
      // Refresh to get real ID
      fetchInventory();
    }
  };

  const filteredData = inventory.filter(item => {
    if (filter === 'All') return true;
    if (filter.includes('Eat Now') && item.urgency === 'EAT_NOW') return true;
    if (filter.includes('Use Soon') && item.urgency === 'USE_SOON') return true;
    if (filter.includes('Fresh') && item.urgency === 'FRESH') return true;
    if (filter === item.category) return true;
    return false;
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        <Text className="text-3xl font-bold text-foreground mb-4">FreshGuard Dashboard</Text>
        <View>
          <UrgencyFilter active={filter} onChange={setFilter} />
        </View>
        
        {loading && inventory.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={item => item.id || Math.random().toString()}
            renderItem={({ item }) => <InventoryCard item={item} />}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center mt-20">
                <Text className="text-lg text-muted">Your fridge is empty!</Text>
                <Text className="text-md text-muted mt-2">Tap the camera button to scan items.</Text>
              </View>
            )}
          />
        )}

        <TouchableOpacity 
          onPress={() => setIsScannerVisible(true)}
          className="absolute bottom-6 right-6 bg-primary w-16 h-16 rounded-full justify-center items-center shadow-lg elevation-5"
        >
          <MaterialCommunityIcons name="camera" size={30} color="white" />
        </TouchableOpacity>

        <Modal visible={isScannerVisible} animationType="slide">
          <CameraScanner 
            onClose={() => setIsScannerVisible(false)} 
            onScanSuccess={handleScanSuccess}
          />
        </Modal>
      </View>
    </SafeAreaView>
  );
}
