// src/screens/Send/SendAmountScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@theme';
import { useRoute, useNavigation } from '@react-navigation/native';
import { formatAddress } from '@utils/format';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export const SendAmountScreen = () => {
  const [amount, setAmount] = useState('');
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { recipientAddress } = route.params;
  
  const token = { symbol: 'KRT', balance: '1,240.50', price: 0.66 };

  const handleNext = () => {
    if (parseFloat(amount) > 0) {
      ReactNativeHapticFeedback.trigger('impactLight');
      navigation.navigate('ConfirmTransaction', { 
        recipientAddress, 
        amount,
        token 
      });
    }
  };

  const handleMax = () => {
    setAmount(token.balance.replace(',', ''));
    ReactNativeHapticFeedback.trigger('impactLight');
  };

  const handleKeyPress = (val: string) => {
    ReactNativeHapticFeedback.trigger('impactLight');
    if (val === '.' && amount.includes('.')) return;
    if (amount === '0' && val !== '.') {
      setAmount(val);
    } else {
      setAmount(amount + val);
    }
  };

  const handleBackspace = () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    setAmount(amount.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Amount</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.recipientBadge}>
        <Text style={styles.toLabel}>To: </Text>
        <Text style={styles.toAddress}>{formatAddress(recipientAddress, 10)}</Text>
      </View>

      <View style={styles.amountContainer}>
        <View style={styles.inputRow}>
            <Text style={[styles.amountText, amount === '' && styles.placeholderText]}>
                {amount === '' ? '0' : amount}
            </Text>
            <Text style={styles.symbolText}>{token.symbol}</Text>
        </View>
        <Text style={styles.fiatText}>≈ ${((parseFloat(amount) || 0) * token.price).toFixed(2)}</Text>
        
        <TouchableOpacity style={styles.maxBadge} onPress={handleMax}>
            <Text style={styles.maxText}>MAX: {token.balance} {token.symbol}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.numPad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((key) => (
            <TouchableOpacity 
                key={key} 
                style={styles.key} 
                onPress={() => key === '⌫' ? handleBackspace() : handleKeyPress(key)}
            >
                <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
          disabled={(parseFloat(amount) || 0) <= 0}
        >
          <LinearGradient
            colors={(parseFloat(amount) || 0) <= 0 ? ['#E0E0E0', '#BDBDBD'] : Colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.nextText}>Review Transaction</Text>
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
  recipientBadge: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: Colors.offWhite,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    marginBottom: Spacing.xl,
  },
  toLabel: {
    color: Colors.grey500,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
  },
  toAddress: {
    color: Colors.grey900,
    fontFamily: Typography.fontMono,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  amountContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountText: {
    fontFamily: Typography.fontDisplay,
    fontSize: 56,
    fontWeight: Typography.extraBold,
    color: Colors.grey900,
  },
  placeholderText: {
    color: Colors.grey200,
  },
  symbolText: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.electricBlue,
    marginLeft: 8,
  },
  fiatText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.lg,
    color: Colors.grey500,
    marginTop: 8,
  },
  maxBadge: {
    marginTop: Spacing.xl,
    backgroundColor: 'rgba(26, 111, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  maxText: {
    color: Colors.electricBlue,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  numPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: width,
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginBottom: 40,
  },
  key: {
    width: width * 0.28,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  keyText: {
    fontFamily: Typography.fontPrimary,
    fontSize: 28,
    color: Colors.grey900,
    fontWeight: Typography.medium,
  },
  footer: {
    padding: Spacing['2xl'],
    paddingBottom: 40,
  },
  nextButton: {
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
  nextText: {
    color: Colors.white,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
});
