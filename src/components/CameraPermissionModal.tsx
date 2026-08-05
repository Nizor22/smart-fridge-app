// src/components/CameraPermissionModal.tsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CameraPermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onRequestPermission: () => Promise<boolean>;
  permissionGranted: boolean;
  canAskAgain: boolean;
}

export default function CameraPermissionModal({
  visible,
  onClose,
  onRequestPermission,
  permissionGranted,
  canAskAgain,
}: CameraPermissionModalProps) {
  const handleGrant = async () => {
    if (canAskAgain) {
      const granted = await onRequestPermission();
      if (granted) {
        onClose();
      }
    } else {
      Linking.openSettings();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="camera-outline" size={44} color="#059669" />
          </View>
          
          <Text style={styles.title}>Camera Access Required</Text>
          
          <Text style={styles.description}>
            Smart Fridge AI needs camera access to scan food items, barcodes, and expiration dates. Your photos are analyzed instantly for ingredient detection and are never shared without permission.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.grantButton} onPress={handleGrant}>
              <Text style={styles.grantButtonText}>
                {canAskAgain ? 'Allow Camera Access' : 'Open Device Settings'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Continue Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  grantButton: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  grantButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
});
