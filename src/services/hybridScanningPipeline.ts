import { lookupBarcode, BarcodeProduct } from '../lib/barcode';
import { analyzeFridgeImage, getImageForCategory } from '../lib/ai';
import { fetchProductImage } from './productImageService';

export interface ScannedItemResult {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  confidence: number;
  imageUrl: string;
  scanSource: 'BARCODE' | 'OPEN_FOOD_FACTS' | 'OCR' | 'VISION_AI' | 'MANUAL';
  barcode?: string;
}

class ScanDebouncer {
  private recentHashes = new Map<string, number>();

  isDuplicate(name: string, windowMs = 3000): boolean {
    const hash = name.trim().toLowerCase();
    const now = Date.now();
    const lastSeen = this.recentHashes.get(hash);

    if (lastSeen && now - lastSeen < windowMs) return true;
    this.recentHashes.set(hash, now);
    return false;
  }
}

export const scanDebouncer = new ScanDebouncer();

export async function processHybridScan(input: { barcode?: string; base64Image?: string; ocrText?: string; manualName?: string }): Promise<ScannedItemResult[]> {
  // STAGE 1: Barcode
  if (input.barcode) {
    const product = await lookupBarcode(input.barcode);
    if (product) {
      const img = await fetchProductImage(input.barcode, product.name, product.category);
      return [{
        id: `barcode-${Date.now()}`,
        name: product.name,
        category: product.category,
        quantity: 1,
        unit: 'item',
        confidence: 0.99,
        imageUrl: img.imageUrl,
        scanSource: 'BARCODE',
        barcode: input.barcode,
      }];
    }
  }

  // STAGE 2-4: Vision AI
  if (input.base64Image) {
    const items = await analyzeFridgeImage(input.base64Image);
    if (items && items.length > 0) {
      const results: ScannedItemResult[] = [];
      for (const item of items) {
        if (scanDebouncer.isDuplicate(item.name)) continue;
        const img = await fetchProductImage(null, item.name, item.category);
        results.push({
          id: `vision-${Date.now()}`,
          name: item.name,
          category: item.category,
          quantity: item.quantity || 1,
          unit: item.unit || 'item',
          confidence: 0.88,
          imageUrl: img.imageUrl,
          scanSource: 'VISION_AI',
        });
      }
      if (results.length > 0) return results;
    }
  }

  // STAGE 5: Manual
  if (input.manualName) {
    const img = await fetchProductImage(null, input.manualName, 'Other');
    return [{
      id: `manual-${Date.now()}`,
      name: input.manualName,
      category: 'Other',
      quantity: 1,
      unit: 'item',
      confidence: 1.0,
      imageUrl: img.imageUrl,
      scanSource: 'MANUAL',
    }];
  }

  return [];
}
