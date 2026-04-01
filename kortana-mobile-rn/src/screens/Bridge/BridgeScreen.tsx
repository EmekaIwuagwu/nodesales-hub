// src/screens/Bridge/BridgeScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  StatusBar,
  ScrollView,
  Dimensions
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme';
import { useNavigation } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { PinModal } from '@components/modals/PinModal';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

export const BridgeScreen = () => {
  const [amount, setAmount] = useState('');
  const [isBridging, setIsBridging] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const navigation = useNavigation<any>();

  const [fromNetwork, setFromNetwork] = useState({ name: 'Kortana Mainnet', symbol: 'KRT', color: Colors.electricBlue });
  const [toNetwork, setToNetwork] = useState({ name: 'Ethereum', symbol: 'ETH', color: '#627EEA' });

  const handleBridge = () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    setPinVisible(true);
  };

  const executeBridge = () => {
    setPinVisible(false);
    setIsBridging(true);
    ReactNativeHapticFeedback.trigger('impactHeavy');

    // Simulate bridge process
    setTimeout(() => {
        setIsBridging(false);
        Alert.alert('Bridge Initiated!', 'Your assets are being moved across chains. This may take 10-15 minutes.', [
            { text: 'Got it', onPress: () => navigation.navigate('Home') }
        ]);
    }, 2500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bridge</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.bridgeCard}>
            {/* From Network */}
            <TouchableOpacity style={styles.networkSelect}>
                <Text style={styles.label}>From Network</Text>
                <View style={styles.networkRow}>
                    <View style={[styles.activeDot, { backgroundColor: fromNetwork.color }]} />
                    <Text style={styles.networkName}>{fromNetwork.name}</Text>
                    <Text style={styles.chevron}>▾</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.arrowContainer}>
                <View style={styles.arrowLine} />
                <View style={styles.arrowCircle}>
                    <Text style={styles.arrowIcon}>↓</Text>
                </View>
                <View style={styles.arrowLine} />
            </View>

            {/* To Network */}
            <TouchableOpacity style={styles.networkSelect}>
                <Text style={styles.label}>To Network</Text>
                <View style={styles.networkRow}>
                    <View style={[styles.activeDot, { backgroundColor: toNetwork.color }]} />
                    <Text style={styles.networkName}>{toNetwork.name}</Text>
                    <Text style={styles.chevron}>▾</Text>
                </View>
            </TouchableOpacity>
        </View>

        <View style={styles.amountSection}>
            <Text style={styles.sectionLabel}>Select Asset & Amount</Text>
            <View style={styles.amountCard}>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="0.0"
                        placeholderTextColor={Colors.grey400}
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    <TouchableOpacity style={styles.tokenBadge}>
                        <Text style={styles.tokenText}>KRT</Text>
                        <Text style={styles.chevronSmall}>▾</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.balanceRow}>
                    <Text style={styles.fiatValue}>≈ $0.00</Text>
                    <Text style={styles.balanceText}>Balance: 1,240.50 KRT</Text>
                </View>
            </View>
        </View>

        <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Estimated Arrival</Text>
                <Text style={styles.summaryValue}>~10-15 Minutes</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Bridge Fee</Text>
                <Text style={styles.summaryValue}>0.5 KRT</Text>
            </View>
            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.summaryLabel}>You will receive</Text>
                <Text style={[styles.summaryValue, { color: Colors.success, fontWeight: 'bold' }]}>
                    {amount ? (Number(amount) - 0.5).toFixed(2) : '0.00'} KRT
                </Text>
            </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
            style={[styles.bridgeButton, (!amount || isBridging) && styles.disabledButton]} 
            onPress={handleBridge}
            disabled={!amount || isBridging}
        >
            <Text style={styles.bridgeButtonText}>{isBridging ? 'Bridging...' : 'Initiate Bridge'}</Text>
        </TouchableOpacity>
      </View>

      <PinModal
        isVisible={pinVisible}
        onClose={() => setPinVisible(false)}
        onSuccess={executeBridge}
        title="Confirm Bridge"
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
    paddingTop: Spacing.md,
  },
  bridgeCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  networkSelect: {
    paddingVertical: Spacing.sm,
  },
  label: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: Colors.grey500,
    marginBottom: 8,
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: Radius.lg,
    ...Shadow.sm,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  networkName: {
    flex: 1,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  chevron: {
    fontSize: 14,
    color: Colors.grey400,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  arrowLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    ...Shadow.sm,
  },
  arrowIcon: {
    color: Colors.electricBlue,
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountSection: {
    marginTop: Spacing['2xl'],
  },
  sectionLabel: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.grey900,
    marginBottom: Spacing.md,
  },
  amountCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
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
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    ...Shadow.sm,
  },
  tokenText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  chevronSmall: {
    fontSize: 10,
    color: Colors.grey400,
    marginLeft: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  fiatValue: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: Colors.grey500,
  },
  balanceText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: Colors.grey400,
  },
  summaryCard: {
    marginTop: Spacing['2xl'],
    backgroundColor: 'rgba(26, 111, 255, 0.03)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(26, 111, 255, 0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 111, 255, 0.05)',
  },
  summaryLabel: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: Colors.grey600,
  },
  summaryValue: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.grey900,
  },
  footer: {
    padding: Spacing['2xl'],
    paddingBottom: 40,
  },
  bridgeButton: {
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
  bridgeButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
});
