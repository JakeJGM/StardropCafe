import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/text';
import { useTheme } from '@/hooks/use-theme';

export default function BeverageRecipeScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to homepage"
        onPress={() => router.replace('/')}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      >
        <Text style={[styles.backText, { color: theme.text }]}>{'< Back'}</Text>
      </Pressable>
      
      <View style={styles.noteContainer}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            <View style={styles.innerPageBorder}>
              <View style={styles.note}>
                <View style={styles.noteHeader}>
                  <Text style={styles.recipeTitle}>Honey Oat Latte</Text>
                </View>
                <View style={styles.ingredientListContainer}>
                  <Text style={styles.sectionTitle}>Ingredients:</Text>
                  <Text style={styles.recipeText}>• 1 shot of espresso</Text>
                  <Text style={styles.recipeText}>• 1 cup of milk</Text>
                  <Text style={styles.recipeText}>• 1 tablespoon of honey</Text>
                  <Text style={styles.recipeText}>• 1 teaspoon of oat flour</Text>
                </View>
                <View style={styles.instructionsContainer}>
                  <View>
                    <Text style={styles.sectionTitle}>Instructions:</Text>
                    <Text style={styles.recipeText}>1. Brew 1 shot of espresso.</Text>
                    <Text style={styles.recipeText}>2. Heat 1 cup of milk.</Text>
                    <Text style={styles.recipeText}>3. Mix 1 tablespoon of honey with 1 teaspoon of oat flour.</Text>
                    <Text style={styles.recipeText}>4. Combine all ingredients and serve.</Text>
                  </View>
                </View>
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
  backText: {
    fontFamily: 'StardewFontBold',
    fontSize: 24,
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
});
