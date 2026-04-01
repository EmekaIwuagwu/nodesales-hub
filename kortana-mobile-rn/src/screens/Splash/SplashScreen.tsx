// src/screens/Splash/SplashScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Colors, Typography } from '@theme';
import LinearGradient from 'react-native-linear-gradient';

export const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={Colors.gradientDark}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>KORTANA</Text>
          <Text style={styles.subtitle}>WALLET</Text>
        </View>
        <Text style={styles.version}>v1.0.0</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: Colors.white,
    fontFamily: Typography.fontDisplay,
    fontSize: Typography['4xl'],
    fontWeight: Typography.extraBold,
    letterSpacing: 8,
  },
  subtitle: {
    color: Colors.skyBlue,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    letterSpacing: 4,
    marginTop: 8,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    color: Colors.grey400,
    fontFamily: Typography.fontMono,
    fontSize: Typography.xs,
  },
});
