// src/screens/Swap/SwapScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  StatusBar,
  Dimensions
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme';
import { useNavigation } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { PinModal } from '@components/modals/PinModal';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

export const SwapScreen = () => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const navigation = useNavigation<any>();

  const tokenFrom = { symbol: 'KRT', name: 'Kortana', balance: '1,240.50' };
  const tokenTo = { symbol: 'USDT', name: 'Tether', balance: '500.00' };

  const handleSwap = () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    setPinVisible(true);
  };

  const executeSwap = () => {
    setPinVisible(false);
    setIsSwapping(true);
    ReactNativeHapticFeedback.trigger('impactHeavy');
    
    // Simulate API delay
    setTimeout(() => {
        setIsSwapping(false);
        Alert.alert('Success! 🎉', 'Your assets have been swapped successfully.', [
            { text: 'Done', onPress: () => navigation.navigate('Home') }
        ]);
    }, 2000);
  };

  const handleMax = () => {
    setFromAmount(tokenFrom.balance.replace(',', ''));
    ReactNativeHapticFeedback.trigger('impactLight');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Swap</Text>
        <TouchableOpacity style={styles.historyButton}>
            <Text style={styles.historyIcon}>🕒</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.swapBox}>
            {/* From Token */}
            <View style={styles.tokenInputContainer}>
                <View style={styles.tokenRow}>
                    <Text style={styles.tokenLabel}>From</Text>
                    <Text style={styles.tokenBalance}>Balance: {tokenFrom.balance}</Text>
                </View>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="0.0"
                        placeholderTextColor={Colors.grey400}
                        keyboardType="numeric"
                        value={fromAmount}
                        onChangeText={setFromAmount}
                    />
                    <TouchableOpacity style={styles.tokenSelector}>
                        <View style={styles.tokenIcon}>
                            <Text style={styles.tokenEmoji}>💎</Text>
                        </View>
                        <Text style={styles.tokenSymbol}>{tokenFrom.symbol}</Text>
                        <Text style={styles.chevron}>▾</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.maxBadge} onPress={handleMax}>
                    <Text style={styles.maxText}>MAX</Text>
                </TouchableOpacity>
            </View>

            {/* Swap Divider */}
            <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <TouchableOpacity style={styles.swapCircle} onPress={() => ReactNativeHapticFeedback.trigger('impactLight')}>
                    <Text style={styles.swapIcon}>⇅</Text>
                </TouchableOpacity>
                <View style={styles.dividerLine} />
            </View>

            {/* To Token */}
            <View style={styles.tokenInputContainer}>
                <View style={styles.tokenRow}>
                    <Text style={styles.tokenLabel}>To</Text>
                    <Text style={styles.tokenBalance}>Balance: {tokenTo.balance}</Text>
                </View>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="0.0"
                        placeholderTextColor={Colors.grey400}
                        keyboardType="numeric"
                        value={toAmount}
                        onChangeText={setToAmount}
                    />
                    <TouchableOpacity style={styles.tokenSelector}>
                        <View style={[styles.tokenIcon, { backgroundColor: '#26A17B' }]}>
                            <Text style={[styles.tokenEmoji, { fontSize: 14 }]}>$</Text>
                        </View>
                        <Text style={styles.tokenSymbol}>{tokenTo.symbol}</Text>
                        <Text style={styles.chevron}>▾</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>

        <View style={styles.infoCard}>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Exchange Rate</Text>
                <Text style={styles.infoValue}>1 KRT = 0.6621 USDT</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Slippage Tolerance</Text>
                <Text style={styles.infoValue}>0.5%</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Network Fee</Text>
                <Text style={styles.infoValue}>~$0.12</Text>
            </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.swapButton, (!fromAmount || isSwapping) && styles.disabledButton]} 
            onPress={handleSwap}
            disabled={!fromAmount || isSwapping}
        >
            <Text style={styles.swapButtonText}>{isSwapping ? 'Swapping...' : 'Swap Assets'}</Text>
        </TouchableOpacity>
      </View>

      <PinModal
        isVisible={pinVisible}
        onClose={() => setPinVisible(false)}
        onSuccess={executeSwap}
        title="Confirm Swap"
      />
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
  historyButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyIcon: {
    fontSize: 20,
  },
  content: {
    paddingHorizontal: Spacing['2xl'],
    flex: 1,
  },
  swapBox: {
    marginTop: Spacing.md,
  },
  tokenInputContainer: {
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  tokenLabel: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.grey500,
    textTransform: 'uppercase',
  },
  tokenBalance: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: Colors.grey400,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontDisplay,
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.grey900,
    padding: 0,
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Radius.full,
    ...Shadow.sm,
  },
  tokenIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.electricBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  tokenEmoji: {
    fontSize: 12,
  },
  tokenSymbol: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  chevron: {
    fontSize: 12,
    color: Colors.grey400,
    marginLeft: 4,
  },
  maxBadge: {
    position: 'absolute',
    right: 16,
    top: 50,
  },
  maxText: {
    color: Colors.electricBlue,
    fontFamily: Typography.fontPrimary,
    fontSize: 10,
    fontWeight: Typography.bold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: -12,
    zIndex: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'transparent',
  },
  swapCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
    borderWidth: 4,
    borderColor: Colors.white,
  },
  swapIcon: {
    fontSize: 18,
    color: Colors.electricBlue,
    fontWeight: 'bold',
  },
  infoCard: {
    marginTop: Spacing['2xl'],
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  infoLabel: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: Colors.grey500,
  },
  infoValue: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.grey900,
  },
  footer: {
    padding: Spacing['2xl'],
    paddingBottom: 40,
  },
  swapButton: {
    backgroundColor: Colors.electricBlue,
    height: 56,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
  },
  disabledButton: {
    opacity: 0.5,
  },
  swapButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
});
