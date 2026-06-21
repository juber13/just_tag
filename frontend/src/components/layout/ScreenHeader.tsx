import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, layout, spacing, typography } from '../../theme';

type Props = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  left?: ReactNode;
  showBack?: boolean;
};

export function ScreenHeader({
  title,
  onBack,
  right,
  left,
  showBack = true,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {left ??
          (showBack && onBack ? (
            <Pressable onPress={onBack} hitSlop={12}>
              <Ionicons name="chevron-back" size={28} color={colors.black} />
            </Pressable>
          ) : (
            <View style={styles.placeholder} />
          ))}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side}>{right ?? <View style={styles.placeholder} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  side: {
    width: 40,
    alignItems: 'flex-start',
  },
  placeholder: {
    width: 28,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    ...typography.screenTitle,
    color: colors.black,
  },
});
