import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getBeverages } from '@/api/api';
import BeverageCard from '@/components/beverage-card';
import BeverageFilters from '@/components/beverage-filters';
import { Text } from '@/components/text';
import { useTheme } from '@/hooks/use-theme';
import type { PageParams } from '@/types/api-wrappers';
import type { Beverage, BeverageFilters as Filters } from '@/types/sc-entities';

const PAGE_SIZE = 20;

// Sorted server-side so page boundaries stay stable as beverages are added.
const firstPageParams: PageParams = { page: 0, size: PAGE_SIZE, sort: 'name,asc' };

const noFilters: Filters = { types: [], temperatures: [], contentIds: [] };

export default function HomeScreen() {
  const theme = useTheme();
  const listRef = useRef<FlatList<Beverage>>(null);
  const [filters, setFilters] = useState<Filters>(noFilters);
  const hasFilters = Object.values(filters).some((values) => values.length > 0);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useInfiniteQuery({
    // One cache entry per filter combination holds every page loaded so far, so
    // pages already fetched are never re-requested while the query is fresh
    // (staleTime is 5m).
    queryKey: ['beverages', firstPageParams, filters],
    queryFn: ({ pageParam }) => getBeverages(pageParam, filters),
    initialPageParam: firstPageParams,
    getNextPageParam: (lastPage) => lastPage.nextPageParams ?? undefined,
    // Keep showing the current results while a new filter loads, instead of
    // swapping the list for a spinner on every tap.
    placeholderData: keepPreviousData,
  });

  const beverages = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const loadNextPage = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const changeFilters = (nextFilters: Filters) => {
    setFilters(nextFilters);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const header = (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>Stardrop Cafe</Text>
      <Text style={styles.title}>Coffee menu</Text>
    </View>
  );

  const renderBody = () => {
    if (isPending) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.text} size="large" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={[styles.message, { color: theme.text }]}>Could not load the menu.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => refetch()}
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          >
            <Text style={[styles.retryText, { color: theme.text }]}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <FlatList
        ref={listRef}
        contentContainerStyle={styles.content}
        data={beverages}
        keyExtractor={(beverage) => beverage.id}
        //ListHeaderComponent={header}
        ListEmptyComponent={
          <Text style={[styles.message, { color: theme.text }]}>
            {hasFilters ? 'No beverages match these filters.' : 'No beverages on the menu yet.'}
          </Text>
        }
        ListFooterComponent={
          isFetchingNextPage
            ? <ActivityIndicator color={theme.text} style={styles.footerSpinner} />
            : null
        }
        renderItem={({ item }) => (
          <BeverageCard
            recipeId={item.recipeId}
            name={item.name}
            beverageType={item.type}
            temperature={item.temperature}
            // The backend serializes contents as a set, so order isn't guaranteed.
            ingredients={item.beverageContents.map((content) => content.name).sort()}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReached={loadNextPage}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <BeverageFilters filters={filters} onChange={changeFilters}>
        {renderBody()}
      </BeverageFilters>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  message: {
    fontSize: 18,
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
  footerSpinner: {
    marginVertical: 24,
  },
  separator: {
    height: 14,
  },
});
