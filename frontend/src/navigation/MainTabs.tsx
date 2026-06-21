import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomTabBar } from '../components/navigation/CustomTabBar';
import { AnalyticsScreen } from '../screens/main/AnalyticsScreen';
import { ShareScreen } from '../screens/stack/ShareScreen';
import { ContactsStack } from './ContactsStack';
import { MenuStack } from './MenuStack';
import { ProfileStack } from './ProfileStack';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
      <Tab.Screen name="ContactsTab" component={ContactsStack} />
      <Tab.Screen name="ShareTab" component={ShareScreen} />
      <Tab.Screen name="AnalyticsTab" component={AnalyticsScreen} />
      <Tab.Screen name="MenuTab" component={MenuStack} />
    </Tab.Navigator>
  );
}
