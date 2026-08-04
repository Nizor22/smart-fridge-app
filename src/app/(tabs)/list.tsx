import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

interface ListItem {
  id: string;
  name: string;
  purchased: boolean;
}

export default function GroceryListScreen() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [filter, setFilter] = useState<'to_buy' | 'purchased'>('to_buy');
  const [newItemName, setNewItemName] = useState('');

  const filteredItems = items.filter(item => 
    filter === 'to_buy' ? !item.purchased : item.purchased
  );

  const addItem = () => {
    if (newItemName.trim()) {
      setItems([{ id: Date.now().toString(), name: newItemName.trim(), purchased: false }, ...items]);
      setNewItemName('');
    }
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }} edges={['top', 'left', 'right']}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#f8fafc', fontSize: 28, fontWeight: 'bold' }}>Grocery List</Text>
          <View style={{ backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
            <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{items.filter(i => !i.purchased).length} Items</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 20, backgroundColor: '#1e293b', borderRadius: 8, padding: 4 }}>
          {(['to_buy', 'purchased'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={{ flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: filter === tab ? '#334155' : 'transparent', borderRadius: 6 }}
              onPress={() => setFilter(tab)}
            >
              <Text style={{ color: filter === tab ? '#f8fafc' : '#94a3b8', fontWeight: '600' }}>
                {tab === 'to_buy' ? 'To Buy' : 'Purchased'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <Animated.View 
            entering={FadeInDown.delay(index * 50)} 
            exiting={FadeOut}
            style={[styles.itemCard, styles.shadow]}
          >
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
              onPress={() => toggleItem(item.id)}
            >
              <MaterialCommunityIcons 
                name={item.purchased ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                size={24} 
                color={item.purchased ? "#059669" : "#64748b"} 
              />
              <Text style={{ marginLeft: 12, color: item.purchased ? '#64748b' : '#f8fafc', fontSize: 16, textDecorationLine: item.purchased ? 'line-through' : 'none' }}>
                {item.name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteItem(item.id)}>
              <MaterialCommunityIcons name="delete-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <MaterialCommunityIcons name="cart-outline" size={64} color="#334155" />
            <Text style={{ color: '#94a3b8', marginTop: 16, fontSize: 16 }}>
              {filter === 'to_buy' ? 'Your list is empty.' : 'No purchased items yet.'}
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add new item..."
          placeholderTextColor="#64748b"
          value={newItemName}
          onChangeText={setNewItemName}
          onSubmitEditing={addItem}
        />
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    paddingHorizontal: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#059669',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
