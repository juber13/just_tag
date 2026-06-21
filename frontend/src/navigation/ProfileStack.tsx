import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { AppsLinksStoreScreen } from '../screens/stack/AppsLinksStoreScreen';
import { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="AppsLinksStore" component={AppsLinksStoreScreen} />
    </Stack.Navigator>
  );
}
