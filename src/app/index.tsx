import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BeverageCard, { type BeverageCardProps } from '@/components/beverage-card';

const coffeeDrinks: BeverageCardProps[] = [
  { name: 'Maple Oat Latte', temperature: 'Hot', ingredients: ['Espresso', 'Oat milk', 'Maple syrup'] },
  { name: 'Citrus Cold Brew', temperature: 'Iced', ingredients: ['Cold brew', 'Orange peel', 'Vanilla cream'] },
  { name: 'Brown Sugar Cortado', temperature: 'Hot', ingredients: ['Espresso', 'Brown sugar syrup', 'Steamed milk'] },
  { name: 'Vanilla Salt Iced Latte', temperature: 'Iced', ingredients: ['Espresso', 'Vanilla syrup', 'Sea salt foam'] },
  { name: 'Honey Almond Mocha', temperature: 'Hot', ingredients: ['Espresso', 'Cocoa', 'Almond milk'] },
  { name: 'Cinnamon Cream Brew', temperature: 'Iced', ingredients: ['Cold brew', 'Cinnamon', 'Sweet cream'] },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        contentContainerStyle={styles.content}
        data={coffeeDrinks}
        keyExtractor={(drink) => drink.name}
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
    backgroundColor: '#F6F1E8',
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
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    color: '#2B211C',
    fontSize: 36,
    fontWeight: '800',
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
