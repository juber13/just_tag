import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreateAccountScreen } from '../screens/auth/CreateAccountScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
    </Stack.Navigator>
  );
}
