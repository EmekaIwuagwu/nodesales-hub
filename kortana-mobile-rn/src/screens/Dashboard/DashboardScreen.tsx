// src/screens/Dashboard/DashboardScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme';
import LinearGradient from 'react-native-linear-gradient';
import { useWalletStore } from '@store/wallet.store';
import { useNetworkStore } from '@store/network.store';
import { formatAddress, formatCurrency } from '@utils/format';
import { FlashList } from '@shopify/flash-list';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useNavigation } from '@react-navigation/native';
import { useBalance } from '@hooks/useBalance';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTokenStore } from '@store/token.store';
import { useTransactionStore } from '@store/transaction.store';

const { width } = Dimensions.get('window');

const MOCK_ASSETS = [
  { id: '1', name: 'Kortana', symbol: 'KRT', balance: '1,240.50', value: 824.00, change: '+2.4%', isUp: true, color: Colors.electricBlue, icon: '💎' },
  { id: '2', name: 'Ethereum', symbol: 'ETH', balance: '0.45', value: 1240.20, change: '-1.2%', isUp: false, color: '#627EEA', icon: 'Ξ' },
  { id: '3', name: 'USDT', symbol: 'USDT', balance: '500.00', value: 500.00, change: '0.0%', isUp: true, color: '#26A17B', icon: '$' },
];

