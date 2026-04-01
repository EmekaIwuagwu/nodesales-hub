// src/screens/Send/SelectRecipientScreen.tsx
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
import Clipboard from '@react-native-clipboard/clipboard';

export const SelectRecipientScreen = () => {
  const [address, setAddress] = useState('');
  const navigation = useNavigation<any>();

  const handleNext = () => {
    if (address.length >= 40) {
      ReactNativeHapticFeedback.trigger('impactLight');
      navigation.navigate('SendAmount', { recipientAddress: address });
    }
  };

  const handlePaste = async () => {
    const text = await Clipboard.getString();
    if (text) {
        setAddress(text);
        ReactNativeHapticFeedback.trigger('impactLight');
    }
  };

  const handleScan = () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    navigation.navigate('Scanner', {
        onScan: (scannedAddress: string) => {
            setAddress(scannedAddress);
        }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Send to</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Recipient Address</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Public address (0x...) or ENS"
              placeholderTextColor={Colors.grey400}
              value={address}
              onChangeText={setAddress}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={handlePaste} style={styles.actionIconButton}>
              <Text style={styles.actionIconText}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleScan} style={styles.actionIconButton}>
              <Text style={styles.actionIconText}>📸</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Recipients</Text>
          <View style={styles.emptyRecent}>
            <Text style={styles.emptyText}>No recent recipients yet</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
          disabled={address.length < 40}
        >
          <LinearGradient
            colors={address.length < 40 ? ['#E0E0E0', '#BDBDBD'] : Colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.nextText}>Continue</Text>
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
  inputWrapper: {
    marginTop: Spacing.md,
  },
  label: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.grey900,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 60,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey900,
  },
  actionIconButton: {
    padding: 10,
    marginLeft: 4,
  },
  actionIconText: {
    fontSize: 18,
  },
  section: {
    marginTop: Spacing['3xl'],
  },
  sectionTitle: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.grey500,
    marginBottom: Spacing.md,
  },
  emptyRecent: {
    padding: Spacing['2xl'],
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.grey400,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
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
