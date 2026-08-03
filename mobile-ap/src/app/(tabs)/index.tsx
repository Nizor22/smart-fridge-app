import { useState } from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import InventoryCard, { InventoryItem } from '../../components/InventoryCard';
import UrgencyFilter from '../../components/UrgencyFilter';
import CameraScanner from '../../components/CameraScanner';

const mockData: InventoryItem[] = [
  { id: '1', name: 'Organic Milk', category: 'Dairy', urgency: 'USE_SOON', price: 4.99 },
  { id: '2', name: 'Spinach', category: 'Produce', urgency: 'EAT_NOW', price: 2.99 },
  { id: '3', name: 'Chicken Breast', category: 'Meat', urgency: 'FRESH', price: 8.50 },
];

export default function DashboardScreen() {
  const [filter, setFilter] = useState('All');
  const [isScannerVisible, setIsScannerVisible] = useState(false);

  const filteredData = mockData.filter(item => {
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
        
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <InventoryCard item={item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity 
          onPress={() => setIsScannerVisible(true)}
          className="absolute bottom-6 right-6 bg-primary w-16 h-16 rounded-full justify-center items-center shadow-lg elevation-5"
        >
          <MaterialCommunityIcons name="camera" size={30} color="white" />
        </TouchableOpacity>

        <Modal visible={isScannerVisible} animationType="slide">
          <CameraScanner onClose={() => setIsScannerVisible(false)} />
        </Modal>
      </View>
    </SafeAreaView>
  );
}
