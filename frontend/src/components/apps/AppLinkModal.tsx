import { Ionicons } from '@expo/vector-icons';

import { useEffect, useState } from 'react';

import {

  Modal,

  Pressable,

  StyleSheet,

  Text,

  TextInput,

  View,

} from 'react-native';

import { AppLinkItem } from '../../data/appsLinksCatalog';

import { useAuth } from '../../context/AuthContext';

import { getProfileLinks, removeProfileLink, saveProfileLink } from '../../services/profileLinksStorage';

import { syncUserProfile } from '../../services/profileSync';

import { colors, layout, spacing, typography } from '../../theme';

import { AppIconTile } from './AppIconTile';

import { OutlineButton } from '../ui/OutlineButton';

import { PrimaryButton } from '../ui/PrimaryButton';



type Props = {

  visible: boolean;

  item: AppLinkItem | null;

  onClose: () => void;

};



export function AppLinkModal({ visible, item, onClose }: Props) {

  const { user } = useAuth();

  const [value, setValue] = useState('');

  const [saving, setSaving] = useState(false);



  useEffect(() => {

    if (!item || !user) {

      setValue('');

      return;

    }

    void getProfileLinks(user.email).then((links) => {

      const found = links.find((l) => l.id === item.id);

      setValue(found?.value ?? '');

    });

  }, [item, user]);



  if (!item) return null;



  const { modal } = item;



  const handleClose = () => {

    setValue('');

    onClose();

  };



  const handleDelete = async () => {

    if (!user) return;

    setSaving(true);

    try {

      await removeProfileLink(user.email, item.id);

      const synced = await syncUserProfile(user);

      void synced;

      handleClose();

    } finally {

      setSaving(false);

    }

  };



  const handleSave = async () => {

    if (!user) return;

    setSaving(true);

    try {

      await saveProfileLink(user.email, {

        id: item.id,

        label: item.label,

        category: item.category,

        value: value.trim(),

        color: item.color,

      });

      await syncUserProfile(user);

      handleClose();

    } finally {

      setSaving(false);

    }

  };



  return (

    <Modal visible={visible} transparent animationType="fade">

      <Pressable style={styles.overlay} onPress={handleClose}>

        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>

          <View style={styles.badge}>

            <AppIconTile item={item} size={44} />

          </View>

          <View style={styles.header}>

            <Text style={styles.title}>{modal.title}</Text>

            {modal.showTitleEdit ? (

              <Ionicons name="pencil" size={18} color={colors.black} />

            ) : null}

          </View>

          <View style={styles.divider} />

          <TextInput

            style={styles.input}

            placeholder={modal.placeholder}

            placeholderTextColor={colors.placeholder}

            value={value}

            onChangeText={setValue}

            editable={!saving}

          />

          {modal.showUploadIcon ? (

            <OutlineButton

              title="Upload Icon"

              icon="pencil"

              style={styles.uploadBtn}

              onPress={() => {}}

            />

          ) : null}

          <View style={styles.actions}>

            <OutlineButton

              title="Delete"

              icon="trash-outline"

              style={styles.actionHalf}

              onPress={() => void handleDelete()}

            />

            <PrimaryButton

              title="Save"

              style={styles.actionHalf}

              onPress={() => void handleSave()}

            />

          </View>

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

    borderRadius: 20,

    padding: spacing.xl,

    width: '100%',

    maxWidth: 360,

    marginTop: spacing.lg,

  },

  badge: {

    position: 'absolute',

    top: -22,

    left: spacing.lg,

    borderRadius: 12,

    overflow: 'hidden',

    elevation: 2,

    shadowColor: colors.shadow,

    shadowOffset: { width: 0, height: 1 },

    shadowOpacity: 0.2,

    shadowRadius: 2,

  },

  header: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginTop: spacing.md,

    marginBottom: spacing.sm,

  },

  title: {

    ...typography.heading,

    color: colors.black,

  },

  divider: {

    height: 2,

    backgroundColor: colors.black,

    marginBottom: spacing.lg,

  },

  input: {

    height: 52,

    borderWidth: 1,

    borderColor: colors.border,

    borderRadius: layout.pillRadius,

    paddingHorizontal: spacing.lg,

    fontSize: 16,

    color: colors.black,

    marginBottom: spacing.md,

  },

  uploadBtn: {

    alignSelf: 'flex-end',

    marginBottom: spacing.lg,

    paddingHorizontal: spacing.md,

    height: 44,

  },

  actions: {

    flexDirection: 'row',

    gap: spacing.md,

  },

  actionHalf: {

    flex: 1,

  },

});


