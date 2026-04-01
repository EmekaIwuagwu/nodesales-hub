// src/screens/WalletConnect/WalletConnectScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity, 
  FlatList, 
  Image 
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Alert } from 'react-native';

const MOCK_SESSIONS = [
  {
    id: '1',
    name: 'Uniswap',
    url: 'https://app.uniswap.org',
    icon: '🦄',
    connectedAt: '2 hours ago'
  },
  {
    id: '2',
    name: 'OpenSea',
    url: 'https://opensea.io',
    icon: '🌊',
    connectedAt: 'Yesterday'
  }
];

export const WalletConnectScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { uri } = route.params || {};

  React.useEffect(() => {
    if (uri) {
        handleNewConnection(uri);
    }
  }, [uri]);

  const handleNewConnection = (connectionUri: string) => {
    ReactNativeHapticFeedback.trigger('impactLight');
    Alert.alert(
        'New Connection Request',
        'A DApp is requesting to connect to your wallet. Do you want to approve this connection?',
        [
            { text: 'Reject', style: 'cancel' },
            { 
                text: 'Approve', 
                onPress: () => {
                    ReactNativeHapticFeedback.trigger('notificationSuccess');
                    Alert.alert('Success', 'Connected to DApp successfully!');
                    // In a real app, we would register the session with the WalletConnect provider
                }
            }
        ]
    );
  };

  const renderSession = ({ item }: { item: typeof MOCK_SESSIONS[0] }) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionLeft}>
        <View style={styles.iconContainer}>
          <Text style={styles.sessionIcon}>{item.icon}</Text>
        </View>
        <View style={styles.sessionDetails}>
          <Text style={styles.sessionName}>{item.name}</Text>
          <Text style={styles.sessionUrl}>{item.url}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.disconnectButton}
        onPress={() => ReactNativeHapticFeedback.trigger('impactLight')}
      >
        <Text style={styles.disconnectText}>Disconnect</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Connections</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoBanner}>
          <Text style={styles.infoTitle}>WalletConnect</Text>
          <Text style={styles.infoSubtitle}>Connect your wallet to decentralized apps securely.</Text>
          <TouchableOpacity 
            style={styles.newConnectionBtn}
            onPress={() => navigation.navigate('Scanner')}
          >
            <Text style={styles.newConnectionText}>+ New Connection</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Active Sessions</Text>
        <FlatList
          data={MOCK_SESSIONS}
          renderItem={renderSession}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔌</Text>
              <Text style={styles.emptyText}>No active sessions</Text>
            </View>
          }
        />
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
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  infoBanner: {
    backgroundColor: 'rgba(26, 111, 255, 0.05)',
    padding: Spacing.xl,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
    borderWidth: 1,
    borderColor: 'rgba(26, 111, 255, 0.1)',
  },
  infoTitle: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.electricBlue,
  },
  infoSubtitle: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey500,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: Spacing.xl,
  },
  newConnectionBtn: {
    backgroundColor: Colors.electricBlue,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    borderRadius: Radius.full,
    ...Shadow.sm,
  },
  newConnectionText: {
    color: Colors.white,
    fontFamily: Typography.fontPrimary,
    fontWeight: Typography.bold,
    fontSize: Typography.sm,
  },
  sectionTitle: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.grey900,
    marginBottom: Spacing.md,
  },
  list: {
    paddingBottom: 40,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.offWhite,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    marginBottom: Spacing.md,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    ...Shadow.sm,
  },
  sessionIcon: {
    fontSize: 24,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionName: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  sessionUrl: {
    fontFamily: Typography.fontPrimary,
    fontSize: 10,
    color: Colors.grey500,
    marginTop: 2,
  },
  disconnectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  disconnectText: {
    color: Colors.danger,
    fontFamily: Typography.fontPrimary,
    fontSize: 10,
    fontWeight: Typography.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    color: Colors.grey400,
  },
});
