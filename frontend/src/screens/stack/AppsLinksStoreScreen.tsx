import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppLinkModal } from '../../components/apps/AppLinkModal';
import { CategorySection } from '../../components/apps/CategorySection';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { SearchBar } from '../../components/ui/SearchBar';
import { APP_CATEGORIES, AppLinkItem, getAppsByCategory } from '../../data/appsLinksCatalog';
import { ProfileStackParamList } from '../../navigation/types';
import { colors, layout, spacing } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AppsLinksStore'>;

export function AppsLinksStoreScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AppLinkItem | null>(null);
  const byCategory = getAppsByCategory();

  const filterItem = (item: AppLinkItem) =>
    !search.trim() ||
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase());

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Apps & Links Store"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.search}>
        <SearchBar value={search} onChangeText={setSearch} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {APP_CATEGORIES.map((cat) => {
          const items = byCategory[cat]?.filter(filterItem) ?? [];
          if (items.length === 0) return null;
          return (
            <CategorySection
              key={cat}
              title={cat}
              items={items}
              onItemPress={setSelected}
            />
          );
        })}
      </ScrollView>
      <AppLinkModal
        visible={!!selected}
        item={selected}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: spacing.xl + 10,
  },
  search: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.md,
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },
});
