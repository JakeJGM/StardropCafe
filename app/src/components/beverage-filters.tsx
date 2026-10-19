import { useQuery } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { getBeverageContents, getBeverageOptions } from '@/api/api';
import { Text } from '@/components/text';
import type { BeverageFilters as Filters } from '@/types/sc-entities';

type Category = keyof Filters;

type FilterOption = {
  value: string;
  label: string;
};

export type BeverageFiltersProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  // The list being filtered; an open dropdown is drawn over it.
  children: ReactNode;
  // Shown at the start of the bar, before the filters, and doesn't scroll with them.
  leading?: ReactNode;
};

const categories: readonly { key: Category; label: string }[] = [
  { key: 'types', label: 'Type' },
  { key: 'temperatures', label: 'Temperature' },
  { key: 'contentIds', label: 'Contents' },
];

export default function BeverageFilters({ filters, onChange, children, leading }: BeverageFiltersProps) {
  const [openCategory, setOpenCategory] = useState<Category | null>(null);
  const [barHeight, setBarHeight] = useState(0);

  const optionsQuery = useQuery({ queryKey: ['beverage-options'], queryFn: getBeverageOptions });
  const contentsQuery = useQuery({ queryKey: ['beverage-contents'], queryFn: getBeverageContents });

  const optionsByCategory: Record<Category, FilterOption[] | undefined> = {
    types: optionsQuery.data?.types.map((type) => ({ value: type, label: type })),
    temperatures: optionsQuery.data?.temperatures.map((temperature) => ({ value: temperature, label: temperature })),
    contentIds: contentsQuery.data?.map((content) => ({ value: content.id, label: content.name })),
  };
  const queryByCategory = { types: optionsQuery, temperatures: optionsQuery, contentIds: contentsQuery };

  const toggleOption = (category: Category, value: string) => {
    const selected = filters[category];
    const next = selected.includes(value)
      ? selected.filter((selectedValue) => selectedValue !== value)
      : [...selected, value];
    // Sorted so the same selection always maps to the same query key.
    onChange({ ...filters, [category]: next.sort() });
  };

  const renderDropdown = (category: Category) => {
    const options = optionsByCategory[category];
    const query = queryByCategory[category];

    if (options === undefined) {
      return (
        <View style={styles.dropdownMessage}>
          {query.isError ? (
            <>
              <Text style={styles.dropdownMessageText}>Could not load filters.</Text>
              <Pressable accessibilityRole="button" onPress={() => query.refetch()} style={styles.dropdownAction}>
                <Text style={styles.dropdownActionText}>Try again</Text>
              </Pressable>
            </>
          ) : (
            <ActivityIndicator color="#853605" />
          )}
        </View>
      );
    }

    if (options.length === 0) {
      return (
        <View style={styles.dropdownMessage}>
          <Text style={styles.dropdownMessageText}>Nothing to filter by yet.</Text>
        </View>
      );
    }

    const selected = filters[category];
    const canClear = selected.length > 0;
    return (
      <>
        <ScrollView
          style={styles.optionList}
          contentContainerStyle={styles.optionListContent}
          bounces={false}
        >
          {options.map((option) => {
            const checked = selected.includes(option.value);
            return (
              <Pressable
                key={option.value}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                onPress={() => toggleOption(category, option.value)}
                style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              >
                <View style={styles.checkbox}>
                  {checked && <View style={styles.checkboxFill} />}
                </View>
                <Text style={styles.optionText}>{option.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {/* Always laid out and only hidden, so showing it never resizes the dropdown. */}
        <Pressable
          accessibilityRole="button"
          accessibilityElementsHidden={!canClear}
          importantForAccessibility={canClear ? 'auto' : 'no-hide-descendants'}
          aria-hidden={!canClear}
          disabled={!canClear}
          onPress={() => onChange({ ...filters, [category]: [] })}
          style={({ pressed }) => [styles.clearAction, !canClear && styles.hidden, pressed && styles.pressed]}
        >
          <Text style={styles.dropdownActionText}>Clear</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setOpenCategory(null)}
          style={({ pressed }) => [styles.okAction, pressed && styles.pressed]}
        >
          <Text style={styles.dropdownActionText}>Ok</Text>
        </Pressable>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.bar} onLayout={({ nativeEvent }) => setBarHeight(nativeEvent.layout.height)}>
        {leading !== undefined && <View style={styles.leading}>{leading}</View>}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.barScroll}
          contentContainerStyle={[styles.pills, leading !== undefined && styles.pillsAfterLeading]}
        >
          {categories.map(({ key, label }) => {
            const selectedCount = filters[key].length;
            const isOpen = openCategory === key;
            const isActive = isOpen || selectedCount > 0;
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={`${label} filter${selectedCount > 0 ? `, ${selectedCount} selected` : ''}`}
                accessibilityState={{ expanded: isOpen }}
                onPress={() => setOpenCategory(isOpen ? null : key)}
                style={({ pressed }) => [styles.pill, isActive && styles.pillActive, pressed && styles.pressed]}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{label}</Text>
                {/* Fixed width fits one digit, so a count appearing doesn't resize the pill. */}
                <Text style={[styles.pillText, styles.pillCount, isActive && styles.pillTextActive]} numberOfLines={1}>
                  {selectedCount > 0 ? `(${selectedCount})` : ''}
                </Text>
                <View style={[styles.chevron, isActive && styles.chevronActive, isOpen && styles.chevronOpen]} />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {children}

      {/* Drawn at this level rather than inside the bar, since Android ignores
          touches on children that fall outside their parent's bounds. */}
      {openCategory !== null && (
        <View style={[styles.overlay, { top: barHeight }]}>
          <Pressable
            accessibilityLabel="Close filter"
            onPress={() => setOpenCategory(null)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.dropdownOuterBorder}>
            <View style={styles.dropdownInnerBorder}>
              <View style={styles.dropdown}>{renderDropdown(openCategory)}</View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Without flexShrink: 0, a tall list below squeezes the bar to nothing.
  bar: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    maxWidth: 720,
    paddingBottom: 12,
    paddingTop: 16,
    width: '100%',
  },
  leading: {
    paddingLeft: 24,
  },
  // The pills stay one row and scroll sideways once selection counts widen them.
  barScroll: {
    flex: 1,
  },
  pills: {
    gap: 8,
    paddingHorizontal: 24,
  },
  pillsAfterLeading: {
    paddingLeft: 12,
  },
  pressed: {
    opacity: 0.65,
  },
  // Matches the Contents pills on the beverage card, scaled down for a toolbar.
  pill: {
    alignItems: 'center',
    backgroundColor: '#FFE6B7',
    borderColor: '#853605',
    borderRadius: 10,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 6,
    height: 44,
    paddingHorizontal: 10,
  },
  pillActive: {
    backgroundColor: '#853605',
  },
  pillText: {
    color: '#3C3C43',
    fontSize: 18,
  },
  pillCount: {
    width: 18,
  },
  pillTextActive: {
    color: '#FFE6B7',
  },
  // A downward triangle drawn with borders, since the pixel font has no arrow glyph.
  chevron: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 5,
    borderRightColor: 'transparent',
    borderRightWidth: 5,
    borderTopColor: '#853605',
    borderTopWidth: 6,
    height: 0,
    width: 0,
  },
  chevronActive: {
    borderTopColor: '#FFE6B7',
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  dropdownOuterBorder: {
    width: '100%',
    maxWidth: 672,
    alignSelf: 'center',
    backgroundColor: '#b14e05',
    borderRadius: 10,
    padding: 4,
  },
  dropdownInnerBorder: {
    backgroundColor: '#853605',
    padding: 4,
  },
  dropdown: {
    backgroundColor: '#FFE6B7',
    paddingVertical: 8,
  },
  // The minimum keeps Clear and Ok from overlapping when there's only one option.
  optionList: {
    minHeight: 80,
    maxHeight: 320,
  },
  // Keeps labels clear of the Clear and Ok buttons in the right-hand corners.
  optionListContent: {
    paddingRight: 72,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#853605',
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxFill: {
    backgroundColor: '#853605',
    height: 12,
    width: 12,
  },
  optionText: {
    color: '#3C3C43',
    fontSize: 22,
  },
  dropdownMessage: {
    alignItems: 'center',
    padding: 16,
  },
  dropdownMessageText: {
    color: '#3C3C43',
    fontSize: 20,
    textAlign: 'center',
  },
  clearAction: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  okAction: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  hidden: {
    opacity: 0,
  },
  dropdownAction: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dropdownActionText: {
    color: '#853605',
    fontFamily: 'StardewFontBold',
    fontSize: 20,
  },
});
