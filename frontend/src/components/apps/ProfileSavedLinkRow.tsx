import { StyleSheet, Switch, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { AppLinkItem, getAppLinkItem } from '../../data/appsLinksCatalog';
import { SavedProfileLink } from '../../types/profile';
import { colors, layout, spacing, typography } from '../../theme';
import { AppIconTile } from './AppIconTile';

type Props = {
  link: SavedProfileLink;
  onToggle: (enabled: boolean) => void;
  onDrag?: () => void;
  isDragging?: boolean;
};

function toAppLinkItem(link: SavedProfileLink): AppLinkItem {
  const catalogItem = getAppLinkItem(link.id);
  if (catalogItem) return catalogItem;
  return {
    id: link.id,
    label: link.label,
    category: link.category,
    color: link.color,
    modal: { title: link.label, placeholder: '' },
  };
}

function DragGrip() {
  return (
    <View style={styles.grip}>
      {[0, 1].map((col) => (
        <View key={col} style={styles.gripCol}>
          {[0, 1, 2].map((row) => (
            <View key={row} style={styles.gripDot} />
          ))}
        </View>
      ))}
    </View>
  );
}

export function ProfileSavedLinkRow({ link, onToggle, onDrag, isDragging }: Props) {
  const item = toAppLinkItem(link);
  const enabled = link.enabled !== false;

  return (
    <View style={[styles.row, isDragging && styles.rowDragging]}>
      {onDrag ? (
        <TouchableOpacity
          onLongPress={onDrag}
          delayLongPress={120}
          style={styles.dragHandle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Reorder ${link.label}`}
        >
          <DragGrip />
        </TouchableOpacity>
      ) : null}
      <AppIconTile item={item} size={28} showLabel={false} layout="inline" />
      <View style={styles.info}>
        <Text style={styles.label} numberOfLines={1}>
          {link.label}
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: colors.borderLight, true: colors.toggleGreen }}
        thumbColor={colors.white}
        style={styles.switch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: layout.cardRadius,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    minHeight: 40,
  },
  rowDragging: {
    opacity: 0.92,
    elevation: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  dragHandle: {
    paddingHorizontal: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grip: {
    flexDirection: 'row',
    gap: 2,
    paddingVertical: 1,
  },
  gripCol: {
    gap: 2,
  },
  gripDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textSecondary,
    opacity: 0.55,
  },
  info: { flex: 1, minWidth: 0 },
  label: { ...typography.bodyBold, fontSize: 14, color: colors.black },
  switch: { transform: [{ scaleX: 0.72 }, { scaleY: 0.72 }] },
});