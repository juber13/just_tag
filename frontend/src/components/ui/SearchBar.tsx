import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors, layout, spacing } from '../../theme';

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
}: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
      />
      <Ionicons name="search" size={22} color={colors.black} style={styles.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.pillRadius,
    height: 48,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  icon: {
    marginLeft: spacing.sm,
  },
});
