import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SignaturePreviewScreen } from '../screens/stack/SignaturePreviewScreen';
import { MainStackParamList } from './types';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="SignaturePreview" component={SignaturePreviewScreen} />
    </Stack.Navigator>
  );
}
