// Bottom Dock Action Bar Snippet
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function BottomDockActionBar({ onScanPress, onFilterPress }: { onScanPress: () => void; onFilterPress: () => void }) {
  return (
    <View style={styles.dockContainer}>
      <TouchableOpacity style={styles.dockButton} onPress={onFilterPress}>
        <MaterialCommunityIcons name="filter-variant" size={22} color="#94A3B8" />
        <Text style={styles.dockLabel}>Filter</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.centerScanFab} onPress={onScanPress} activeOpacity={0.85}>
        <MaterialCommunityIcons name="camera-plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.dockButton} onPress={() => {}}>
        <MaterialCommunityIcons name="sort" size={22} color="#94A3B8" />
        <Text style={styles.dockLabel}>Sort</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: { position: 'absolute', bottom: 24, left: 20, right: 20, height: 64, backgroundColor: 'rgba(23, 32, 51, 0.95)', borderRadius: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  dockButton: { alignItems: 'center', justifyContent: 'center', width: 60 },
  dockLabel: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  centerScanFab: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginTop: -20 },
});
