// src/screens/ImportWallet/ImportWalletScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@theme';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '@components/atoms/Button';
import { WalletService } from '@services/wallet.service';
import { useNavigation } from '@react-navigation/native';
import { useWalletStore } from '@store/wallet.store';
import { KeychainService } from '@services/keychain.service';

export const ImportWalletScreen = () => {
  const [mnemonic, setMnemonic] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();

  const handleImport = async () => {
    const trimmedMnemonic = mnemonic.trim().toLowerCase();
    if (!WalletService.validateMnemonic(trimmedMnemonic)) {
      setError('Invalid recovery phrase. Please check for typos.');
      return;
    }

    navigation.navigate('SetPin', { mnemonic: trimmedMnemonic });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient colors={Colors.gradientDark} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Import Wallet</Text>
          <Text style={styles.subtitle}>
            Enter your 12 or 24-word secret recovery phrase to restore your wallet.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              multiline
              placeholder="word1 word2 word3..."
              placeholderTextColor={Colors.grey500}
              value={mnemonic}
              onChangeText={(text) => {
                setMnemonic(text);
                setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Secret phrases are never shared. They stay encrypted on your device.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button 
            title="Import Wallet" 
            onPress={handleImport}
            disabled={mnemonic.trim().split(' ').length < 12}
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
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
    marginBottom: Spacing['2xl'],
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.md,
    minHeight: 150,
  },
  input: {
    color: Colors.white,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    textAlignVertical: 'top',
    height: '100%',
  },
  errorText: {
    color: Colors.danger,
    marginTop: Spacing.sm,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
  },
  warningBox: {
    marginTop: Spacing['2xl'],
    padding: Spacing.md,
    backgroundColor: 'rgba(26, 111, 255, 0.1)',
    borderRadius: Radius.md,
  },
  warningText: {
    color: Colors.skyBlue,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: Spacing['2xl'],
    paddingBottom: 40,
  },
  backButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.grey400,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
  },
});
