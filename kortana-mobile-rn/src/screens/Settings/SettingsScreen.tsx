// src/screens/Settings/SettingsScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Linking,
  Alert
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@theme';
import { useWalletStore } from '@store/wallet.store';
import { useNavigation } from '@react-navigation/native';
import { PinModal } from '@components/modals/PinModal';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { KeychainService } from '@services/keychain.service';

interface SettingItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  color?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, label, value, onPress, color = Colors.grey900 }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemLeft}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
    <View style={styles.itemRight}>
      {value && <Text style={styles.value}>{value}</Text>}
      <Text style={styles.arrow}>›</Text>
    </View>
  </TouchableOpacity>
);

export const SettingsScreen = () => {
  const { resetWallet } = useWalletStore();
  const navigation = useNavigation<any>();
  const [pinMode, setPinMode] = React.useState<'BACKUP' | 'CHANGE_OLD' | 'CHANGE_NEW' | null>(null);
  const [pinVisible, setPinVisible] = React.useState(false);

  const handleBackup = () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    setPinMode('BACKUP');
    setPinVisible(true);
  };

  const handleChangePin = () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    setPinMode('CHANGE_OLD');
    setPinVisible(true);
  };

  const onPinSuccess = () => {
    if (pinMode === 'BACKUP') {
        setPinVisible(false);
        setPinMode(null);
        navigation.navigate('BackupMnemonic');
    } else if (pinMode === 'CHANGE_OLD') {
        setPinMode('CHANGE_NEW');
        // Keep visible, title will change
    } else if (pinMode === 'CHANGE_NEW') {
        setPinVisible(false);
        setPinMode(null);
        Alert.alert('Success', 'Your security PIN has been updated.');
    }
  };

  const handleLogout = () => {
    ReactNativeHapticFeedback.trigger('notificationWarning');
    Alert.alert(
      'Reset Wallet',
      'Are you sure you want to reset your wallet? This will PERMANENTLY delete your secret recovery phrase from this device. Make sure you have it backed up.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
             await KeychainService.clearMnemonic();
             resetWallet();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <SettingItem icon="🔐" label="Secret Recovery Phrase" onPress={handleBackup} />
            <SettingItem icon="🔌" label="Connections" value="WalletConnect" onPress={() => navigation.navigate('WalletConnect')} />
            <SettingItem icon="📱" label="Change PIN" onPress={handleChangePin} />
            <SettingItem icon="🕵️" label="Privacy Mode" value="Enabled" onPress={() => console.log('Privacy')} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingItem icon="💵" label="Currency" value="USD ($)" onPress={() => console.log('Currency')} />
            <SettingItem icon="🌐" label="Language" value="English" onPress={() => console.log('Language')} />
            <SettingItem icon="🎨" label="Theme" value="Arctic Flow" onPress={() => console.log('Theme')} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <SettingItem icon="📖" label="Documentation" onPress={() => Linking.openURL('https://docs.kortana.network')} />
            <SettingItem icon="💬" label="Join Discord" onPress={() => Linking.openURL('https://discord.gg/kortana')} />
            <SettingItem icon="⭐" label="Rate App" onPress={() => console.log('Rate')} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Reset Wallet</Text>
        </TouchableOpacity>

        <Text style={styles.version}>KortanaWallet v0.0.1 Alpha</Text>
      </ScrollView>

      <PinModal
        isVisible={pinVisible}
        onClose={() => {
            setPinVisible(false);
            setPinMode(null);
        }}
        onSuccess={onPinSuccess}
        title={
            pinMode === 'CHANGE_OLD' ? 'Enter Old PIN' : 
            pinMode === 'CHANGE_NEW' ? 'Enter New PIN' : 
            'Verify Identity'
        }
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
    paddingBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 120,
  },
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.grey500,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    marginLeft: Spacing.sm,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey400,
    marginRight: 8,
  },
  arrow: {
    fontSize: 20,
    color: Colors.grey300,
  },
  logoutButton: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
    alignItems: 'center',
  },
  logoutText: {
    color: Colors.danger,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  version: {
    textAlign: 'center',
    marginTop: Spacing['3xl'],
    color: Colors.grey300,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
  },
});
