import type { NavigationProp, ParamListBase } from '@react-navigation/native';

export function navigateToActivateProduct(navigation: NavigationProp<ParamListBase>) {
  const state = navigation.getState();
  const routeNames = state?.routeNames ?? [];

  if (routeNames.includes('MenuTab')) {
    navigation.navigate('MenuTab', { screen: 'ActivateProduct' });
    return;
  }

  if (routeNames.includes('Tabs')) {
    navigation.navigate('Tabs', {
      screen: 'MenuTab',
      params: { screen: 'ActivateProduct' },
    });
    return;
  }

  const parent = navigation.getParent();
  if (parent) {
    navigateToActivateProduct(parent as NavigationProp<ParamListBase>);
  }
}
