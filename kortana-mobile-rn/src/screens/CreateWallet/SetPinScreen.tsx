// src/screens/CreateWallet/SetPinScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@theme';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useWalletStore } from '@store/wallet.store';
import { KeychainService } from '@services/keychain.service';
import { WalletService } from '@services/wallet.service';

const { width } = Dimensions.get('window');

export const SetPinScreen = () => {
  const [pin, setPin] = useState('');
  const [step, setStep] = useState(1); // 1 = Set, 2 = Confirm
  const [tempPin, setTempPin] = useState('');
  
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { mnemonic } = route.params;

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      ReactNativeHapticFeedback.trigger('impactLight');

      if (newPin.length === 6) {
        if (step === 1) {
          setTimeout(() => {
            setStep(2);
            setTempPin(newPin);
            setPin('');
          }, 300);
        } else {
          if (newPin === tempPin) {
            completeWalletCreation();
          } else {
            ReactNativeHapticFeedback.trigger('notificationError');
            Alert.alert('PINs do not match', 'Please try again.');
            setPin('');
            setStep(1);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    ReactNativeHapticFeedback.trigger('impactLight');
  };

  const completeWalletCreation = async () => {
    try {
      // 1. Store mnemonic securely
      await KeychainService.setMnemonic(mnemonic);
      
      // 2. Derive first account
      const wallet = WalletService.fromMnemonic(mnemonic, 0);
      const account = {
        address: wallet.address,
        name: 'Account 1',
        isImported: false,
        index: 0,
      };

      // 3. Update Store
      const store = useWalletStore.getState();
      store.setMnemonic(mnemonic);
      store.setAccounts([account]);
      store.setActiveAccount(0);
      store.setLocked(false);

      // 4. Navigate to success or dashboard
      navigation.navigate('WalletReady', { address: wallet.address });
    } catch (error) {
      console.error('Failed to complete wallet creation:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const renderPinDots = () => {
    return (
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
    );
  };

  const renderNumPad = () => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
    return (
      <View style={styles.numPad}>
        {keys.map((key, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.key}
            onPress={() => key === '⌫' ? handleBackspace() : key !== '' && handleKeyPress(key)}
            disabled={key === ''}
          >
            {key === '⌫' ? (
                <Text style={styles.keyText}>⌫</Text>
            ) : (
                <Text style={styles.keyText}>{key}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Colors.gradientDark} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {step === 1 ? 'Create PIN' : 'Confirm PIN'}
          </Text>
          <Text style={styles.subtitle}>
            You'll use this PIN to unlock your wallet and confirm transactions.
          </Text>
        </View>

        {renderPinDots()}
        {renderNumPad()}
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
    paddingTop: 80,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    marginBottom: 60,
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
    textAlign: 'center',
    lineHeight: 22,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 80,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
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
