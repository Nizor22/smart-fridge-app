import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, Easing } from 'react-native-reanimated';

export default function AnimatedScreenWrapper({ children, style, ...props }: ViewProps) {
  return (
    <Animated.View
      entering={FadeInRight.duration(320).easing(Easing.out(Easing.cubic))}
      exiting={FadeOutLeft.duration(240).easing(Easing.in(Easing.cubic))}
      style={[{ flex: 1, backgroundColor: '#0F172A' }, style]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
