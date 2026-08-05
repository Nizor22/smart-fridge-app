import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useInventory } from '../hooks/useInventory';
import { callGemini } from '../lib/ai';

interface Message { id: string; sender: 'user' | 'ai'; text: string; }

export default function AIChatAssistant({ userId, fridgeId }: { userId: string | null; fridgeId: string | null }) {
  const { items } = useInventory(userId, fridgeId);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: 'Hi! Ask me for recipes or expiry advice based on your fridge items!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const inventoryContext = items.map(i => `${i.name} (${i.quantity} ${i.unit || 'item'})`).join(', ');
      const prompt = `Inventory: [${inventoryContext}]. User asks: "${userMsg.text}". Respond helpfully.`;
      const response = await callGemini({ contents: [{ parts: [{ text: prompt }] }] });
      const aiText = response?.candidates?.[0]?.content?.parts?.[0]?.text || response?.text || 'Here to help!';

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: aiText }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: 'Sorry, AI is offline.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={m => m.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={{ color: '#f8fafc' }}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
      {loading && <ActivityIndicator color="#059669" style={{ marginBottom: 8 }} />}
      <View style={styles.inputBar}>
        <TextInput style={styles.input} placeholder="Ask AI..." placeholderTextColor="#64748b" value={input} onChangeText={setInput} onSubmitEditing={handleSend} />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <MaterialCommunityIcons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  bubble: { padding: 12, borderRadius: 16, marginBottom: 10, maxWidth: '80%' },
  userBubble: { backgroundColor: '#059669', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#1e293b', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#334155' },
  inputBar: { flexDirection: 'row', padding: 12, backgroundColor: '#1e293b', borderTopWidth: 1, borderColor: '#334155' },
  input: { flex: 1, color: '#f8fafc', paddingHorizontal: 12 },
  sendBtn: { backgroundColor: '#059669', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
});
