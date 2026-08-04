import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { supabase, getCurrentUserId } from '../../lib/supabase';

interface ListItem { id: string; name: string; is_purchased: boolean; }

export default function GroceryListScreen() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [filter, setFilter] = useState<'to_buy' | 'purchased'>('to_buy');
  const [newItemName, setNewItemName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (uid) fetchList(uid); else setItems([]);
    });
    return () => subscription.unsubscribe();
  }, []);

  const init = async () => {
    const uid = await getCurrentUserId();
    setUserId(uid);
    if (uid) fetchList(uid);
  };

  const fetchList = async (uid?: string) => {
    const id = uid || userId;
    if (!id) return;
    const { data } = await supabase.from('grocery_list').select('*').eq('user_id', id).order('created_at', { ascending: false });
    if (data) setItems(data);
  };

  const addItem = async () => {
    if (!newItemName.trim()) return;
    if (!userId) { Alert.alert('Sign In Required', 'Please sign in to save grocery items.'); return; }
    const newItem = { name: newItemName.trim(), is_purchased: false, user_id: userId };
    setItems([{ id: `temp-${Date.now()}`, ...newItem }, ...items]);
    setNewItemName('');
    await supabase.from('grocery_list').insert([newItem]);
    fetchList();
  };

  const toggleItem = async (id: string, current: boolean) => {
    setItems(items.map(i => i.id === id ? { ...i, is_purchased: !current } : i));
    await supabase.from('grocery_list').update({ is_purchased: !current }).eq('id', id);
  };

  const deleteItem = async (id: string) => {
    setItems(items.filter(i => i.id !== id));
    await supabase.from('grocery_list').delete().eq('id', id);
  };

  const filteredItems = items.filter(i => filter === 'to_buy' ? !i.is_purchased : i.is_purchased);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }} edges={['top', 'left', 'right']}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#f8fafc', fontSize: 28, fontWeight: 'bold' }}>Grocery List</Text>
          <View style={{ backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
            <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{items.filter(i => !i.is_purchased).length} Items</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 20, backgroundColor: '#1e293b', borderRadius: 8, padding: 4 }}>
          {(['to_buy', 'purchased'] as const).map(tab => (
            <TouchableOpacity key={tab} style={{ flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: filter === tab ? '#334155' : 'transparent', borderRadius: 6 }} onPress={() => setFilter(tab)}>
              <Text style={{ color: filter === tab ? '#f8fafc' : '#94a3b8', fontWeight: '600' }}>{tab === 'to_buy' ? 'To Buy' : 'Purchased'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 160 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50)} exiting={FadeOut} style={[styles.itemCard, styles.shadow]}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} onPress={() => toggleItem(item.id, item.is_purchased)}>
              <MaterialCommunityIcons name={item.is_purchased ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} size={24} color={item.is_purchased ? "#059669" : "#64748b"} />
              <Text style={{ marginLeft: 12, color: item.is_purchased ? '#64748b' : '#f8fafc', fontSize: 16, textDecorationLine: item.is_purchased ? 'line-through' : 'none' }}>{item.name}</Text>
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

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Add new item..." placeholderTextColor="#64748b" value={newItemName} onChangeText={setNewItemName} onSubmitEditing={addItem} />
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
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
