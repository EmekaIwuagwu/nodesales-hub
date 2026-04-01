// src/components/modals/GasModal.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions,
  TextInput
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const { height } = Dimensions.get('window');

interface GasModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (gas: string) => void;
}

export const GasModal: React.FC<GasModalProps> = ({ isVisible, onClose, onSave }) => {
  const [selectedSpeed, setSelectedSpeed] = useState('Standard');
  const [isCustom, setIsCustom] = useState(false);

  const gasOptions = [
    { name: 'Slow', time: '~5 min', fee: '0.0008 KRT' },
    { name: 'Standard', time: '~2 min', fee: '0.001 KRT' },
    { name: 'Fast', time: '<30 sec', fee: '0.0015 KRT' },
  ];

  const handleSelect = (name: string) => {
    setSelectedSpeed(name);
    setIsCustom(false);
    ReactNativeHapticFeedback.trigger('impactLight');
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} />
        <View style={styles.content}>
          <View style={styles.handle} />
          <Text style={styles.title}>Network Fee</Text>

          <View style={styles.optionsGrid}>
            {gasOptions.map((opt) => (
              <TouchableOpacity
                key={opt.name}
                style={[
                  styles.optionCard,
                  selectedSpeed === opt.name && styles.activeCard
                ]}
                onPress={() => handleSelect(opt.name)}
              >
                <Text style={[styles.optionName, selectedSpeed === opt.name && styles.activeText]}>
                    {opt.name === 'Slow' ? '🐢' : opt.name === 'Standard' ? '🚶' : '🚀'} {opt.name}
                </Text>
                <Text style={styles.optionTime}>{opt.time}</Text>
                <Text style={styles.optionFee}>{opt.fee}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.customToggle, isCustom && styles.activeCard]}
            onPress={() => {
                setIsCustom(true);
                setSelectedSpeed('Custom');
                ReactNativeHapticFeedback.trigger('impactLight');
            }}
          >
            <Text style={[styles.customText, isCustom && styles.activeText]}>⚙️ Custom Mode</Text>
          </TouchableOpacity>

          {isCustom && (
            <View style={styles.customContainer}>
                <View style={styles.customInputRow}>
                    <Text style={styles.customLabel}>Gas Limit</Text>
                    <TextInput 
                        style={styles.customInput} 
                        placeholder="21000" 
                        keyboardType="numeric" 
                        placeholderTextColor={Colors.grey400}
                    />
                </View>
                <View style={styles.customInputRow}>
                    <Text style={styles.customLabel}>Max Priority Fee (Gwei)</Text>
                    <TextInput 
                        style={styles.customInput} 
                        placeholder="1.5" 
                        keyboardType="numeric" 
                        placeholderTextColor={Colors.grey400}
                    />
                </View>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Fee</Text>
            <Text style={styles.totalValue}>0.001 KRT ≈ $0.08</Text>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={() => onSave(selectedSpeed)}>
            <Text style={styles.saveButtonText}>Save & Exit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  content: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    padding: Spacing['2xl'],
    paddingTop: Spacing.md,
    maxHeight: height * 0.8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.offWhite,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.grey900,
    marginBottom: Spacing.xl,
  },
  optionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  optionCard: {
    width: '31%',
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeCard: {
    borderColor: Colors.electricBlue,
    backgroundColor: Colors.snow,
  },
  optionName: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.grey600,
  },
  activeText: {
    color: Colors.electricBlue,
  },
  optionTime: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: Colors.grey500,
    marginTop: 4,
  },
  optionFee: {
    fontFamily: Typography.fontPrimary,
    fontSize: 10,
    color: Colors.grey900,
    marginTop: 8,
    fontWeight: 'bold',
  },
  customToggle: {
    padding: Spacing.md,
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  customText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.grey600,
  },
  customContainer: {
    marginTop: Spacing.xl,
  },
  customInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  customLabel: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey600,
  },
  customInput: {
    width: 120,
    height: 40,
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sm,
    color: Colors.grey900,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing['2xl'],
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.offWhite,
  },
  totalLabel: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey500,
  },
  totalValue: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  saveButton: {
    backgroundColor: Colors.electricBlue,
    borderRadius: Radius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.xl,
  },
  saveButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
});
