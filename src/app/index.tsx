import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BeverageCard, { type BeverageCardProps } from '@/components/beverage-card';
import { Text } from '@/components/text';
import { useTheme } from '@/hooks/use-theme';

const beverages: BeverageCardProps[] = [
  { uuid: '4a7c2d91-0f3e-4c8b-a651-2f9d6e8b1c04', name: 'Maple Oat Latte', beverageType: 'Coffee', temperature: 'Hot', ingredients: ['Espresso', 'Oat milk', 'Maple'] },
  { uuid: 'b8e14f63-7c29-4a05-9d72-1f6c3a8e2b90', name: 'Citrus Cold Brew', beverageType: 'Coffee', temperature: 'Iced', ingredients: ['Cold brew', 'Orange peel', 'Vanilla cream'] },
  { uuid: 'd2f6a809-35be-4c17-b964-8a1e5d7f3c26', name: 'Brown Sugar Cortado', beverageType: 'Coffee', temperature: 'Hot', ingredients: ['Espresso', 'Brown sugar syrup', 'Steamed milk'] },
  { uuid: '6c9b2e47-a1d8-4f53-8b06-e7c2a94d5f31', name: 'Vanilla Salt Iced Latte', beverageType: 'Coffee', temperature: 'Iced', ingredients: ['Espresso', 'Vanilla syrup', 'Sea salt foam'] },
  { uuid: 'e5a3c718-92d4-4b6f-8e10-3c7a1d9b2f65', name: 'Honey Almond Mocha', beverageType: 'Coffee', temperature: 'Hot', ingredients: ['Espresso', 'Cocoa', 'Almond milk'] },
  { uuid: '1f8d4a62-c7b3-49e0-a516-6b2e9c5d7f84', name: 'Cinnamon Cream Brew', beverageType: 'Coffee', temperature: 'Iced', ingredients: ['Cold brew', 'Cinnamon', 'Sweet cream'] },
  { uuid: '9b2e6d40-f1a7-4c85-8d39-5e0b3a7c2f16', name: 'Green Tea Latte', beverageType: 'Tea', temperature: 'Hot', ingredients: ['Matcha', 'Steamed milk', 'Honey'] },
];

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <FlatList
        contentContainerStyle={styles.content}
        data={beverages}
        keyExtractor={(drink) => drink.uuid}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Stardrop Cafe</Text>
            <Text style={styles.title}>Coffee menu</Text>
          </View>
        }
        renderItem={({ item }) => <BeverageCard {...item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  eyebrow: {
    color: '#A05A35',
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    color: '#2B211C',
    fontSize: 36,
    marginTop: 8,
  },
  subtitle: {
    color: '#796A60',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  separator: {
    height: 14,
  },
});
