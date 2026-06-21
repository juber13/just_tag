import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ContactsScreen } from '../screens/main/ContactsScreen';
import { EditContactScreen } from '../screens/stack/EditContactScreen';
import { ContactsStackParamList } from './types';

const Stack = createNativeStackNavigator<ContactsStackParamList>();

export function ContactsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ContactsMain" component={ContactsScreen} />
      <Stack.Screen name="EditContact" component={EditContactScreen} />
    </Stack.Navigator>
  );
}
