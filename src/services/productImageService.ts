import { BarcodeProduct, lookupBarcode } from '../lib/barcode';
import { getImageForCategory } from '../lib/ai';

export interface ProductImageResult {
  imageUrl: string;
  source: 'open_food_facts' | 'unsplash_fallback' | 'category_fallback';
  confidence: number;
}

const UNSPLASH: Record<string, string> = {
  milk: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
  cheese: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80',
};

export async function fetchProductImage(
  barcode?: string | null,
  productName?: string,
  category: string = 'Other'
): Promise<ProductImageResult> {
  if (barcode) {
    const product = await lookupBarcode(barcode);
    if (product?.imageUrl) return { imageUrl: product.imageUrl, source: 'open_food_facts', confidence: 0.98 };
  }

  if (productName) {
    const lower = productName.toLowerCase();
    for (const [key, url] of Object.entries(UNSPLASH)) {
      if (lower.includes(key)) return { imageUrl: url, source: 'unsplash_fallback', confidence: 0.85 };
    }
  }

  return { imageUrl: getImageForCategory(category), source: 'category_fallback', confidence: 0.60 };
}
