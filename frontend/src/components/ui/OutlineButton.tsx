import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, layout, spacing, typography } from '../../theme';

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
};

export function OutlineButton({
  title,
  onPress,
  style,
  icon,
  iconColor = colors.black,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
      onPress={onPress}
    >
      {icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
      ) : null}
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: layout.pillRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    marginRight: spacing.sm,
  },
  text: {
    ...typography.bodyBold,
    color: colors.black,
  },
});
