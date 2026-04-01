// src/screens/CreateWallet/WalletReadyScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@theme';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '@components/atoms/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatAddress } from '@utils/format';
import { useWalletStore } from '@store/wallet.store';

export const WalletReadyScreen = () => {
  const route = useRoute<any>();
  const { address } = route.params;
  const { setOnboarded } = useWalletStore();

  const handleFinish = () => {
    setOnboarded(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={Colors.gradientDark} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
             <Text style={styles.emoji}>🎉</Text>
          </View>
          
          <Text style={styles.title}>Wallet Ready!</Text>
          <Text style={styles.subtitle}>
            Your Kortana wallet has been created successfully. You can now send, receive and manage your assets.
          </Text>

          <View style={styles.addressCard}>
            <Text style={styles.addressLabel}>Your Wallet Address</Text>
            <Text style={styles.addressText}>{address}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button 
            title="Go to Dashboard" 
            onPress={handleFinish}
          />
        </View>
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
    padding: Spacing['2xl'],
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(26, 111, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emoji: {
    fontSize: 60,
  },
  title: {
    color: Colors.white,
    fontFamily: Typography.fontDisplay,
    fontSize: Typography['4xl'],
    fontWeight: Typography.bold,
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: Colors.grey300,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  addressCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  addressLabel: {
    color: Colors.grey400,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    marginBottom: 8,
  },
  addressText: {
    color: Colors.electricBlue,
    fontFamily: Typography.fontMono,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  footer: {
    paddingBottom: 40,
  },
});
