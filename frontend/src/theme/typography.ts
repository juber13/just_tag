import { TextStyle } from 'react-native';

export const typography = {
  title: {
    fontSize: 22,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  heading: {
    fontSize: 18,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  label: {
    fontSize: 14,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  brand: {
    fontSize: 24,
    fontWeight: '800' as TextStyle['fontWeight'],
    letterSpacing: 2,
  },
};
