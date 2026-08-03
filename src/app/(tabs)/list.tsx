import { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function ListScreen() {
  const [groceryList, setGroceryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('grocery_list').select('*').order('created_at', { ascending: false });
      if (!error && data) setGroceryList(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const togglePurchased = async (id: string, currentStatus: boolean) => {
    setGroceryList(prev => prev.map(item => item.id === id ? { ...item, is_purchased: !currentStatus } : item));
    await supabase.from('grocery_list').update({ is_purchased: !currentStatus }).eq('id', id);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        <Text className="text-3xl font-bold text-foreground mb-4">Smart Grocery List</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#059669" />
        ) : (
          <FlatList
            data={groceryList}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => togglePurchased(item.id, item.is_purchased)}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-slate-100 flex-row items-center"
              >
                <MaterialCommunityIcons 
                  name={item.is_purchased ? "check-circle" : "circle-outline"} 
                  size={28} 
                  color={item.is_purchased ? "#059669" : "#94a3b8"} 
                />
                <Text className={`text-xl ml-4 font-bold ${item.is_purchased ? 'text-muted line-through' : 'text-foreground'}`}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center mt-20">
                <Text className="text-lg text-muted">Your grocery list is empty!</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
