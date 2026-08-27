import { StyleSheet, Text, View } from 'react-native';

export type CoffeeCardProps = {
  name: string;
  temperature: 'Iced' | 'Hot';
  ingredients: readonly [string, string, string];
};

export default function CoffeeCard({ name, temperature, ingredients }: CoffeeCardProps) {
  const isIced = temperature === 'Iced';

  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <Text style={styles.name}>{name}</Text>
        <View style={[styles.badge, isIced ? styles.icedBadge : styles.hotBadge]}>
          <Text style={styles.badgeText}>{temperature}</Text>
        </View>
      </View>
      <View style={styles.ingredients}>
        {ingredients.map((ingredient) => (
          <Text key={ingredient} style={styles.ingredient}>{ingredient}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFDFC',
    borderColor: '#E7D9CA',
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#4A2C1D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headingRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  name: { color: '#2B211C', flex: 1, fontSize: 20, fontWeight: '700' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  hotBadge: { backgroundColor: '#F4D5C4' },
  icedBadge: { backgroundColor: '#D7E9E5' },
  badgeText: { color: '#5A3828', fontSize: 12, fontWeight: '700' },
  ingredients: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  ingredient: { backgroundColor: '#F3ECE3', borderRadius: 8, color: '#796A60', fontSize: 14, paddingHorizontal: 10, paddingVertical: 7 },
});
