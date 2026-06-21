import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppLinkModal } from '../../components/apps/AppLinkModal';
import { CategorySection } from '../../components/apps/CategorySection';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { SearchBar } from '../../components/ui/SearchBar';
import { APP_CATEGORIES, AppLinkItem, getAppsByCategory } from '../../data/appsLinksCatalog';
import { useAuth } from '../../context/AuthContext';
import { ProfileStackParamList } from '../../navigation/types';
import { getProfileLinks } from '../../services/profileLinksStorage';
import { colors, layout, spacing } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AppsLinksStore'>;

export function AppsLinksStoreScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AppLinkItem | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const byCategory = getAppsByCategory();

  const loadSavedIds = useCallback(async () => {
    if (!user?.email) {
      setSavedIds(new Set());
      return;
    }
    const links = await getProfileLinks(user.email);
    const ids = new Set(links.filter((l) => l.value.trim()).map((l) => l.id));
    setSavedIds(ids);
  }, [user?.email]);

  useFocusEffect(
    useCallback(() => {
      void loadSavedIds();
    }, [loadSavedIds]),
  );

  const filterItem = (item: AppLinkItem) =>
    !search.trim() ||
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase());

  const handleModalClose = () => {
    setSelected(null);
    void loadSavedIds();
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Apps & Links Store" onBack={() => navigation.goBack()} />
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
              savedIds={savedIds}
            />
          );
        })}
      </ScrollView>
      <AppLinkModal
        visible={!!selected}
        item={selected}
        onClose={handleModalClose}
        onSaved={loadSavedIds}
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
