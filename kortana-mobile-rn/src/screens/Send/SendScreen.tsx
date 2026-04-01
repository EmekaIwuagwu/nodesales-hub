// src/screens/Send/SendScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Colors, Typography, Spacing } from '@theme';
import LinearGradient from 'react-native-linear-gradient';

export const SendScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Send Assets</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholder}>Recipient & Amount selection coming soon.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  placeholder: {
    color: Colors.grey400,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    textAlign: 'center',
  },
});
