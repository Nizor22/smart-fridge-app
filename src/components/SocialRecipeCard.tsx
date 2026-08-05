// src/components/SocialRecipeCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface RecipeData {
  id: string;
  title: string;
  description: string;
  cookTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
}

interface SocialRecipeCardProps {
  recipe: RecipeData;
  referralCode?: string;
}

export default function SocialRecipeCard({ recipe, referralCode = 'SMARTFRIDGE' }: SocialRecipeCardProps) {
  const shareDeepLink = `https://smartfridge.ai/recipe/${recipe.id}?code=${referralCode}`;

  const formatRecipeText = (): string => {
    const ingredientList = recipe.ingredients.map(ing => `• ${ing}`).join('\n');
    const stepList = recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n');
    
    return `🍳 ${recipe.title}\n⏱️ Cook Time: ${recipe.cookTime} | 👥 Servings: ${recipe.servings}\n\n` +
           `🛒 Ingredients:\n${ingredientList}\n\n` +
           `👨‍🍳 Instructions:\n${stepList}\n\n` +
           `Shared via Smart Fridge AI — Join and get 14 days Pro trial free!\n👉 ${shareDeepLink}`;
  };

  const handleShare = async () => {
    try {
      const message = formatRecipeText();

      const result = await Share.share({
        title: recipe.title,
        message: message,
        url: shareDeepLink,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared with activity type: ${result.activityType}`);
        } else {
          console.log('Recipe shared successfully');
        }
      }
    } catch (error: any) {
      Alert.alert('Share Failed', error?.message || 'Could not share recipe.');
    }
  };

  return (
    <View style={styles.card}>
      {recipe.imageUrl ? (
        <Image source={{ uri: recipe.imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <MaterialCommunityIcons name="chef-hat" size={48} color="#059669" />
        </View>
      )}

      <View style={styles.cardBody}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{recipe.description}</Text>

        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#059669" />
            <Text style={styles.badgeText}>{recipe.cookTime}</Text>
          </View>

          <View style={styles.badge}>
            <MaterialCommunityIcons name="account-group-outline" size={14} color="#059669" />
            <Text style={styles.badgeText}>{recipe.servings} Servings</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.85}>
          <MaterialCommunityIcons name="share-variant" size={20} color="#ffffff" />
          <Text style={styles.shareButtonText}>Share Recipe & Get 14 Days Free Pro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  shareButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
