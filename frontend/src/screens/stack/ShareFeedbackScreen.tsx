import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { MenuStackParamList } from '../../navigation/types';
import { openFeedbackEmail } from '../../services/feedbackMail';
import { saveFeedback } from '../../services/feedbackStorage';
import {
  createFeedbackEntry,
  FEEDBACK_CATEGORIES,
  FeedbackCategory,
} from '../../types/feedback';
import { colors, layout, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MenuStackParamList, 'ShareFeedback'>;

const MIN_MESSAGE_LENGTH = 10;
const STAR_COUNT = 5;

export function ShareFeedbackScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [category, setCategory] = useState<FeedbackCategory>('general');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1) {
      Alert.alert('Rating required', 'Please tap a star rating before submitting.');
      return;
    }
    if (message.trim().length < MIN_MESSAGE_LENGTH) {
      Alert.alert(
        'More detail needed',
        `Please write at least ${MIN_MESSAGE_LENGTH} characters in your feedback.`,
      );
      return;
    }

    const ownerEmail = user?.email?.trim() || user?.mobile?.trim() || 'guest@justagg.local';
    const entry = createFeedbackEntry({
      userEmail: ownerEmail,
      userName: user?.fullName ?? 'Guest',
      category,
      rating,
      message,
    });

    setSubmitting(true);
    try {
      await saveFeedback(entry);
      const emailOpened = await openFeedbackEmail(entry);

      Alert.alert(
        'Thank you!',
        emailOpened
          ? 'Your feedback was saved. Your email app opened so you can send it to our team.'
          : 'Your feedback was saved. We appreciate you helping us improve Justagg.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert('Submission failed', 'Could not save your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll keyboardAvoid style={styles.root}>
      <ScreenHeader title="Share Feedback" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={styles.intro}>
          Tell us what is working well or what we should improve. Your message is saved on this
          device and you can send it to our team via email.
        </Text>

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {FEEDBACK_CATEGORIES.map((item) => {
            const selected = category === item.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setCategory(item.id)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Rating</Text>
        <View style={styles.stars}>
          {Array.from({ length: STAR_COUNT }, (_, i) => {
            const value = i + 1;
            const filled = value <= rating;
            return (
              <Pressable
                key={value}
                onPress={() => setRating(value)}
                hitSlop={8}
                accessibilityLabel={`${value} star${value === 1 ? '' : 's'}`}
              >
                <Ionicons
                  name={filled ? 'star' : 'star-outline'}
                  size={36}
                  color={filled ? colors.primaryBlue : colors.borderLight}
                />
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.ratingHint}>
          {rating > 0 ? `${rating} of ${STAR_COUNT} stars` : 'Tap a star to rate your experience'}
        </Text>

        <Text style={styles.label}>Your feedback</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Describe your experience, issue, or idea..."
          placeholderTextColor={colors.placeholder}
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
          maxLength={2000}
        />
        <Text style={styles.charCount}>
          {message.trim().length}/{MIN_MESSAGE_LENGTH} min characters
        </Text>

        <PrimaryButton
          title={submitting ? 'Submitting...' : 'Submit Feedback'}
          variant="blue"
          style={styles.submit}
          onPress={submitting ? undefined : handleSubmit}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.inputBg,
  },
  body: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 100,
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodyBold,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: layout.pillRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  chipText: {
    ...typography.caption,
    color: colors.black,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.white,
  },
  stars: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  ratingHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  messageInput: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    padding: spacing.md,
    fontSize: 16,
    color: colors.black,
    backgroundColor: colors.white,
    lineHeight: 22,
  },
  charCount: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  submit: {
    marginTop: spacing.sm,
  },
});
