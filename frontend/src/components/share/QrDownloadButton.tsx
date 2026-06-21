import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme';

type Props = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function QrDownloadButton({ onPress, disabled = false, loading = false }: Props) {
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel="Download QR code"
      style={({ pressed }) => [
        styles.button,
        inactive && styles.buttonDisabled,
        pressed && !inactive && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.black} size="small" />
      ) : (
        <Ionicons name="download-outline" size={20} color={colors.black} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: colors.white,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});
