import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AUTH_ENABLED } from '../config/appConfig';
import { useAuth } from '../context/AuthContext';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user } = useAuth();
  const showMain = !AUTH_ENABLED || !!user;

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={showMain ? 'main' : 'auth'}
        screenOptions={{ headerShown: false }}
      >
        {showMain ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
