import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { useGroceryList } from '../../hooks/useGroceryList';
import { useFridgeContext } from '../../context/FridgeContext';
import { useFocusEffect } from 'expo-router';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function GroceryListScreen() {
  const { userId, isAuthenticated } = useAuth();
  const { fridges, activeFridgeId, setActiveFridgeId } = useFridgeContext();
  const { items, loading, isOffline, addItem, toggleItem, deleteItem, fetchList } = useGroceryList(userId, activeFridgeId);
  const [filter, setFilter] = useState<'to_buy' | 'purchased'>('to_buy');
  const [newItemName, setNewItemName] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { fetchList(); }, [fetchList]));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchList();
    setRefreshing(false);
  }, [fetchList]);

  const handleAdd = () => {
    if (!isAuthenticated) { Alert.alert('Sign In Required', 'Please sign in to save grocery items.'); return; }
    if (!activeFridgeId) { Alert.alert('No Fridge', 'Create a fridge first in Settings.'); return; }
    addItem(newItemName);
    setNewItemName('');
  };

  const filteredItems = useMemo(() => items.filter(i => filter === 'to_buy' ? !i.is_purchased : i.is_purchased), [items, filter]);
  const toBuyCount = useMemo(() => items.filter(i => !i.is_purchased).length, [items]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }} edges={['top', 'left', 'right']}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: '#f8fafc', fontSize: 28, fontWeight: 'bold' }}>Grocery List</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isOffline && <MaterialCommunityIcons name="wifi-off" size={16} color="#94a3b8" style={{ marginRight: 8 }} />}
            <View style={{ backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{toBuyCount} Items</Text>
            </View>
          </View>
        </View>

        {/* Fridge Selector */}
        {fridges.length > 0 && (
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#334155' }}
            onPress={() => {
              const buttons = fridges.map(f => ({
                text: `${f.name}${f.id === activeFridgeId ? ' ✓' : ''}`,
                onPress: () => setActiveFridgeId(f.id),
              }));
              buttons.push({ text: 'Cancel', onPress: () => {} });
              Alert.alert('Select Fridge', 'Choose which fridge\'s grocery list to view:', buttons);
            }}
          >
            <MaterialCommunityIcons name="fridge-outline" size={18} color="#059669" />
            <Text style={{ color: '#f8fafc', fontWeight: '600', marginLeft: 8, flex: 1 }}>
              {fridges.find(f => f.id === activeFridgeId)?.name || 'Select Fridge'}
            </Text>
            {fridges.length > 1 && <MaterialCommunityIcons name="chevron-down" size={18} color="#94a3b8" />}
          </TouchableOpacity>
        )}

        <View style={{ flexDirection: 'row', marginBottom: 20, backgroundColor: '#1e293b', borderRadius: 8, padding: 4 }}>
          {(['to_buy', 'purchased'] as const).map(tab => (
            <TouchableOpacity key={tab} style={{ flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: filter === tab ? '#334155' : 'transparent', borderRadius: 6 }} onPress={() => setFilter(tab)}>
              <Text style={{ color: filter === tab ? '#f8fafc' : '#94a3b8', fontWeight: '600' }}>{tab === 'to_buy' ? 'To Buy' : 'Purchased'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 16 }}><SkeletonLoader count={5} style="card" /></View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 160 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 50)} exiting={FadeOut} style={[styles.itemCard, styles.shadow]}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} onPress={() => toggleItem(item.id, item.is_purchased)}>
                <MaterialCommunityIcons name={item.is_purchased ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} size={24} color={item.is_purchased ? "#059669" : "#64748b"} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: item.is_purchased ? '#64748b' : '#f8fafc', fontSize: 16, textDecorationLine: item.is_purchased ? 'line-through' : 'none' }}>{item.name}</Text>
                  {item.quantity > 1 && <Text style={{ color: '#64748b', fontSize: 12 }}>Qty: {item.quantity}</Text>}
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteItem(item.id)}>
                <MaterialCommunityIcons name="delete-outline" size={24} color="#ef4444" />
              </TouchableOpacity>
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <MaterialCommunityIcons name="cart-outline" size={64} color="#334155" />
              <Text style={{ color: '#94a3b8', marginTop: 16, fontSize: 16 }}>{filter === 'to_buy' ? 'Your list is empty.' : 'No purchased items yet.'}</Text>
            </View>
          }
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Add new item..." placeholderTextColor="#64748b" value={newItemName} onChangeText={setNewItemName} onSubmitEditing={handleAdd} />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  itemCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#334155' },
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  inputContainer: { position: 'absolute', bottom: 90, left: 16, right: 16, flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: '#334155' },
  input: { flex: 1, color: '#f8fafc', paddingHorizontal: 12, fontSize: 16 },
  addButton: { backgroundColor: '#059669', width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});
