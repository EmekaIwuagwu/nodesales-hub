// src/screens/Send/ConfirmTransactionScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  ScrollView,
  Dimensions
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme';
import { useRoute, useNavigation } from '@react-navigation/native';
import { formatAddress, formatCurrency } from '@utils/format';
import { GasModal } from '@components/modals/GasModal';
import { PinModal } from '@components/modals/PinModal';
import { useTransaction } from '@hooks/useTransaction';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

export const ConfirmTransactionScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { recipientAddress, amount, token } = route.params;
  const [gasVisible, setGasVisible] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const [selectedGas, setSelectedGas] = useState('Standard');
  const { sendTransaction, isSending } = useTransaction();

  const gasFee = '0.001'; // Mock gas fee until fee estimation is implemented

  const handleSend = () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    setPinVisible(true);
  };

  const executeTransaction = async () => {
    setPinVisible(false);
    ReactNativeHapticFeedback.trigger('impactHeavy');

    const hash = await sendTransaction({ to: recipientAddress, amount });

    if (hash) {
      Alert.alert('Success! 🎉', `Transaction sent!\n\nHash: ${formatAddress(hash, 10)}`, [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } else {
      Alert.alert('Transaction Failed', 'Could not send transaction. Check your balance and network.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} disabled={isSending}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Review</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.amountSummary}>
            <Text style={styles.sendingLabel}>Sending</Text>
            <Text style={styles.amountText}>{amount} {token.symbol}</Text>
            <Text style={styles.fiatText}>≈ ${((parseFloat(amount) || 0) * token.price).toFixed(2)}</Text>
        </View>

        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.label}>To</Text>
                <Text style={styles.value}>{formatAddress(recipientAddress, 8)}</Text>
            </View>
            <View style={[styles.row, styles.noBorder]}>
                <Text style={styles.label}>From</Text>
                <Text style={styles.value}>My Wallet (0x81...)</Text>
            </View>
        </View>

        <TouchableOpacity style={styles.gasCard} onPress={() => !isSending && setGasVisible(true)}>
            <View style={styles.gasHeader}>
                <Text style={styles.gasTitle}>Network Fee</Text>
                <Text style={styles.editLink}>Edit</Text>
            </View>
            <View style={styles.gasInfo}>
                <Text style={styles.gasSpeed}>🚀 {selectedGas}</Text>
                <Text style={styles.gasFee}>{gasFee} {token.symbol} ($0.08)</Text>
            </View>
        </TouchableOpacity>

        <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total (including fee)</Text>
            <Text style={styles.totalValue}>
                {(parseFloat(amount) + parseFloat(gasFee)).toFixed(4)} {token.symbol}
            </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.sendButton, isSending && styles.sendingButton]} 
            onPress={handleSend}
            disabled={isSending}
        >
            <LinearGradient
                colors={isSending ? ['#E0E0E0', '#BDBDBD'] : Colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendGradient}
            >
                {isSending ? (
                    <Text style={styles.sendText}>Processing...</Text>
                ) : (
                    <View style={styles.swipeContainer}>
                         <View style={styles.swipeIcon}>
                            <Text style={styles.arrowIcon}>→</Text>
                         </View>
                         <Text style={styles.sendText}>Confirm Transaction</Text>
                    </View>
                )}
            </LinearGradient>
        </TouchableOpacity>
      </View>

      <GasModal 
        isVisible={gasVisible} 
        onClose={() => setGasVisible(false)} 
        onSave={(gas) => {
            setSelectedGas(gas);
            setGasVisible(false);
        }}
      />

      <PinModal 
        isVisible={pinVisible}
        onClose={() => setPinVisible(false)}
        onSuccess={executeTransaction}
        title="Confirm Transaction"
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
  content: {
    paddingHorizontal: Spacing['2xl'],
  },
  amountSummary: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  sendingLabel: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey500,
  },
  amountText: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography['3xl'],
    fontWeight: Typography.extraBold,
    color: Colors.grey900,
    marginTop: 4,
  },
  fiatText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    color: Colors.grey500,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  label: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey500,
  },
  value: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  gasCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(26, 111, 255, 0.1)',
  },
  gasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gasTitle: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.grey600,
  },
  editLink: {
    color: Colors.electricBlue,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  gasInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gasSpeed: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey900,
    fontWeight: Typography.medium,
  },
  gasFee: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey900,
    fontWeight: Typography.bold,
  },
  totalBox: {
    marginTop: Spacing['2xl'],
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: Colors.grey500,
  },
  totalValue: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.grey900,
    marginTop: 4,
  },
  footer: {
    padding: Spacing['2xl'],
    paddingBottom: 40,
  },
  sendButton: {
    height: 64,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  sendingButton: {
    opacity: 0.8,
  },
  sendGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  swipeIcon: {
    position: 'absolute',
    left: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 24,
    color: Colors.white,
  },
  sendText: {
    color: Colors.white,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.extraBold,
    letterSpacing: 0.5,
  },
});
