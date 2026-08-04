// OpenFoodFacts barcode lookup
export interface BarcodeProduct {
  name: string;
  brand: string;
  category: string;
  imageUrl: string | null;
}

const CATEGORY_MAP: Record<string, string> = {
  'dairies': 'Dairy', 'cheeses': 'Dairy', 'milks': 'Dairy', 'yogurts': 'Dairy', 'butters': 'Dairy',
  'meats': 'Meat', 'poultry': 'Meat', 'beef': 'Meat', 'pork': 'Meat', 'fish': 'Meat', 'seafood': 'Meat',
  'fruits': 'Produce', 'vegetables': 'Produce', 'salads': 'Produce',
  'beverages': 'Beverage', 'waters': 'Beverage', 'juices': 'Beverage', 'sodas': 'Beverage', 'teas': 'Beverage', 'coffees': 'Beverage',
  'cereals': 'Pantry', 'pastas': 'Pantry', 'breads': 'Pantry', 'snacks': 'Pantry', 'canned': 'Pantry', 'sauces': 'Pantry', 'condiments': 'Pantry',
};

function mapCategory(tags: string[]): string {
  for (const tag of tags) {
    const lower = tag.toLowerCase().replace('en:', '');
    for (const [key, value] of Object.entries(CATEGORY_MAP)) {
      if (lower.includes(key)) return value;
    }
  }
  return 'Other';
}

export async function lookupBarcode(code: string): Promise<BarcodeProduct | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`, {
      headers: { 'User-Agent': 'SmartFridgeAI/1.0 (contact@smartfridge.ai)' }
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const name = p.product_name || p.product_name_en || 'Unknown Product';
    const brand = p.brands || '';
    const categories = p.categories_tags || [];
    const imageUrl = p.image_front_small_url || p.image_url || null;

    return {
      name: brand ? `${brand} ${name}` : name,
      brand,
      category: mapCategory(categories),
      imageUrl,
    };
  } catch (error) {
    console.error('Barcode lookup failed:', error);
    return null;
  }
}
