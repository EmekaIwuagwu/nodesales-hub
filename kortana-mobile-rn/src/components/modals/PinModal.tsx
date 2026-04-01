// src/components/modals/PinModal.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions,
  Alert
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@theme';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const { height, width } = Dimensions.get('window');

interface PinModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

export const PinModal: React.FC<PinModalProps> = ({ isVisible, onClose, onSuccess, title = 'Enter PIN' }) => {
  const [pin, setPin] = useState('');

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      ReactNativeHapticFeedback.trigger('impactLight');

      if (newPin.length === 6) {
        // In a real app, compare with stored hash. 
        // For now, any 6-digit PIN works or add basic logic.
        setTimeout(() => {
            onSuccess();
            setPin('');
        }, 500);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    ReactNativeHapticFeedback.trigger('impactLight');
  };

  const renderPinDots = () => (
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

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Confirm your action with your PIN</Text>

          {renderPinDots()}

          <View style={styles.numPad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.key}
                onPress={() => key === '⌫' ? handleBackspace() : key !== '' && handleKeyPress(key)}
                disabled={key === ''}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    padding: Spacing['2xl'],
    alignItems: 'center',
    height: height * 0.8,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeText: {
    fontSize: 20,
    color: Colors.grey500,
  },
  title: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.grey900,
    marginTop: Spacing.xl,
  },
  subtitle: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey500,
    marginTop: 8,
    marginBottom: Spacing['2xl'],
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.grey200,
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
    width: width * 0.2,
    height: width * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.offWhite,
  },
  keyText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
});
