// src/screens/Receive/ReceiveScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity,
  Dimensions,
  Share
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme';
import QRCode from 'react-native-qrcode-svg';
import { useWalletStore } from '@store/wallet.store';
import { formatAddress } from '@utils/format';
import Clipboard from '@react-native-clipboard/clipboard';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const { width } = Dimensions.get('window');

export const ReceiveScreen = () => {
  const { accounts, activeAccountIndex } = useWalletStore();
  const activeAccount = accounts[activeAccountIndex];
  const address = activeAccount?.address || '0x0000000000000000000000000000000000000000';

  const handleCopy = () => {
    Clipboard.setString(address);
    ReactNativeHapticFeedback.trigger('impactLight');
    // Success toast could go here
  };

  const handleShare = async () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    try {
      await Share.share({
        message: address,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Receive</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Scan address to receive payment</Text>
        
        <View style={styles.qrCard}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={address}
              size={width * 0.55}
              color={Colors.grey900}
              backgroundColor={Colors.white}
              logo={require('@assets/images/logo-icon.png')} // Optional logo
              logoSize={50}
              logoBackgroundColor="transparent"
            />
          </View>
          
          <View style={styles.addressBox}>
            <Text style={styles.addressText}>{address}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
                <View style={styles.iconCircle}>
                    <Text style={styles.actionIcon}>📄</Text>
                </View>
                <Text style={styles.actionLabel}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <View style={styles.iconCircle}>
                    <Text style={styles.actionIcon}>📤</Text>
                </View>
                <Text style={styles.actionLabel}>Share</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.warningBox}>
            <Text style={styles.warningText}>
                Send only native assets and tokens compatible with this network.
            </Text>
        </View>
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
    paddingBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  subtitle: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey500,
    marginBottom: Spacing['3xl'],
  },
  qrCard: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    ...Shadow.lg,
    width: width * 0.8,
  },
  qrWrapper: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
  },
  addressBox: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.offWhite,
    padding: Spacing.md,
    borderRadius: Radius.md,
    width: '100%',
  },
  addressText: {
    fontFamily: Typography.fontMono,
    fontSize: Typography.xs,
    color: Colors.grey600,
    textAlign: 'center',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing['3xl'],
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    marginHorizontal: Spacing['2xl'],
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionLabel: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  warningBox: {
    marginTop: 60,
    padding: Spacing.md,
    backgroundColor: '#FFF8E1',
    borderRadius: Radius.md,
    width: '100%',
  },
  warningText: {
    color: '#F57C00',
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
