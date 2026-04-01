// src/screens/AddToken/AddTokenScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView 
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@theme';
import { useNavigation } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import LinearGradient from 'react-native-linear-gradient';
import { useTokenStore } from '@store/token.store';
import { useNetworkStore } from '@store/network.store';

export const AddTokenScreen = () => {
  const [address, setAddress] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState('');
  const navigation = useNavigation<any>();
  const { addToken } = useTokenStore();
  const { activeNetworkId } = useNetworkStore();

  const handleAdd = () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    addToken({
        address,
        symbol,
        decimals: parseInt(decimals, 10) || 18,
        name: symbol,
        networkId: activeNetworkId,
    });
    console.log('Token Added:', { address, symbol, decimals });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Custom Token</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contract Address</Text>
          <TextInput
            style={styles.input}
            placeholder="0x..."
            placeholderTextColor={Colors.grey400}
            value={address}
            onChangeText={setAddress}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2, marginRight: Spacing.md }]}>
                <Text style={styles.label}>Symbol</Text>
                <TextInput
                    style={styles.input}
                    placeholder="TKN"
                    placeholderTextColor={Colors.grey400}
                    value={symbol}
                    onChangeText={setSymbol}
                    autoCapitalize="characters"
                />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Decimals</Text>
                <TextInput
                    style={styles.input}
                    placeholder="18"
                    placeholderTextColor={Colors.grey400}
                    value={decimals}
                    onChangeText={setDecimals}
                    keyboardType="numeric"
                />
            </View>
        </View>

        <View style={styles.infoBox}>
            <Text style={styles.infoText}>
                ⚠️ Make sure you trust the token issuer. Anyone can create a token, including fake versions of existing tokens.
            </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.addButton, !address && styles.disabledButton]}
          onPress={handleAdd}
          disabled={!address}
        >
          <LinearGradient
            colors={!address ? ['#E0E0E0', '#BDBDBD'] : Colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.addText}>Add Token</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: Colors.grey900,
  },
  title: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  content: {
    paddingHorizontal: Spacing['2xl'],
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.grey900,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 56,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey900,
  },
  infoBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.md,
  },
  infoText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: Colors.grey500,
    lineHeight: 18,
  },
  footer: {
    padding: Spacing['2xl'],
    paddingBottom: 40,
  },
  addButton: {
    height: 56,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  addText: {
    color: Colors.white,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
});
