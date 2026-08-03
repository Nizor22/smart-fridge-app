import { CameraView, useCameraPermissions } from 'expo-camera';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRef, useState } from 'react';
import { analyzeFridgeImage } from '../lib/ai';

export default function CameraScanner({ onClose, onScanSuccess }: { onClose: () => void, onScanSuccess: (item: any) => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View className="flex-1 bg-black" />;
  
  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <Text className="text-xl font-bold text-foreground mb-4 text-center">We need your permission to show the camera to scan your fridge.</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-primary px-6 py-3 rounded-full">
          <Text className="text-white font-bold text-lg">Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} className="mt-4 p-2">
          <Text className="text-muted font-bold text-lg">Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      if (photo?.base64) {
        const result = await analyzeFridgeImage(photo.base64);
        onScanSuccess(result);
        onClose();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to analyze image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
        <View className="absolute bottom-10 w-full flex-row justify-center space-x-4">
          <TouchableOpacity 
            className={`bg-white w-20 h-20 rounded-full border-4 border-slate-300 shadow-md justify-center items-center ${isProcessing ? 'opacity-50' : ''}`} 
            onPress={handleCapture}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="large" color="#059669" />
            ) : (
              <View className="bg-primary w-16 h-16 rounded-full" />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onClose} className="absolute top-12 right-6 bg-black/50 px-4 py-2 rounded-full">
          <Text className="text-white font-bold">Close</Text>
        </TouchableOpacity>
      </CameraView>
    </View>
  );
}
