import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { OutlineButton } from '../../components/ui/OutlineButton';
import { PillInput } from '../../components/ui/PillInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { ContactsStackParamList } from '../../navigation/types';
import { getContactById, saveContact } from '../../services/contactsStorage';
import { createContact } from '../../types/contact';
import { colors, layout, spacing } from '../../theme';

type Props = NativeStackScreenProps<ContactsStackParamList, 'EditContact'>;

export function EditContactScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const contactId = route.params?.contactId;
  const isNew = route.params?.mode === 'new' || !contactId;

  const [contactRecordId, setContactRecordId] = useState<string | undefined>(contactId);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const loadContact = useCallback(async () => {
    if (!user?.email || !contactId) return;
    const existing = await getContactById(user.email, contactId);
    if (!existing) return;
    setContactRecordId(existing.id);
    setFullName(existing.fullName);
    setMobile(existing.mobile);
    setEmail(existing.email);
    setJobTitle(existing.jobTitle);
    setOrganization(existing.organization);
    setLocation(existing.location);
  }, [contactId, user?.email]);

  useEffect(() => {
    if (contactId) {
      loadContact();
    }
  }, [contactId, loadContact]);

  const handleSave = async () => {
    if (!user?.email) {
      Alert.alert('Sign in required', 'Please sign in to save contacts.');
      return;
    }
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter a first and last name.');
      return;
    }

    try {
      const contact = createContact({
        id: contactRecordId,
        fullName,
        mobile,
        email,
        jobTitle,
        organization,
        location,
      });
      await saveContact(user.email, contact);
      navigation.goBack();
    } catch {
      Alert.alert('Save failed', 'Could not save this contact. Please try again.');
    }
  };

  return (
    <ScreenContainer scroll keyboardAvoid style={styles.flex}>
      <ScreenHeader
        title={isNew ? 'New Contact' : 'Edit Contact'}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.form}>
        <PillInput
          label="First & Last Name"
          placeholder="First & Last Name"
          floatingLabel={!isNew}
          value={fullName}
          onChangeText={setFullName}
        />
        <PillInput
          label="Mobile Number"
          placeholder="Mobile Number"
          floatingLabel={!isNew}
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
        />
        <PillInput
          label="Email"
          placeholder="Email"
          floatingLabel={!isNew}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <PillInput
          label="Job Title"
          placeholder="Job Title"
          value={jobTitle}
          onChangeText={setJobTitle}
        />
        <PillInput
          label="Organization/Company"
          placeholder="Organization/Company"
          value={organization}
          onChangeText={setOrganization}
        />
        <PillInput
          label="Location"
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />
        <OutlineButton title="Add More Details" style={styles.moreBtn} />
        <PrimaryButton
          title={isNew ? 'Save Contact' : 'Save Changes'}
          onPress={handleSave}
          style={styles.saveBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  form: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
  },
  moreBtn: {
    marginTop: spacing.sm,
  },
  saveBtn: {
    marginTop: spacing.lg,
  },
});
