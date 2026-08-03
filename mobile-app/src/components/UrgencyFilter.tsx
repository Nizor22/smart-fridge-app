import { ScrollView, TouchableOpacity, Text } from 'react-native';

const filters = ['All', '🔴 Eat Now', '🟡 Use Soon', '🟢 Fresh', 'Dairy', 'Produce', 'Meat'];

export default function UrgencyFilter({ active, onChange }: { active: string; onChange: (f: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
      {filters.map((f) => (
        <TouchableOpacity
          key={f}
          onPress={() => onChange(f)}
          className={`px-4 py-2 rounded-full mr-2 ${active === f ? 'bg-primary' : 'bg-secondary'}`}
        >
          <Text className={`font-bold ${active === f ? 'text-white' : 'text-foreground'}`}>{f}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