export const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { accounts, activeAccountIndex } = useWalletStore();
  const { networks, activeNetworkId } = useNetworkStore();
  const { customTokens } = useTokenStore();
  const { transactions } = useTransactionStore();
  const { balance, isLoading, refresh } = useBalance();
  const [refreshing, setRefreshing] = React.useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = React.useState(true);
  
  const activeAccount = accounts[activeAccountIndex];
  const activeNetwork = networks.find(n => n.id === activeNetworkId);

  // Merge mock assets with custom tokens
  const assets = [
    { id: 'native', name: activeNetwork?.name || 'Kortana', symbol: activeNetwork?.symbol || 'KRT', balance: balance, value: (Number(balance.replace(',', '')) * 0.66), change: '+2.4%', isUp: true, isNative: true, color: activeNetwork?.color || Colors.electricBlue, icon: '💎' },
    ...MOCK_ASSETS.filter(a => a.symbol !== (activeNetwork?.symbol || 'KRT')),
    ...customTokens.filter(t => t.networkId === activeNetworkId).map(t => ({
        id: t.address,
        name: t.name,
        symbol: t.symbol,
        balance: '0.00', // Mock balance for now
        value: 0.00,
        change: '0.0%',
        isUp: true,
        isNative: false
    }))
  ];

  const handleCopy = () => {
    if (activeAccount?.address) {
      Clipboard.setString(activeAccount.address);
      ReactNativeHapticFeedback.trigger('impactLight');
    }
  };

  const handleAction = (type: string) => {
    ReactNativeHapticFeedback.trigger('impactLight');
    if (type === 'Send') navigation.navigate('Send');
    else if (type === 'Receive') navigation.navigate('Receive');
    else if (type === 'Swap') navigation.navigate('Swap');
    else if (type === 'NFTs') navigation.navigate('NFTGallery');
    else if (type === 'Connect') navigation.navigate('Scanner');
    console.log('Action:', type);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    ReactNativeHapticFeedback.trigger('impactLight');
    await refresh();
    setRefreshing(false);
  };

  const renderTransactionItem = ({ item }: { item: any }) => {
    const isSent = item.type === 'SENT';
    return (
      <TouchableOpacity 
        style={styles.activityRow}
        onPress={() => navigation.navigate('History')}
      >
        <View style={[styles.activityIcon, { backgroundColor: isSent ? 'rgba(244, 67, 54, 0.08)' : 'rgba(76, 175, 80, 0.08)' }]}>
           <Text style={[styles.activityIconText, { color: isSent ? Colors.danger : Colors.success }]}>
            {isSent ? '↗' : '↙'}
          </Text>
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityType}>{isSent ? 'Sent' : 'Received'} {item.symbol}</Text>
          <Text style={styles.activityTime}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <View style={styles.activityAmount}>
          <Text style={[styles.activityValue, { color: isSent ? Colors.grey900 : Colors.success }]}>
            {isSent ? '-' : '+'}{item.value}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: isSent ? Colors.offWhite : 'rgba(76, 175, 80, 0.1)' }]}>
            <Text style={[styles.statusText, { color: isSent ? Colors.grey500 : Colors.success }]}>{item.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAssetItem = ({ item }: { item: any }) => {
    const isNative = item.id === 'native';
    return (
      <TouchableOpacity
        style={styles.assetRow}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('TokenDetail', { token: item })}
      >
        <View style={[styles.assetIconPlaceholder, { backgroundColor: item.color || Colors.offWhite }]}>
          <Text style={[styles.assetSymbolText, { color: item.color ? Colors.white : Colors.grey900 }]}>
            {item.icon || item.symbol[0]}
          </Text>
        </View>
        <View style={styles.assetInfo}>
          <Text style={styles.assetName}>{item.name}</Text>
          <View style={styles.changeRow}>
            <Text style={[styles.assetChangeBase, item.isUp ? styles.assetUp : styles.assetDown]}>
              {item.isUp ? '↗' : '↘'} {item.change}
            </Text>
          </View>
        </View>
        <View style={styles.assetBalanceInfo}>
          <Text style={styles.assetBalance}>{item.balance} {item.symbol}</Text>
          <Text style={styles.assetValue}>{formatCurrency(item.value)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor={Colors.electricBlue}
            />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>☰</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.networkBadge}
              onPress={() => navigation.navigate('NetworkSelect')}
            >
              <View style={[styles.networkDot, { backgroundColor: activeNetwork?.color || Colors.electricBlue }]} />
              <Text style={styles.networkName}>{activeNetwork?.name || 'Kortana'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>🔔</Text>
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={Colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroGlow} />
            <View style={styles.portfolioHeader}>
                <Text style={styles.portfolioLabel}>Total Balance</Text>
                <TouchableOpacity onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
                    <Text style={styles.eyeIcon}>{isBalanceVisible ? '👁️' : '🕶️'}</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.portfolioValue}>
              {isLoading ? '...' : isBalanceVisible ? `${balance} ${activeNetwork?.symbol || 'KRT'}` : '••••••••'}
            </Text>
            <View style={styles.changeBadge}>
              <Text style={styles.changeText}>Native Asset Balance</Text>
            </View>

            <View style={styles.addressRow}>
              <Text style={styles.addressText}>{formatAddress(activeAccount?.address || '', 8)}</Text>
              <TouchableOpacity style={styles.copyBadge} onPress={handleCopy}>
                <Text style={styles.copyText}>COPY</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.actionRow}>
            {[
              { label: 'Send', icon: '↑' },
              { label: 'Receive', icon: '↓' },
              { label: 'Swap', icon: '↕' },
              { label: 'Connect', icon: '🔌' },
              { label: 'NFTs', icon: '🖼️' },
            ].map((action, i) => (
              <TouchableOpacity key={i} style={styles.actionItem} onPress={() => handleAction(action.label)}>
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Assets</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddToken')}>
              <Text style={styles.addToken}>+ Add Token</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            <FlashList
              {...({
                data: assets,
                renderItem: renderAssetItem,
                estimatedItemSize: 72,
                keyExtractor: (item: any) => item.id
              } as any)}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {transactions.length > 0 ? (
                <FlashList
                    {...({
                        data: transactions.slice(0, 5),
                        renderItem: renderTransactionItem,
                        estimatedItemSize: 60,
                        keyExtractor: (item: any) => item.hash
                    } as any)}
                />
            ) : (
                <View style={styles.emptyActivity}>
                    <Text style={styles.emptyText}>No recent transactions</Text>
                </View>
            )}
          </View>
        </View>
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
    backgroundColor: Colors.white,
    paddingBottom: Spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  networkName: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  heroCard: {
    width: '100%',
    borderRadius: Radius['2xl'],
    padding: Spacing['2xl'],
    overflow: 'hidden',
    ...Shadow.lg,
  },
  heroGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  portfolioLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  eyeIcon: {
    fontSize: 16,
    opacity: 0.8,
  },
  portfolioValue: {
    color: Colors.white,
    fontFamily: Typography.fontDisplay,
    fontSize: Typography['4xl'],
    fontWeight: Typography.extraBold,
    marginTop: 4,
  },
  changeBadge: {
    marginTop: 8,
  },
  changeText: {
    color: Colors.success,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  addressText: {
    color: Colors.white,
    fontFamily: Typography.fontMono,
    fontSize: Typography.xs,
  },
  copyBadge: {
    marginLeft: 8,
  },
  copyText: {
    color: Colors.white,
    fontFamily: Typography.fontPrimary,
    fontSize: 10,
    fontWeight: Typography.bold,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.electricBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Shadow.sm,
  },
  actionIcon: {
    fontSize: 24,
    color: Colors.white,
  },
  actionLabel: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.grey900,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  addToken: {
    color: Colors.electricBlue,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
  },
  viewAll: {
    color: Colors.electricBlue,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
  },
  listContainer: {
    minHeight: 200,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.offWhite,
  },
  assetIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  assetSymbolText: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  assetChangeBase: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    marginTop: 2,
  },
  assetUp: {
    color: Colors.success,
  },
  assetDown: {
    color: Colors.danger,
  },
  assetBalanceInfo: {
    alignItems: 'flex-end',
  },
  assetBalance: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  assetValue: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: Colors.grey500,
    marginTop: 2,
  },
  emptyActivity: {
    padding: Spacing['2xl'],
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.lg,
  },
  emptyText: {
    color: Colors.grey400,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
  },
  activityList: {
    minHeight: 100,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.offWhite,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  activityIconText: {
    fontSize: 18,
    fontWeight: Typography.bold,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  activityTime: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: Colors.grey500,
    marginTop: 2,
  },
  activityAmount: {
    alignItems: 'flex-end',
  },
  activityValue: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  statusText: {
    fontFamily: Typography.fontPrimary,
    fontSize: 10,
    fontWeight: Typography.bold,
    textTransform: 'uppercase',
  },
});
