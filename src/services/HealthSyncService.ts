import { Platform, NativeModules } from 'react-native';

export class HealthSyncService {
  static async syncMeal(calories: number, protein: number) {
    if (Platform.OS === 'ios' && NativeModules.HealthKitBridge) {
      await NativeModules.HealthKitBridge.saveSample({ calories, protein });
    }
  }
}
