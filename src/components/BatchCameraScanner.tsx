import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import CameraScanner from './CameraScanner';

export default function BatchCameraScanner({ onClose, onSaveBatch }: { onClose: () => void; onSaveBatch: (items: any[]) => void }) {
  const [queue, setQueue] = useState<any[]>([]);

  const handleScanItem = (items: any[]) => {
    setQueue(prev => [...prev, ...items]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <CameraScanner onClose={onClose} onScanSuccess={handleScanItem} />
      <View style={styles.batchBar}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{queue.length} items in batch</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={() => { onSaveBatch(queue); onClose(); }}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  batchBar: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#1e293b', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saveBtn: { backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
});
