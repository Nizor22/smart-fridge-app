import { View, Text, Image } from 'react-native';

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  urgency: 'EAT_NOW' | 'USE_SOON' | 'FRESH';
  price?: number;
  imageUrl?: string;
};

export default function InventoryCard({ item }: { item: InventoryItem }) {
  const urgencyColors = {
    EAT_NOW: 'bg-warning',
    USE_SOON: 'bg-accent',
    FRESH: 'bg-success',
  };

  const urgencyLabels = {
    EAT_NOW: '🔴 EAT ME NOW',
    USE_SOON: '🟡 Use Soon',
    FRESH: '🟢 Fresh',
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-100 flex-row">
      <View className="w-16 h-16 bg-slate-100 rounded-lg mr-4 justify-center items-center overflow-hidden">
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} className="w-full h-full" />
        ) : (
          <Text className="text-2xl">🍕</Text>
        )}
      </View>
      <View className="flex-1 justify-center">
        <Text className="text-lg font-bold text-foreground">{item.name}</Text>
        <Text className="text-sm text-muted mb-2">{item.category} {item.price ? `• $${item.price.toFixed(2)}` : ''}</Text>
        <View className="self-start">
          <View className={`${urgencyColors[item.urgency]} px-2 py-1 rounded-full`}>
            <Text className="text-xs font-bold text-white">{urgencyLabels[item.urgency]}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
