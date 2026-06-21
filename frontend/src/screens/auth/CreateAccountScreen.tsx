import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { PillInput } from '../../components/ui/PillInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/types';
import { colors, layout, spacing, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateAccount'>;

export function CreateAccountScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!fullName.trim()) {
      Alert.alert('Missing name', 'Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter your email.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Invalid password', 'Password must be at least 6 characters.');
      return;
    }
    if (!accepted) {
      Alert.alert('Terms required', 'Please accept the terms of use and privacy policy.');
      return;
    }

    setSubmitting(true);
    try {
      await signUp({ fullName, mobile, email, password });
    } catch (e) {
      Alert.alert('Could not create account', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll keyboardAvoid contentStyle={styles.content}>
      <ScreenHeader
        title="JUSTAGG"
        onBack={() => navigation.goBack()}
        showBack
      />
      <Text style={styles.title}>Create Account</Text>
      <PillInput
        label="Full Name"
        placeholder="Full Name"
        floatingLabel
        value={fullName}
        onChangeText={setFullName}
      />
      <PillInput
        label="Mobile Number"
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        value={mobile}
        onChangeText={setMobile}
      />
      <PillInput
        label="Email"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <PillInput
        label="Password"
        placeholder="Must be at least 6 characters."
        showPasswordToggle
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.checkRow} onPress={() => setAccepted((v) => !v)}>
        <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
          {accepted ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
        </View>
        <Text style={styles.checkText}>
          I accept the terms of use and privacy policy.
        </Text>
      </Pressable>
      <PrimaryButton
        title={submitting ? 'Creating…' : 'Create Account'}
        onPress={handleCreate}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.title,
    color: colors.black,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: colors.black,
  },
  checkText: {
    flex: 1,
    ...typography.caption,
    color: colors.black,
  },
});
