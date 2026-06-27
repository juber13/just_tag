import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../../theme';

type Props = {
  visible: boolean;
  checkoutUrl: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export function RazorpayCheckoutModal({ visible, checkoutUrl, onSuccess, onCancel }: Props) {
  const handleNavigation = (request: { url: string }) => {
    const { url } = request;
    if (url.startsWith('justtag://payment/success')) {
      onSuccess();
      return false;
    }
    if (url.startsWith('justtag://payment/cancelled')) {
      onCancel();
      return false;
    }
    return true;
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={styles.root}>
        <WebView
          source={{ uri: checkoutUrl }}
          onShouldStartLoadWithRequest={handleNavigation}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.black} />
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});
