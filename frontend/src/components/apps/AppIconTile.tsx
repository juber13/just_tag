import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppLinkItem } from '../../data/appsLinksCatalog';
import { colors, layout, spacing, typography } from '../../theme';

type Props = {
  item: AppLinkItem;
  size?: number;
  onPress?: () => void;
  showLabel?: boolean;
  layout?: 'grid' | 'inline';
  saved?: boolean;
};

export function AppIconTile({
  item,
  size = layout.iconSize,
  onPress,
  showLabel = true,
  layout: tileLayout = 'grid',
  saved = false,
}: Props) {
  const content = (
    <>
      <View style={styles.tileWrap}>
        <View
          style={[
            styles.tile,
            {
              width: size,
              height: size,
              borderRadius: size <= 32 ? 10 : 14,
              backgroundColor: item.color,
              borderWidth: item.color === '#FFFFFF' ? 1 : 0,
              borderColor: colors.border,
            },
          ]}
        >
        {item.iconName ? (
          <Ionicons
            name={item.iconName as keyof typeof Ionicons.glyphMap}
            size={size * 0.45}
            color={item.color === '#FFFFFF' ? colors.black : colors.white}
          />
        ) : (
          <Text
            style={[
              styles.letter,
              {
                color: item.color === '#F5EFE6' || item.color === '#FFFFFF'
                  ? colors.black
                  : colors.white,
                fontSize: item.letter && item.letter.length > 1 ? 14 : 22,
              },
            ]}
          >
            {item.letter ?? item.label[0]}
          </Text>
        )}
        </View>
        {saved ? (
          <View style={styles.savedBadge}>
            <Ionicons name="checkmark" size={10} color={colors.white} />
          </View>
        ) : null}
      </View>
      {showLabel ? (
        <Text style={styles.label} numberOfLines={1}>
          {item.label}
        </Text>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable style={[styles.wrap, tileLayout === 'inline' && styles.wrapInline]} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.wrap, tileLayout === 'inline' && styles.wrapInline]}>{content}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  wrapInline: {
    width: 'auto',
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  tileWrap: {
    position: 'relative',
  },
  savedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.toggleGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: '700',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
