import { StyleSheet, TextStyle } from 'react-native';

export const Typography = StyleSheet.create({
  display4xl: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 36, lineHeight: 44, fontWeight: '700' } as TextStyle,
  heading2xl: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 24, lineHeight: 32, fontWeight: '600' } as TextStyle,
  bodyBase: { fontFamily: 'Inter-Regular', fontSize: 16, lineHeight: 24, fontWeight: '400' } as TextStyle,
  captionXs: { fontFamily: 'Inter-Medium', fontSize: 12, lineHeight: 16, fontWeight: '500' } as TextStyle,
});
