import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      <View style={styles.container} />
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
  container: {
    flex: 1,
  },
});
