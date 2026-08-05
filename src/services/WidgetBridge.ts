import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class WidgetBridgeService {
  static async syncWidgetData(items: any[]): Promise<void> {
    const payload = JSON.stringify({ itemCount: items.length, updatedAt: new Date().toISOString() });
    
    if (Platform.OS === 'ios' && NativeModules.SharedGroupStorage?.set) {
      await NativeModules.SharedGroupStorage.set('group.com.smartfridge.ai', 'widget_data', payload);
    } else {
      await AsyncStorage.setItem('@smart_fridge_widget_data', payload);
    }
  }
}
