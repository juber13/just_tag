import { StyleSheet, Text, View } from 'react-native';
import { AppLinkItem } from '../../data/appsLinksCatalog';
import { colors, layout, spacing, typography } from '../../theme';
import { AppIconTile } from './AppIconTile';

type Props = {
  title: string;
  items: AppLinkItem[];
  onItemPress: (item: AppLinkItem) => void;
  savedIds?: Set<string>;
};

export function CategorySection({ title, items, onItemPress, savedIds }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <AppIconTile
            key={item.id}
            item={item}
            onPress={() => onItemPress(item)}
            saved={savedIds?.has(item.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    color: colors.black,
    marginBottom: spacing.md,
    paddingHorizontal: layout.screenPadding,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: layout.screenPadding - spacing.xs,
  },
});
