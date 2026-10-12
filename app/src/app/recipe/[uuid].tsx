import { skipToken, useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRecipeById } from '@/api/api';
import { Text } from '@/components/text';
import { NO_RECIPE_ID } from '@/constants/routes';

export default function BeverageRecipeScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const hasRecipe = uuid !== NO_RECIPE_ID;

  const { data: recipe, error, isPending, refetch } = useQuery({
    queryKey: ['recipe', uuid],
    queryFn: hasRecipe ? () => getRecipeById(uuid) : skipToken,
  });

  const renderNoteContent = () => {
    if (!hasRecipe) {
      return (
        <View style={styles.emptyNote}>
          <Text style={styles.emptyNoteText}>No recipe created for this beverage yet!</Text>
        </View>
      );
    }

    if (isPending) {
      return (
        <View style={styles.emptyNote}>
          <ActivityIndicator color="#853605" size="large" />
        </View>
      );
    }

    if (error || !recipe) {
      return (
        <View style={styles.emptyNote}>
          <Text style={styles.emptyNoteText}>Could not load this recipe.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => refetch()}
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.noteText}>
        <View style={styles.noteHeader}>
          <Text style={styles.recipeTitle}>{recipe.beverageName ?? 'Recipe'}</Text>
        </View>
        <View style={styles.ingredientListContainer}>
          <Text style={styles.sectionTitle}>Ingredients:</Text>
          {recipe.ingredients.map((ingredient) => (
            <Text key={ingredient.id} style={styles.recipeText}>
              {`• ${ingredient.unitCount} ${ingredient.unitType} of ${ingredient.name}`}
            </Text>
          ))}
        </View>
        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>Instructions:</Text>
          {/* Sorted by step server-side. */}
          {recipe.instructions.map((instruction) => (
            <Text key={instruction.id} style={styles.recipeText}>
              {`${instruction.step}. ${instruction.instruction}`}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to homepage"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      >
        <Image
          source={require('../../../assets/images/recipe_page/back-button.svg')}
          style={styles.backIcon}
          contentFit="contain"
        />
      </Pressable>

      <View style={styles.noteContainer}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            <View style={styles.innerPageBorder}>
              <View style={styles.note}>
                {renderNoteContent()}
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButtonPressed: {
    opacity: 0.65,
  },
  backIcon: {
    width: 44,
    height: 44,
  },
  noteContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 40
  },
  outerBorder: {
    backgroundColor: '#b14e05',
    flex: 1,
    padding: 10,
    borderRadius: 10,
  },
  innerBorder: {
    backgroundColor: '#dc7b05',
    flex: 1,
    padding: 10,
  },
  innerPageBorder: {
    backgroundColor: '#853605',
    flex: 1,
    padding: 10,
  },
  note: {
    backgroundColor: '#ffe6b7',
    flex: 1,
  },
  noteText: {
    marginLeft: 10,
  },
  noteHeader: {
    padding: 10,
  },
  recipeTitle: {
    fontFamily: 'StardewFontBold',
    fontSize: 32,
    lineHeight: 40,
  },
  ingredientListContainer: {
    padding: 10,
  },
  instructionsContainer: {
    padding: 10,
  },
  sectionTitle: {
    fontFamily: 'StardewFontBold',
    fontSize: 22,
    lineHeight: 30,
    marginBottom: 4,
  },
  recipeText: {
    fontSize: 18,
    lineHeight: 27,
  },
  emptyNote: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyNoteText: {
    fontFamily: 'StardewFontBold',
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonPressed: {
    opacity: 0.65,
  },
  retryText: {
    fontFamily: 'StardewFontBold',
    fontSize: 22,
  },
});
