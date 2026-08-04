import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { generateRecipe } from '../../lib/ai';

interface Recipe {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
}

export default function RecipesScreen() {
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setRecipe(null);
    try {
      // Mocking AI response for now, assume generateRecipe returns a recipe object
      // const generatedRecipe = await generateRecipe();
      
      setTimeout(() => {
        setRecipe({
          title: "Garlic Butter Steak Bites",
          description: "Juicy, tender steak bites seared with a delicious garlic butter sauce. Ready in minutes!",
          prepTime: "10 mins",
          cookTime: "15 mins",
          servings: 2,
          ingredients: [
            "1 lb Sirloin steak, cubed",
            "1 tbsp Olive oil",
            "3 tbsp Butter",
            "4 cloves Garlic, minced",
            "Salt and pepper to taste"
          ],
          instructions: [
            "Season steak cubes with salt and pepper.",
            "Heat olive oil in a skillet over high heat.",
            "Add steak bites and sear for 2-3 minutes until browned.",
            "Reduce heat, add butter and minced garlic.",
            "Toss steak in garlic butter for 1 minute.",
            "Serve immediately and enjoy."
          ]
        });
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {!recipe && !loading && (
          <Animated.View entering={FadeInDown} style={{ alignItems: 'center', marginTop: 60, marginBottom: 40 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              <MaterialCommunityIcons name="chef-hat" size={40} color="#059669" />
            </View>
            <Text style={{ color: '#f8fafc', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>AI Chef</Text>
            <Text style={{ color: '#94a3b8', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 }}>
              Discover delicious recipes based on what's currently in your smart fridge.
            </Text>
          </Animated.View>
        )}

        {loading && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={{ alignItems: 'center', marginTop: 100 }}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={{ color: '#94a3b8', marginTop: 16, fontSize: 16 }}>Cooking up something special...</Text>
          </Animated.View>
        )}

        {recipe && !loading && (
          <Animated.View entering={FadeInDown} style={styles.recipeCard}>
            <Text style={{ color: '#f8fafc', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>{recipe.title}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>{recipe.description}</Text>
            
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <View style={styles.badge}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#059669" />
                <Text style={styles.badgeText}>{recipe.cookTime}</Text>
              </View>
              <View style={styles.badge}>
                <MaterialCommunityIcons name="account-group-outline" size={16} color="#059669" />
                <Text style={styles.badgeText}>{recipe.servings} Servings</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ing, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialCommunityIcons name="circle-small" size={24} color="#059669" />
                <Text style={{ color: '#e2e8f0', fontSize: 16 }}>{ing}</Text>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Instructions</Text>
            {recipe.instructions.map((inst, idx) => (
              <View key={idx} style={{ flexDirection: 'row', marginBottom: 12 }}>
                <Text style={{ color: '#059669', fontSize: 16, fontWeight: 'bold', marginRight: 12 }}>{idx + 1}.</Text>
                <Text style={{ color: '#e2e8f0', fontSize: 16, flex: 1, lineHeight: 22 }}>{inst}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        <TouchableOpacity 
          style={[styles.generateBtn, styles.shadow]} 
          onPress={handleGenerate}
          disabled={loading}
        >
          <MaterialCommunityIcons name="magic-staff" size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
            {recipe ? 'Generate Another' : 'Generate Recipe'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  recipeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  badgeText: {
    color: '#059669',
    marginLeft: 6,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  generateBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#34d399',
    marginTop: 'auto',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  }
});
