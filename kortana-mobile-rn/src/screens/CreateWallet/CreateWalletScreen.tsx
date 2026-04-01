// src/screens/CreateWallet/CreateWalletScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '@components/atoms/Button';
import { WalletService } from '@services/wallet.service';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';

export const CreateWalletScreen = () => {
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const newMnemonic = WalletService.generateMnemonic(12);
    setMnemonic(newMnemonic.split(' '));
  }, []);

  const handleCopy = () => {
    Clipboard.setString(mnemonic.join(' '));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Colors.gradientDark} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Recovery Phrase</Text>
          <Text style={styles.subtitle}>
            This 12-word phrase is the master key to your wallet. Write it down and keep it in a safe place.
          </Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Never share your seed phrase. KortanaWallet staff will never ask for it.
            </Text>
          </View>

          <View style={styles.mnemonicGrid}>
            {mnemonic.map((word, index) => (
              <View key={index} style={styles.wordCell}>
                <Text style={styles.wordIndex}>{index + 1}</Text>
                <Text style={styles.wordText}>{word}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.copyButton} 
            onPress={handleCopy}
            activeOpacity={0.7}
          >
            <Text style={styles.copyButtonText}>
              {isCopied ? '✓ Copied to Clipboard' : '📋 Copy Phrase'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <Button 
            title="I've Saved It Securely" 
            onPress={() => {
                navigation.navigate('VerifyMnemonic', { mnemonic: mnemonic.join(' ') });
            }}
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
  },
  scrollContent: {
    padding: Spacing['2xl'],
    paddingTop: 80,
  },
  title: {
    color: Colors.white,
    fontFamily: Typography.fontDisplay,
    fontSize: Typography['3xl'],
    fontWeight: Typography.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.grey300,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  warningBox: {
    backgroundColor: 'rgba(255, 75, 125, 0.1)',
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  warningText: {
    color: Colors.danger,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    textAlign: 'center',
  },
  mnemonicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  wordCell: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  wordIndex: {
    color: Colors.electricBlue,
    fontFamily: Typography.fontMono,
    fontSize: Typography.xs,
    width: 20,
  },
  wordText: {
    color: Colors.white,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  copyButton: {
    alignSelf: 'center',
    padding: Spacing.md,
  },
  copyButtonText: {
    color: Colors.skyBlue,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
  },
  footer: {
    padding: Spacing['2xl'],
    paddingBottom: 40,
  },
});
