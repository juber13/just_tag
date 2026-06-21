import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { OutlineButton } from '../../components/ui/OutlineButton';
import { PillInput } from '../../components/ui/PillInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/types';
import { colors, layout, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const { signIn, signInWithProvider } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter your email.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Invalid password', 'Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn({ email, password });
    } catch (e) {
      Alert.alert('Sign in failed', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocial = async (method: 'facebook' | 'google') => {
    setSubmitting(true);
    try {
      await signInWithProvider(method);
    } catch (e) {
      Alert.alert('Sign in failed', e instanceof Error ? e.message : 'Try again.');
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
      <View style={styles.form}>
        <PillInput
          label="Email ID"
          placeholder="Email ID"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <PillInput
          label="Password"
          placeholder="Must be at least 6 characters"
          showPasswordToggle
          value={password}
          onChangeText={setPassword}
        />
        <Text style={styles.forgot}>Forgot Password</Text>
        <PrimaryButton
          title={submitting ? 'Signing in…' : 'Sign In'}
          onPress={handleSignIn}
          style={styles.signInBtn}
        />
        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>
        <PrimaryButton
          title="SIGN IN WITH FACEBOOK"
          variant="blue"
          onPress={() => handleSocial('facebook')}
          style={styles.socialBtn}
        />
        <OutlineButton
          title="SIGN IN WITH GOOGLE"
          onPress={() => handleSocial('google')}
          style={styles.socialBtn}
        />
        <Text style={styles.legal}>
          By continuing, you agree to accept our Privacy Policy & Terms of Use
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPadding,
  },
  form: {
    marginTop: spacing.xl,
  },
  forgot: {
    ...typography.body,
    color: colors.black,
    textAlign: 'right',
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  signInBtn: {
    marginBottom: spacing.lg,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    marginHorizontal: spacing.md,
    ...typography.caption,
    color: colors.black,
  },
  socialBtn: {
    marginBottom: spacing.md,
  },
  legal: {
    ...typography.caption,
    color: colors.black,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
