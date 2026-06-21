import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, layout, spacing, typography } from '../../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  purpose?: 'banner' | 'avatar';
  onCamera?: () => void | Promise<void>;
  onGallery?: () => void | Promise<void>;
};

export function ImagePickerModal({
  visible,
  onClose,
  purpose = 'avatar',
  onCamera,
  onGallery,
}: Props) {
  const title = purpose === 'banner' ? 'Edit cover photo' : 'Edit profile photo';

  const runPick = async (handler?: () => void | Promise<void>) => {
    if (!handler) {
      onClose();
      return;
    }
    await handler();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.options}>
            <Pressable style={styles.option} onPress={() => runPick(onCamera)}>
              <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.optionLabel}>Camera</Text>
            </Pressable>
            <Pressable style={styles.option} onPress={() => runPick(onGallery)}>
              <Ionicons name="images-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.optionLabel}>Gallery</Text>
            </Pressable>
          </View>
          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: layout.cardRadius + 4,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    ...typography.heading,
    color: colors.black,
    marginBottom: spacing.xl,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  option: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cancel: {
    alignSelf: 'flex-end',
  },
  cancelText: {
    ...typography.body,
    color: colors.black,
  },
});
