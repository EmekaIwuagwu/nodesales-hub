// src/screens/Lock/LockScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
  StatusBar
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@theme';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useWalletStore } from '@store/wallet.store';
import { formatAddress } from '@utils/format';

const { width } = Dimensions.get('window');

export const LockScreen = () => {
  const [pin, setPin] = useState('');
  const { accounts, activeAccountIndex, setLocked } = useWalletStore();
  const activeAccount = accounts[activeAccountIndex];

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      ReactNativeHapticFeedback.trigger('impactLight');

      if (newPin.length === 6) {
        // In a real app, compare with stored hash or verify keychain
        // For this demo, we'll just unlock
        setTimeout(() => {
          setLocked(false);
        }, 200);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    ReactNativeHapticFeedback.trigger('impactLight');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={Colors.gradientDark} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
             <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.accountName}>{activeAccount?.name || 'My Wallet'}</Text>
          <Text style={styles.address}>{formatAddress(activeAccount?.address || '', 6)}</Text>
        </View>

        <View style={styles.pinContainer}>
          {[...Array(6)].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.pinDot, 
                pin.length > i && styles.pinDotFilled
              ]} 
            />
          ))}
        </View>

        <View style={styles.numPad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.key}
              onPress={() => key === '⌫' ? handleBackspace() : key !== '' && handleKeyPress(key)}
              disabled={key === ''}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
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
    paddingTop: 100,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  accountName: {
    color: Colors.white,
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  address: {
    color: Colors.grey400,
    fontFamily: Typography.fontMono,
    fontSize: Typography.xs,
    marginTop: 4,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 80,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 10,
  },
  pinDotFilled: {
    backgroundColor: Colors.electricBlue,
    borderColor: Colors.electricBlue,
  },
  numPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: width * 0.8,
    justifyContent: 'center',
  },
  key: {
    width: width * 0.22,
    height: width * 0.22,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  keyText: {
    color: Colors.white,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
  },
});
