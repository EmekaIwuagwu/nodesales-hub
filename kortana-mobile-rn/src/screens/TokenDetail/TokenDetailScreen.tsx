// src/screens/TokenDetail/TokenDetailScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { formatCurrency } from '@utils/format';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export const TokenDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { token } = route.params || { 
    token: { name: 'Kortana', symbol: 'KRT', balance: '1,240.50', value: 824.00, change: '+2.4%', isUp: true } 
  };
  const [activeFilter, setActiveFilter] = React.useState('1D');

  const CHART_DATA: Record<string, number[]> = {
    '1H': [0.8, 0.75, 0.85, 0.8, 0.9, 0.85, 0.95, 0.9, 0.95, 0.9, 0.98, 1],
    '1D': [0.4, 0.35, 0.45, 0.4, 0.55, 0.5, 0.7, 0.65, 0.8, 0.75, 0.9, 1],
    '1W': [0.6, 0.5, 0.7, 0.4, 0.5, 0.8, 0.6, 0.9, 0.7, 0.5, 0.8, 0.6],
    '1M': [0.3, 0.4, 0.3, 0.5, 0.4, 0.6, 0.5, 0.7, 0.6, 0.8, 0.7, 0.9],
    '1Y': [0.2, 0.3, 0.5, 0.4, 0.6, 0.8, 0.7, 0.9, 0.8, 1, 0.9, 0.8],
    'ALL': [0.1, 0.2, 0.3, 0.5, 0.4, 0.6, 0.7, 0.8, 0.9, 0.8, 0.9, 1],
  };

  const handleFilterChange = (filter: string) => {
    ReactNativeHapticFeedback.trigger('selection');
    setActiveFilter(filter);
  };

  const handleAction = (action: string) => {
    ReactNativeHapticFeedback.trigger('impactLight');
    if (action === 'Send') navigation.navigate('Send', { token });
    else if (action === 'Receive') navigation.navigate('Receive', { token });
    else if (action === 'Swap') navigation.navigate('Swap', { token });
    console.log('Token Action:', action);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.tokenTitleContainer}>
            <Text style={styles.tokenName}>{token.name}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.hero}>
          <View style={styles.tokenIconPlaceholder}>
            <Text style={styles.tokenEmoji}>💎</Text>
          </View>
          <Text style={styles.balanceText}>{token.balance} {token.symbol}</Text>
          <Text style={styles.valueText}>{formatCurrency(token.value)}</Text>
          <View style={[styles.changeBadge, { backgroundColor: token.isUp ? Colors.successLight : Colors.dangerLight }]}>
            <Text style={[styles.changeText, { color: token.isUp ? Colors.success : Colors.danger }]}>
                {token.change} Today
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
            {[
                { label: 'Send', icon: '↑' },
                { label: 'Receive', icon: '↓' },
                { label: 'Swap', icon: '↕' },
            ].map((action, i) => (
                <TouchableOpacity key={i} style={styles.actionButton} onPress={() => handleAction(action.label)}>
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
            ))}
        </View>

        <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartPrice}>${(token.value / parseFloat(token.balance.replace(',', ''))).toFixed(2)}</Text>
                <Text style={[styles.chartStatus, { color: token.isUp ? Colors.success : Colors.danger }]}>
                    {token.isUp ? '▲' : '▼'} {token.change}
                </Text>
            </View>
            <View style={styles.chartContainer}>
                {CHART_DATA[activeFilter].map((h, i) => (
                    <View key={i} style={styles.barWrapper}>
                        <LinearGradient
                            colors={token.isUp ? ['#00D4A0', 'rgba(0, 212, 160, 0.1)'] : ['#FF4B7D', 'rgba(255, 75, 125, 0.1)']}
                            style={[styles.bar, { height: 120 * h }]}
                        />
                    </View>
                ))}
            </View>
            <View style={styles.timeFilter}>
                {['1H', '1D', '1W', '1M', '1Y', 'ALL'].map((f) => (
                    <TouchableOpacity 
                        key={f} 
                        style={[styles.filterBtn, f === activeFilter && styles.filterBtnActive]}
                        onPress={() => handleFilterChange(f)}
                    >
                        <Text style={[styles.filterText, f === activeFilter && styles.filterTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Market Stats</Text>
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Market Cap</Text>
                    <Text style={styles.statValue}>$1.2B</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Volume (24h)</Text>
                    <Text style={styles.statValue}>$45.8M</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Circulating Supply</Text>
                    <Text style={styles.statValue}>18.5M {token.symbol}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>All Time High</Text>
                    <Text style={styles.statValue}>$1.45</Text>
                </View>
            </View>
        </View>

        <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No recent transactions for this asset</Text>
                <TouchableOpacity style={styles.viewExplorerBtn}>
                    <Text style={styles.viewExplorerText}>View on Explorer</Text>
                </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: Colors.grey900,
  },
  tokenTitleContainer: {
    alignItems: 'center',
  },
  tokenName: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  tokenIconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  tokenEmoji: {
    fontSize: 40,
  },
  balanceText: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography['3xl'],
    fontWeight: Typography.extraBold,
    color: Colors.grey900,
  },
  valueText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.lg,
    color: Colors.grey500,
    marginTop: 4,
  },
  changeBadge: {
    marginTop: Spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  changeText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    marginBottom: Spacing['3xl'],
  },
  actionButton: {
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
  },
  actionIcon: {
    fontSize: 24,
    color: Colors.electricBlue,
    marginBottom: 4,
  },
  actionLabel: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.grey900,
  },
  chartCard: {
    marginHorizontal: Spacing['2xl'],
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadow.sm,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.xl,
  },
  chartPrice: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  chartStatus: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
  chartContainer: {
    height: 140,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 1,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  timeFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  filterBtnActive: {
    backgroundColor: Colors.electricBlue,
  },
  filterText: {
    fontFamily: Typography.fontPrimary,
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.grey500,
  },
  filterTextActive: {
    color: Colors.white,
  },
  statsSection: {
    paddingHorizontal: Spacing['2xl'],
    marginTop: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  statItem: {
    width: '48%',
    backgroundColor: Colors.offWhite,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  statLabel: {
    fontFamily: Typography.fontPrimary,
    fontSize: 10,
    color: Colors.grey500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  historySection: {
    paddingHorizontal: Spacing['2xl'],
    marginTop: Spacing.xl,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: Typography.fontDisplay,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.grey900,
    marginBottom: Spacing.md,
  },
  emptyState: {
    padding: Spacing['3xl'],
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.lg,
  },
  emptyText: {
    color: Colors.grey400,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    textAlign: 'center',
  },
  viewExplorerBtn: {
    marginTop: Spacing.lg,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.electricBlue,
  },
  viewExplorerText: {
    color: Colors.electricBlue,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
  },
});
