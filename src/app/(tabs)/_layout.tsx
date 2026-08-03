import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: 'hsl(160, 84%, 39%)',
      headerShown: true,
      headerTitleAlign: 'center',
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="fridge-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'Grocery List',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="format-list-bulleted" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'AI Recipes',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chef-hat" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cog-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
