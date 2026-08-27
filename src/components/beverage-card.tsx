import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export type BeverageCardProps = {
  name: string;
  temperature: 'Iced' | 'Hot';
  ingredients: readonly string[];
};

export default function BeverageCard({ name, temperature, ingredients }: BeverageCardProps) {
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
        <View style={styles.card}>
          <View style={styles.topSection}>
            <View style={styles.topLeftAccent}>
            </View>
            <Image style={styles.centerImage}
              source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/okovP8RcFA/2n57nagz_expires_30_days.png"}} 
              resizeMode = {"stretch"}
            />
            <View style={styles.topRightAccent}>
            </View>
          </View>
          <View style={styles.bottomSection}>
            <View style={styles.bottomLeftAccent}>
            </View>
            <View style={styles.details}>
              <View style={styles.detailsHeader}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.temperature}>
                  {temperature}
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
            <View style={styles.bottomRightAccent}>
            </View>
          </View>
        </View>
        <Image style={styles.leftBorder}
          source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/okovP8RcFA/chkb6aj3_expires_30_days.png"}} 
          resizeMode = {"stretch"}
        />
        <Image style={styles.rightBorder}
          source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/okovP8RcFA/b8h2u6zo_expires_30_days.png"}} 
          resizeMode = {"stretch"}
        />
        <Image style={styles.topBorder}
          source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/okovP8RcFA/i3altrhd_expires_30_days.png"}} 
          resizeMode = {"stretch"}
        />
        <Image style={styles.bottomBorder}
          source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/okovP8RcFA/g28mu4ts_expires_30_days.png"}} 
          resizeMode = {"stretch"}
        />
        <Image style={styles.middleBorder}
          source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/okovP8RcFA/40xgnh32_expires_30_days.png"}} 
          resizeMode = {"stretch"}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 48,
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 27,
  },
  topSection: {
    backgroundColor: '#FFC97980',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 21,
  },
  topLeftAccent: {
    backgroundColor: '#D68F54',
    height: 470,
    marginBottom: 33,
    marginTop: 12,
    width: 10,
  },
  centerImage: {
    height: 335,
    marginTop: 90,
    width: 308,
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
    fontSize: 41,
    marginBottom: 9,
  },
  temperature: {
    color: '#181818',
    fontSize: 32,
  },
  divider: {
    backgroundColor: '#344E43',
    height: 2,
    marginBottom: 37,
  },
  contents: {
    marginRight: 73,
  },
  contentsTitle: {
    color: '#181818',
    fontSize: 32,
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
    borderColor: '#344E43',
    borderRadius: 232,
    borderWidth: 2,
    height: 72,
    justifyContent: 'center',
    paddingHorizontal: 18,
    flexShrink: 0,
  },
  ingredientText: {
    color: '#3C3C43',
    fontSize: 27,
  },
  bottomRightAccent: {
    backgroundColor: '#C47A48',
    height: 414,
    width: 15,
  },
  leftBorder: {
    bottom: 0,
    flex: 1,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 43,
    zIndex: 2,
  },
  rightBorder: {
    bottom: 0,
    flex: 1,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 43,
  },
  topBorder: {
    left: 33,
    position: 'absolute',
    right: 33,
    top: 0,
    height: 40,
  },
  bottomBorder: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    height: 38,
  },
  middleBorder: {
    bottom: 448,
    left: 0,
    position: 'absolute',
    right: 0,
    height: 38,
  },
});
