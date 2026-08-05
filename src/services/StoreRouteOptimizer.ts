export class StoreRouteOptimizer {
  static optimizeRoute(items: Array<{ id: string; name: string; category: string }>) {
    const categories = ['Produce', 'Bakery', 'Meat', 'Dairy', 'Pantry', 'Frozen'];
    return [...items].sort((a, b) => categories.indexOf(a.category) - categories.indexOf(b.category));
  }
}
