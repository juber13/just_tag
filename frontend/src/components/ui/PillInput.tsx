import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, layout, spacing, typography } from '../../theme';

type Props = TextInputProps & {
  label?: string;
  floatingLabel?: boolean;
  showPasswordToggle?: boolean;
};

export function PillInput({
  label,
  floatingLabel,
  showPasswordToggle,
  secureTextEntry,
  style,
  ...rest
}: Props) {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);
  const isSecure = showPasswordToggle ? hidden : secureTextEntry;

  return (
    <View style={styles.wrapper}>
      {label && !floatingLabel ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
      <View style={styles.inputWrap}>
        {floatingLabel && label ? (
          <View style={styles.floatingLabel}>
            <Text style={styles.floatingText}>{label}</Text>
          </View>
        ) : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={isSecure}
          {...rest}
        />
        {showPasswordToggle ? (
          <Pressable
            style={styles.eye}
            onPress={() => setHidden((v) => !v)}
            hitSlop={8}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={colors.black}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  inputWrap: {
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    zIndex: 1,
  },
  floatingText: {
    fontSize: 12,
    color: colors.placeholder,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.pillRadius,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: colors.black,
    textAlign: 'center',
    backgroundColor: colors.white,
  },
  eye: {
    position: 'absolute',
    right: spacing.md,
    top: 14,
  },
});
