// src/screens/Network/NetworkScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView 
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@theme';
import { useNetworkStore } from '@store/network.store';
import { useNavigation } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export const NetworkScreen = () => {
  const { networks, activeNetworkId, setActiveNetwork } = useNetworkStore();
  const navigation = useNavigation<any>();

  const handleNetworkSelect = (id: string) => {
    ReactNativeHapticFeedback.trigger('impactLight');
    setActiveNetwork(id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Networks</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {networks.map((network) => {
          const isActive = network.id === activeNetworkId;
          return (
            <TouchableOpacity 
              key={network.id} 
              style={[styles.networkCard, isActive && styles.activeCard]}
              onPress={() => handleNetworkSelect(network.id)}
            >
              <View style={[styles.dot, { backgroundColor: network.color }]} />
              <View style={styles.networkInfo}>
                <Text style={styles.networkName}>{network.name}</Text>
                <Text style={styles.networkDetails}>Chain ID: {network.chainId}</Text>
              </View>
              {isActive && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  scrollContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 40,
  },
  networkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeCard: {
    borderColor: Colors.electricBlue,
    backgroundColor: Colors.white,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  networkInfo: {
    flex: 1,
  },
  networkName: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  networkDetails: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: Colors.grey500,
    marginTop: 2,
  },
  activeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.electricBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
