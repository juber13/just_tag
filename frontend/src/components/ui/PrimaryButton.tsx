import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, layout, spacing, typography } from '../../theme';

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'black' | 'blue';
};

export function PrimaryButton({
  title,
  onPress,
  style,
  variant = 'black',
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        variant === 'blue' && styles.blue,
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: layout.pillRadius,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  blue: {
    backgroundColor: colors.primaryBlue,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    ...typography.bodyBold,
    color: colors.white,
  },
});
