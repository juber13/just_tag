import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/ui/SearchBar';
import { useAuth } from '../../context/AuthContext';
import { ContactsStackParamList } from '../../navigation/types';
import {
  CONTACTS_SYNC_INTERVAL_MS,
  getCachedContacts,
  syncContactsFromServer,
} from '../../services/contactsStorage';
import { Contact } from '../../types/contact';
import { colors, layout, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<ContactsStackParamList, 'ContactsMain'>;

function ContactRow({ contact }: { contact: Contact }) {
  const initial = contact.fullName.trim().charAt(0).toUpperCase() || '?';
  const canReach = Boolean(contact.mobile?.trim());
  const mobile = contact.mobile?.trim();
  const email = contact.email?.trim();
  const jobLine =
    contact.jobTitle && contact.organization
      ? `${contact.jobTitle} · ${contact.organization}`
      : contact.jobTitle || contact.organization || '';

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowName} numberOfLines={1}>
          {contact.fullName}
        </Text>
        {jobLine ? (
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {jobLine}
          </Text>
        ) : null}
        {mobile ? (
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {mobile}
          </Text>
        ) : null}
        {email ? (
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {email}
          </Text>
        ) : null}
      </View>
      <View style={styles.rowActions}>
        <Pressable
          style={[styles.callButton, !canReach && styles.actionButtonDisabled]}
          onPress={() => callContact(contact.mobile)}
          disabled={!canReach}
          accessibilityRole="button"
          accessibilityLabel={`Call ${contact.fullName}`}
        >
          <Ionicons name="call" size={20} color={canReach ? colors.white : colors.textSecondary} />
        </Pressable>
        <Pressable
          style={[styles.whatsappButton, !canReach && styles.actionButtonDisabled]}
          onPress={() => messageOnWhatsApp(contact.mobile)}
          disabled={!canReach}
          accessibilityRole="button"
          accessibilityLabel={`WhatsApp ${contact.fullName}`}
        >
          <Ionicons
            name="logo-whatsapp"
            size={22}
            color={canReach ? colors.white : colors.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
}

async function callContact(mobile: string) {
  const phone = mobile.trim().replace(/[^\d+]/g, '');
  if (!phone) {
    Alert.alert('No phone number', 'This contact has no mobile number.');
    return;
  }

  const url = `tel:${phone}`;
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Cannot call', 'Phone calls are not supported on this device.');
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert('Call failed', 'Could not open the phone app.');
  }
}

function whatsappPhone(mobile: string): string {
  let digits = mobile.trim().replace(/\D/g, '');
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10) digits = `91${digits}`;
  return digits;
}

async function messageOnWhatsApp(mobile: string) {
  const phone = whatsappPhone(mobile);
  if (!phone) {
    Alert.alert('No phone number', 'This contact has no mobile number for WhatsApp.');
    return;
  }

  const url = `https://wa.me/${phone}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('WhatsApp failed', 'Could not open WhatsApp. Is it installed?');
  }
}

export function ContactsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'>('all');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  const refreshFromServer = useCallback(async (options?: { showSpinner?: boolean }) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (options?.showSpinner) setSyncing(true);
    try {
      const list = await syncContactsFromServer();
      setContacts(list);
    } finally {
      syncingRef.current = false;
      if (options?.showSpinner) setSyncing(false);
      setLoading(false);
    }
  }, []);

  const loadContacts = useCallback(async () => {
    const cached = await getCachedContacts();
    if (cached.length > 0) {
      setContacts(cached);
      setLoading(false);
      await refreshFromServer();
      return;
    }

    setLoading(true);
    await refreshFromServer({ showSpinner: true });
  }, [refreshFromServer]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      loadContacts();

      const intervalId = setInterval(() => {
        if (active) refreshFromServer();
      }, CONTACTS_SYNC_INTERVAL_MS);

      return () => {
        active = false;
        clearInterval(intervalId);
      };
    }, [loadContacts, refreshFromServer]),
  );

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return contacts.filter((contact) => {
      if (!query) return true;
      const haystack = [
        contact.fullName,
        contact.mobile,
        contact.email,
        contact.jobTitle,
        contact.organization,
        contact.location,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [contacts, search]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
      <Text style={styles.title}>Contacts</Text>
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <SearchBar value={search} onChangeText={setSearch} />
        </View>
        <Pressable
          style={styles.refresh}
          onPress={() => refreshFromServer({ showSpinner: true })}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator size="small" color={colors.black} />
          ) : (
            <Ionicons name="refresh" size={26} color={colors.black} />
          )}
        </Pressable>
      </View>
      <View style={styles.filters}>
        <Pressable
          style={[styles.chip, styles.chipOutline]}
          onPress={() => navigation.navigate('EditContact', { mode: 'new' })}
        >
          <Ionicons name="add" size={18} color={colors.black} />
          <Text style={styles.chipText}>New</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, filter === 'all' && styles.chipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.chipText, filter === 'all' && styles.chipTextActive]}>
            All
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.black} />
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ContactRow contact={item} />}
          contentContainerStyle={
            filteredContacts.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {user?.email ? 'No contacts yet' : 'Sign in to save contacts'}
              </Text>
              <Text style={styles.emptyHint}>
                {user?.email
                  ? 'Contacts from your profile page will appear here. Tap refresh to sync.'
                  : 'Contacts you add will appear here.'}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: layout.screenPadding,
  },
  title: {
    ...typography.screenTitle,
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchWrap: {
    flex: 1,
  },
  refresh: {
    padding: spacing.sm,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: layout.pillRadius,
    gap: 4,
  },
  chipOutline: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.black,
  },
  chipText: {
    ...typography.bodyBold,
    color: colors.black,
  },
  chipTextActive: {
    color: colors.white,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  emptyList: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  emptyTitle: {
    ...typography.bodyBold,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.summaryCardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.bodyBold,
    color: colors.black,
    fontSize: 18,
  },
  rowBody: {
    flex: 1,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowName: {
    ...typography.bodyBold,
    color: colors.black,
  },
  rowSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: colors.summaryCardBg,
  },
});
