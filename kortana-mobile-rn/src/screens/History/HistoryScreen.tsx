// src/screens/History/HistoryScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  SectionList,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@theme';
import { formatAddress } from '@utils/format';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useTransactionStore } from '@store/transaction.store';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

export const HistoryScreen = () => {
  const { transactions } = useTransactionStore();
  const [filter, setFilter] = React.useState<'ALL' | 'SENT' | 'RECEIVED'>('ALL');
  const navigation = useNavigation<any>();

  const filteredTransactions = transactions.filter(tx => 
    filter === 'ALL' || tx.type === filter
  );

  const groupTransactionsByDate = (txs: any[]) => {
    const groups: { [key: string]: any[] } = {};
    txs.forEach(tx => {
      const date = new Date(tx.timestamp).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
    });
    return Object.keys(groups).map(date => ({
      title: date,
      data: groups[date]
    }));
  };

  const sections = groupTransactionsByDate(filteredTransactions);

  const renderItem = ({ item }: { item: any }) => {
    const isPositive = item.type === 'RECEIVED';
    return (
        <TouchableOpacity 
          style={styles.itemContainer}
          onPress={() => {
            ReactNativeHapticFeedback.trigger('impactLight');
            Alert.alert('Transaction Detail', `Hash: ${item.hash}\nStatus: ${item.status}`);
          }}
        >
          <View style={[styles.iconContainer, { backgroundColor: isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }]}>
            <Text style={[styles.iconText, { color: isPositive ? Colors.success : Colors.danger }]}>
                {item.type === 'RECEIVED' ? '↙' : item.type === 'SENT' ? '↗' : '⇅'}
            </Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.typeText}>{item.type === 'SENT' ? 'Sent' : 'Received'}</Text>
            <Text style={styles.addressText}>{formatAddress(item.type === 'SENT' ? item.to : item.from, 6)}</Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={[styles.amountText, { color: isPositive ? Colors.success : Colors.grey900 }]}>
                {isPositive ? '+' : '-'}{item.value} {item.symbol}
            </Text>
            <Text style={styles.timeText}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.filterRow}>
        {(['ALL', 'SENT', 'RECEIVED'] as const).map((f) => (
            <TouchableOpacity 
                key={f} 
                style={[styles.filterTab, filter === f && styles.activeFilterTab]}
                onPress={() => {
                    ReactNativeHapticFeedback.trigger('selection');
                    setFilter(f);
                }}
            >
                <Text style={[styles.filterTabText, filter === f && styles.activeFilterTabText]}>
                    {f === 'ALL' ? 'All' : f === 'SENT' ? 'Sent' : 'Received'}
                </Text>
            </TouchableOpacity>
        ))}
      </View>
      
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.hash + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 40, marginBottom: 16 }}>📜</Text>
                <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing['2xl'],
    marginBottom: Spacing.lg,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.offWhite,
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: Colors.electricBlue,
  },
  filterTabText: {
    fontFamily: Typography.fontPrimary,
    fontSize: 12,
    fontWeight: Typography.bold,
    color: Colors.grey500,
  },
  activeFilterTabText: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  sectionTitle: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.grey500,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.offWhite,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  details: {
    flex: 1,
  },
  typeText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.grey900,
  },
  addressText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: Colors.grey500,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  timeText: {
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.xs,
    color: Colors.grey500,
    marginTop: 2,
  },
  emptyContainer: {
    padding: Spacing['3xl'],
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: Colors.grey400,
    fontFamily: Typography.fontPrimary,
    fontSize: Typography.base,
  },
});
