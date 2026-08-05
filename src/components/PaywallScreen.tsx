// src/components/PaywallScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Purchases from 'react-native-purchases';
import { useEntitlements } from '../hooks/useEntitlements';

export default function PaywallScreen({ onClose }: { onClose: () => void }) {
  const { restorePurchases } = useEntitlements();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages[0]) {
        const { customerInfo } = await Purchases.purchasePackage(offerings.current.availablePackages[0]);
        if (customerInfo.entitlements.active['pro_access']) {
          Alert.alert('Success!', 'Welcome to Pro!');
          onClose();
        }
      }
    } catch (err: any) {
      if (!err.userCancelled) Alert.alert('Purchase Failed', err.message);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Fridge Pro</Text>
      <TouchableOpacity style={styles.buyBtn} onPress={handlePurchase} disabled={purchasing}>
        <Text style={styles.buyBtnText}>Subscribe Now ($4.99/mo)</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={async () => { await restorePurchases(); onClose(); }} style={{ marginTop: 16 }}>
        <Text style={{ color: '#94a3b8', textDecorationLine: 'underline' }}>Restore Purchases</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { color: '#f8fafc', fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  buyBtn: { backgroundColor: '#059669', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12 },
  buyBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
