import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, FadeIn, withSequence, Easing } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from 'expo-image-manipulator';
import { analyzeFridgeImage } from '../lib/ai';
import { lookupBarcode } from '../lib/barcode';
import { calculateExpiryDate } from '../lib/expiration';
import { getImageForCategory } from '../lib/ai';
import { useFridgeContext } from '../context/FridgeContext';

type Props = {
  onClose: () => void;
  onScanSuccess: (items: any[]) => void;
};

type Mode = 'Photo' | 'Barcode';
type ScanState = 'idle' | 'processing' | 'preview' | 'notFound';

export default function CameraScanner({ onClose, onScanSuccess }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<Mode>('Photo');
  const [flash, setFlash] = useState<boolean>(false);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);
  
  const cameraRef = useRef<any>(null);
  const scanLock = useRef(false);
  const isMounted = useRef(true);
  const { fridges, activeFridgeId, setActiveFridgeId } = useFridgeContext();

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const scanLineY = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (mode === 'Barcode') {
      scanLineY.value = withRepeat(
        withSequence(
          withTiming(200, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      scanLineY.value = 0;
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, [mode, scanLineY, pulseScale]);

  const animatedScanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
    opacity: mode === 'Barcode' ? 1 : 0
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }]
  }));

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (scanState !== 'idle' || !cameraRef.current) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanState('processing');

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      // Resize to 1024px — phone cameras are 12MP+, way too large for AI
      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      const items = await analyzeFridgeImage(resized.base64!);
      if (!isMounted.current) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onScanSuccess(items);
      onClose();
    } catch (error) {
      if (!isMounted.current) return;
      console.error(error);
      Alert.alert('Error', 'Failed to analyze image');
      setScanState('idle');
    }
  };

  const handleBarcodeScanned = async ({ data, type }: any) => {
    if (mode !== 'Barcode' || scanLock.current || scanState !== 'idle') return;
    
    scanLock.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScanState('processing');
    setQuantity(1);

    try {
      const product = await lookupBarcode(data);
      if (!isMounted.current) return;
      if (product) {
        setScannedProduct({ ...product, barcode: data });
        setScanState('preview');
      } else {
        setScanState('notFound');
      }
    } catch (error) {
      if (!isMounted.current) return;
      console.error(error);
      setScanState('notFound');
    }
  };

  const handleAddToFridge = () => {
    if (!scannedProduct) return;
    
    const expiry = calculateExpiryDate(scannedProduct.category);
    const item = {
      ...scannedProduct,
      quantity,
      expires_at: expiry,
      image_url: scannedProduct.image_url || getImageForCategory(scannedProduct.category)
    };
    
    onScanSuccess([item]);
    
    // Reset for next scan or close
    scanLock.current = false;
    setScanState('idle');
    setScannedProduct(null);
  };

  const handleScanNext = () => {
    scanLock.current = false;
    setScanState('idle');
    setScannedProduct(null);
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        facing="back"
        enableTorch={flash}
        ref={cameraRef}
        onBarcodeScanned={mode === 'Barcode' ? handleBarcodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ["upc_a", "upc_e", "ean13", "ean8", "qr"],
        }}
      />
      
      {/* Absolute sibling overlay */}
      <View style={styles.overlay}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <MaterialCommunityIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.modeToggle}>
            <TouchableOpacity 
              style={[styles.modePill, mode === 'Photo' && styles.modePillActive]}
              onPress={() => setMode('Photo')}
            >
              <Text style={[styles.modeText, mode === 'Photo' && styles.modeTextActive]}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modePill, mode === 'Barcode' && styles.modePillActive]}
              onPress={() => setMode('Barcode')}
            >
              <Text style={[styles.modeText, mode === 'Barcode' && styles.modeTextActive]}>Barcode</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={() => setFlash(!flash)} style={styles.iconButton}>
            <MaterialCommunityIcons name={flash ? "flash" : "flash-off"} size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Fridge Selector Pill */}
        {fridges.length > 0 && (
          <TouchableOpacity
            style={styles.fridgePill}
            onPress={() => {
              const buttons = fridges.map(f => ({
                text: `${f.name}${f.id === activeFridgeId ? ' ✓' : ''}`,
                onPress: () => setActiveFridgeId(f.id),
              }));
              buttons.push({ text: 'Cancel', onPress: () => {} });
              Alert.alert('Scan to which fridge?', 'Items will be added to the selected fridge:', buttons);
            }}
          >
            <MaterialCommunityIcons name="fridge-outline" size={14} color="#059669" />
            <Text style={styles.fridgePillText}>
              {fridges.find(f => f.id === activeFridgeId)?.name || 'Select Fridge'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={14} color="#94a3b8" />
          </TouchableOpacity>
        )}

        {/* Center Focus Area */}
        <View style={styles.focusContainer} pointerEvents="none">
          <View style={styles.focusBrackets}>
            <View style={[styles.bracket, styles.bracketTopLeft]} />
            <View style={[styles.bracket, styles.bracketTopRight]} />
            <View style={[styles.bracket, styles.bracketBottomLeft]} />
            <View style={[styles.bracket, styles.bracketBottomRight]} />
            
            {mode === 'Barcode' && (
              <Animated.View style={[styles.scanLine, animatedScanLineStyle]} />
            )}
          </View>
        </View>

        {/* Bottom Area */}
        <View style={styles.bottomArea}>
          {scanState === 'processing' && (
            <Animated.View entering={FadeIn} style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingText}>Analyzing...</Text>
            </Animated.View>
          )}

          {scanState === 'idle' && mode === 'Photo' && (
            <Animated.View style={animatedPulseStyle}>
              <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {scanState === 'idle' && mode === 'Barcode' && (
            <Text style={styles.instructionText}>Point at a barcode to scan</Text>
          )}

          {scanState === 'preview' && scannedProduct && (
            <Animated.View entering={FadeIn} style={styles.previewCard}>
              <View style={styles.previewHeader}>
                {scannedProduct.image_url ? (
                  <Image source={{ uri: scannedProduct.image_url }} style={styles.previewImage} />
                ) : (
                  <View style={styles.previewImagePlaceholder}>
                    <MaterialCommunityIcons name="food-apple" size={32} color="#aaa" />
                  </View>
                )}
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>{scannedProduct.name}</Text>
                  <Text style={styles.previewBrand}>{scannedProduct.brand}</Text>
                  <Text style={styles.previewCategory}>{scannedProduct.category}</Text>
                </View>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
                    <MaterialCommunityIcons name="minus" size={18} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{quantity}</Text>
                  <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qtyBtn}>
                    <MaterialCommunityIcons name="plus" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.previewActions}>
                <TouchableOpacity style={styles.scanNextButton} onPress={handleScanNext}>
                  <Text style={styles.scanNextText}>Scan Next</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addToFridgeButton} onPress={handleAddToFridge}>
                  <Text style={styles.addToFridgeText}>Add{quantity > 1 ? ` (${quantity})` : ''} to Fridge</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {scanState === 'notFound' && (
            <Animated.View entering={FadeIn} style={styles.notFoundCard}>
              <MaterialCommunityIcons name="help-circle-outline" size={48} color="#fff" style={styles.notFoundIcon} />
              <Text style={styles.notFoundTitle}>Product not found</Text>
              <Text style={styles.notFoundDesc}>We couldn't find this barcode in our database.</Text>
              <View style={styles.previewActions}>
                <TouchableOpacity style={styles.scanNextButton} onPress={handleScanNext}>
                  <Text style={styles.scanNextText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    padding: 4,
  },
  modePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 26,
  },
  modePillActive: {
    backgroundColor: '#fff',
  },
  modeText: {
    color: '#fff',
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#000',
  },
  focusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusBrackets: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  bracket: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
  },
  bracketTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  bracketTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bracketBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bracketBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    top: 25,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  bottomArea: {
    paddingBottom: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  processingContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 16,
  },
  processingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#2c2c2e',
  },
  previewImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#2c2c2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  previewName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewBrand: {
    color: '#a1a1aa',
    fontSize: 14,
    marginTop: 2,
  },
  previewCategory: {
    color: '#60a5fa',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  scanNextButton: {
    flex: 1,
    backgroundColor: '#2c2c2e',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanNextText: {
    color: '#fff',
    fontWeight: '600',
  },
  addToFridgeButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addToFridgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  notFoundCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  notFoundIcon: {
    marginBottom: 12,
  },
  notFoundTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notFoundDesc: {
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginLeft: 8,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 10,
  },
  fridgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
  },
  fridgePillText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 13,
    marginHorizontal: 6,
  },
});
