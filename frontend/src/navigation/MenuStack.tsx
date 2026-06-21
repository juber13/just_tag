import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MenuScreen } from '../screens/main/MenuScreen';
import { MenuDetailScreen } from '../screens/stack/MenuDetailScreen';
import { ShareFeedbackScreen } from '../screens/stack/ShareFeedbackScreen';
import { MenuStackParamList } from './types';

const Stack = createNativeStackNavigator<MenuStackParamList>();

export function MenuStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MenuMain" component={MenuScreen} />
      <Stack.Screen name="MenuDetail" component={MenuDetailScreen} />
      <Stack.Screen name="ShareFeedback" component={ShareFeedbackScreen} />
    </Stack.Navigator>
  );
}
