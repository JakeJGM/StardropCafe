import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export type BeverageCardProps = {
  name: string;
  beverageType: 'Coffee' | 'Tea';
  temperature: 'Iced' | 'Hot';
  ingredients: readonly string[];
};

const beverageImages = {
  Coffee: require('../../assets/images/beverage_card/coffee.webp'),
  Tea: require('../../assets/images/beverage_card/green-tea.webp'),
} as const;

export default function BeverageCard({ name, beverageType, temperature, ingredients }: BeverageCardProps) {
  const [ingredientsRowWidth, setIngredientsRowWidth] = useState(0);
  const [ingredientWidths, setIngredientWidths] = useState<Record<number, number>>({});

  const allIngredientsMeasured = ingredients.every((_, index) => ingredientWidths[index] !== undefined);
  const visibleIngredientIndexes = ingredients.map((_, index) => index);

  if (allIngredientsMeasured) {
    visibleIngredientIndexes.length = 0;

    let occupiedWidth = 0;
    for (const [index] of ingredients.entries()) {
      const gapWidth = visibleIngredientIndexes.length > 0 ? 12 : 0;
      const nextWidth = occupiedWidth + gapWidth + (ingredientWidths[index] ?? 0);

      if (nextWidth <= ingredientsRowWidth) {
        visibleIngredientIndexes.push(index);
        occupiedWidth = nextWidth;
      } else {
        break;
      }
    }
  }

  return (
    <View style={styles.cardContainer}>
      <View style={styles.outerBorder}>
        <View style={styles.innerBorder}>
          <View style={styles.innerCardBorder}>
            <View style={styles.card}>
              <View style={styles.topSection}>
                <Image style={styles.coffeeCupImage}
                  source={beverageImages[beverageType]}
                  resizeMode="contain"
                />
              </View>
        <View style={styles.sectionDivider}>
          <View style={styles.sectionDividerBand} />
        </View>
        <View style={styles.bottomSection}>
          <View style={styles.details}>
            <View style={styles.detailsHeader}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.temperature}>
                {beverageType} · {temperature}
              </Text>
            </View>
            <View style={styles.divider}>
            </View>
            <View style={styles.contents}>
              <Text style={styles.contentsTitle}>
                {"Contents"}
              </Text>
              <View
                style={styles.ingredientsRow}
                onLayout={({ nativeEvent }) => setIngredientsRowWidth(nativeEvent.layout.width)}>
                {ingredients.map((ingredient, index) => visibleIngredientIndexes.includes(index) && (
                  <View
                    key={`${ingredient}-${index}`}
                    style={styles.ingredientPill}
                    onLayout={({ nativeEvent }) => {
                      const width = nativeEvent.layout.width;
                      setIngredientWidths((currentWidths) => (
                        currentWidths[index] === width
                          ? currentWidths
                          : { ...currentWidths, [index]: width }
                      ));
                    }}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 48,
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  outerBorder: {
    backgroundColor: '#b14e05',
    padding: 10,
    borderRadius: 10,
  },
  innerBorder: {
    backgroundColor: '#dc7b05',
    padding: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
  },
  innerCardBorder: {
    backgroundColor: '#853605',
    padding: 10,
  },
  topSection: {
    alignItems: 'center',
    backgroundColor: '#FFC97980',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 21,
  },
  topLeftAccent: {
    backgroundColor: '#D68F54',
    height: 470,
    marginBottom: 33,
    marginTop: 12,
    width: 10,
  },
  coffeeCupImage: {
    height: 335,
    marginTop: 50,
    marginBottom: 50,
    width: 308,
  },
  sectionDivider: {
    backgroundColor: '#853605',
    height: 30,
    marginHorizontal: -10,
    paddingVertical: 10,
  },
  sectionDividerBand: {
    backgroundColor: '#dc7b05',
    flex: 1,
  },
  topRightAccent: {
    backgroundColor: '#C47A48',
    height: 469,
    marginTop: 12,
    width: 15,
  },
  bottomSection: {
    alignItems: 'center',
    backgroundColor: '#FDC17580',
    flexDirection: 'row',
    paddingHorizontal: 21,
  },
  bottomLeftAccent: {
    backgroundColor: '#D68F54',
    height: 419,
    marginRight: 24,
    width: 10,
  },
  details: {
    flex: 1,
    marginRight: 24,
  },
  detailsHeader: {
    marginBottom: 38,
  },
  name: {
    color: '#000000',
    fontFamily: 'StardewFont',
    fontSize: 50,
    marginBottom: 10,
    marginTop: 20
  },
  temperature: {
    color: '#181818',
    fontFamily: 'StardewFont',
    fontSize: 32,
  },
  divider: {
    backgroundColor: '#853605',
    height: 2,
    marginBottom: 37,
  },
  contents: {
    marginRight: 73,
    marginBottom: 25,
  },
  contentsTitle: {
    color: '#181818',
    fontFamily: 'StardewFont',
    fontSize: 35,
    marginBottom: 18,
  },
  ingredientsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    overflow: 'hidden',
  },
  ingredientPill: {
    alignItems: 'center',
    borderColor: '#853605',
    borderRadius: 10,
    borderWidth: 2,
    height: 72,
    justifyContent: 'center',
    paddingHorizontal: 18,
    flexShrink: 0,
  },
  ingredientText: {
    color: '#3C3C43',
    fontFamily: 'StardewFont',
    fontSize: 27,
  },
  bottomRightAccent: {
    backgroundColor: '#C47A48',
    height: 414,
    width: 15,
  },
});
