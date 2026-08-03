import { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { generateRecipe } from '../../lib/ai';

export default function RecipesScreen() {
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchNewRecipe = async () => {
    setLoading(true);
    try {
      const { data: inventory } = await supabase.from('inventory').select('*').limit(10);
      if (inventory && inventory.length > 0) {
        const generated = await generateRecipe(inventory);
        setRecipe(generated);
      } else {
        alert("Add some food to your fridge first!");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate recipe.");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-3xl font-bold text-foreground mb-4">Zero-Waste AI Recipes</Text>
        
        {!recipe && !loading && (
          <View className="bg-white p-6 rounded-2xl items-center shadow-sm border border-slate-100 mt-10">
            <MaterialCommunityIcons name="chef-hat" size={60} color="#059669" />
            <Text className="text-lg font-bold text-foreground mt-4 text-center">
              Let AI craft a perfect recipe based on what's in your fridge right now!
            </Text>
            <TouchableOpacity onPress={fetchNewRecipe} className="bg-primary px-8 py-4 rounded-full mt-6 shadow-md">
              <Text className="text-white font-bold text-lg">Generate Recipe</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View className="flex-1 justify-center items-center mt-20">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-muted font-bold mt-4">Analyzing your fridge...</Text>
          </View>
        )}

        {recipe && !loading && (
          <View className="mb-10">
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <Text className="text-2xl font-bold text-primary mb-4">{recipe.title}</Text>
              
              <Text className="text-xl font-bold text-foreground mt-4 mb-2">Ingredients:</Text>
              {recipe.ingredients?.map((ing: string, i: number) => (
                <Text key={i} className="text-lg text-foreground mb-1">• {ing}</Text>
              ))}

              <Text className="text-xl font-bold text-foreground mt-6 mb-2">Instructions:</Text>
              {recipe.instructions?.map((inst: string, i: number) => (
                <Text key={i} className="text-lg text-foreground mb-3">{i + 1}. {inst}</Text>
              ))}
            </View>
            
            <TouchableOpacity onPress={fetchNewRecipe} className="bg-secondary px-8 py-4 rounded-full mt-6 items-center">
              <Text className="text-foreground font-bold text-lg">Generate Another</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
